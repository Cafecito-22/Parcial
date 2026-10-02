import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual, randomBytes, randomUUID, scryptSync } from 'node:crypto';
const roles=['cliente','administrador','empleado'];
function fallo(mensaje,estado=400){const e=new Error(mensaje);e.estado=estado;throw e;}
function firma(texto,secreto){return createHmac('sha256',secreto).update(texto).digest('base64url');}
export function crearToken(id,secreto){const contenido=Buffer.from(JSON.stringify({id,exp:Date.now()+8*3600000})).toString('base64url');return contenido+'.'+firma(contenido,secreto);}
export function leerToken(token,secreto){try{const [contenido,mac]=token.split('.');const esperado=firma(contenido,secreto);if(!mac||mac.length!==esperado.length||!timingSafeEqual(Buffer.from(mac),Buffer.from(esperado)))return null;const dato=JSON.parse(Buffer.from(contenido,'base64url'));return Number.isSafeInteger(dato.id)&&dato.id>0&&dato.exp>Date.now()?dato.id:null;}catch{return null;}}
export function hashClave(clave){const sal=randomBytes(16).toString('hex');return 'scrypt$'+sal+'$'+scryptSync(clave,sal,64).toString('hex');}
export function verificarClave(clave,guardada){if(typeof guardada!=='string')return false;if(!guardada.startsWith('scrypt$')){const a=Buffer.from(clave),b=Buffer.from(guardada);return a.length===b.length&&timingSafeEqual(a,b);}try{const [,sal,hash]=guardada.split('$');const a=scryptSync(clave,sal,64),b=Buffer.from(hash,'hex');return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}}
function texto(v,min,max){if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)fallo('Revisa los datos ingresados.');return v.trim();}
function correo(v){const c=texto(v,3,120).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c))fallo('Correo inválido.');return c;}
function clave(v){if(typeof v!=='string'||v.length<4||v.length>120)fallo('La contraseña debe tener de 4 a 120 caracteres.');return v;}
export function validarSolicitud(b){const nombre=texto(b.nombre_contribuyente,3,120),ruc=texto(b.ruc,11,11),email=correo(b.correo);if(!/^\d{11}$/.test(ruc))fallo('El RUC debe tener 11 dígitos.');return {nombre,ruc,correo:email};}
function idSolicitud(v){if(!Number.isSafeInteger(v)||v<=0)fallo('Solicitud inválida.');return v;}
function estado(v){if(!['registrado','atendido','rechazado'].includes(v))fallo('Estado inválido.');return v;}
export function crearHandler(sql,secreto){return async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método no permitido.'});
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Origen no permitido.'});}catch{return res.status(403).json({error:'Origen no permitido.'});}}
 try{
 const b=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!b||typeof b.accion!=='string')fallo('Petición inválida.');
 const cookie=(valor,maxAge)=>res.setHeader('Set-Cookie',`sunat_sesion=${valor}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
 if(b.accion==='cerrarSesion'){cookie('',0);return res.status(200).json({ok:true});}
 if(b.accion==='registrarUsuario'){
 const nombre=texto(b.nombre,3,120),email=correo(b.correo),hash=hashClave(clave(b.contrasena));
 await sql`INSERT INTO usuarios(nombre,correo,contrasena,rol) VALUES (${nombre},${email},${hash},'cliente')`;
 return res.status(200).json({ok:true});
 }
 if(b.accion==='iniciarSesion'){
 const email=correo(b.correo),password=clave(b.contrasena);
 const filas=await sql`SELECT id,nombre,correo,rol,contrasena FROM usuarios WHERE correo=${email} LIMIT 1`;
 if(!filas.length||!verificarClave(password,filas[0].contrasena)){cookie('',0);return res.status(200).json({usuario:null});}
 const u=filas[0];if(!roles.includes(u.rol))fallo('Rol inválido.',403);
 if(!u.contrasena.startsWith('scrypt$')){const hash=hashClave(password);await sql`UPDATE usuarios SET contrasena=${hash} WHERE id=${u.id} AND contrasena=${u.contrasena}`;}
 cookie(crearToken(u.id,secreto),28800);return res.status(200).json({usuario:{id:u.id,nombre:u.nombre,correo:u.correo,rol:u.rol}});
 }
 const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('sunat_sesion='))?.slice(13);
 const id=leerToken(token||'',secreto);if(!id)fallo('Inicia sesión nuevamente para continuar.',401);
 const usuarios=await sql`SELECT id,rol FROM usuarios WHERE id=${id}`;const u=usuarios[0];if(!u||!roles.includes(u.rol))fallo('Sesión inválida.',401);
 const esPanel=['administrador','empleado'].includes(u.rol);let filas;
 if(['misSolicitudes','miSolicitud','crearSolicitud','actualizarPropia'].includes(b.accion)){
 if(u.rol!=='cliente')fallo('Acceso solo para clientes.',403);
 if(b.accion==='misSolicitudes')filas=await sql`SELECT * FROM solicitudes_clave_sol WHERE id_usuario=${u.id} ORDER BY id DESC`;
 if(b.accion==='miSolicitud'){const sid=idSolicitud(b.id);filas=await sql`SELECT * FROM solicitudes_clave_sol WHERE id=${sid} AND id_usuario=${u.id} AND estado='registrado'`;}
 if(b.accion==='crearSolicitud'){const d=validarSolicitud(b),codigo='SOL-'+randomUUID();filas=await sql`INSERT INTO solicitudes_clave_sol(codigo_seguimiento,nombre_contribuyente,ruc,correo,id_usuario,estado) VALUES (${codigo},${d.nombre},${d.ruc},${d.correo},${u.id},'registrado') RETURNING codigo_seguimiento`;}
 if(b.accion==='actualizarPropia'){const sid=idSolicitud(b.id),d=validarSolicitud(b);filas=await sql`UPDATE solicitudes_clave_sol SET nombre_contribuyente=${d.nombre},ruc=${d.ruc},correo=${d.correo} WHERE id=${sid} AND id_usuario=${u.id} AND estado='registrado' RETURNING id`;}
 }else if(['listarTodos','crearPanel','actualizarPanel','eliminarPanel'].includes(b.accion)){
 if(!esPanel)fallo('Acceso denegado al panel.',403);
 if(b.accion==='listarTodos')filas=await sql`SELECT * FROM solicitudes_clave_sol ORDER BY id DESC`;
 if(b.accion==='crearPanel'){const d=validarSolicitud(b),e=estado(b.estado),codigo='SOL-'+randomUUID();filas=await sql`INSERT INTO solicitudes_clave_sol(codigo_seguimiento,nombre_contribuyente,ruc,correo,estado) VALUES (${codigo},${d.nombre},${d.ruc},${d.correo},${e}) RETURNING id`;}
 if(b.accion==='actualizarPanel'){const sid=idSolicitud(b.id),d=validarSolicitud(b),e=estado(b.estado);filas=await sql`UPDATE solicitudes_clave_sol SET nombre_contribuyente=${d.nombre},ruc=${d.ruc},correo=${d.correo},estado=${e} WHERE id=${sid} RETURNING id`;}
 if(b.accion==='eliminarPanel'){const sid=idSolicitud(b.id);filas=await sql`DELETE FROM solicitudes_clave_sol WHERE id=${sid} RETURNING id`;}
 }else fallo('Operación desconocida.');
 return res.status(200).json(filas);
 }catch(e){const codigo=e.code||e.cause?.code;const mensaje=codigo==='23505'?'Ese correo o código ya está registrado.':e.estado?e.message:'No se pudo completar la operación en la base de datos.';return res.status(e.estado|| (codigo==='23505'?409:500)).json({error:mensaje});}
};}
export default async function handler(req,res){const cadena=process.env.DATABASE_URL;if(!cadena){res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'La conexión de la web está pendiente de configuración en Vercel.'});}return crearHandler(neon(cadena),process.env.SESSION_SECRET||createHmac('sha256',cadena).update('sunat-session-v1').digest('hex'))(req,res);}
