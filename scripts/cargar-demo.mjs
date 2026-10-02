import {neon} from '@neondatabase/serverless';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {hashClave} from '../api/sunat.js';
export async function cargarDemo(sql){
 const cuentas=Array.from({length:10},(_,i)=>({nombre:'Cliente '+(i+1),correo:`cliente${i+1}@sunat-demo.example`,rol:'cliente',turno:null}));
 cuentas.push({nombre:'Administrador de prueba',correo:'admin@sunat-demo.example',rol:'administrador',turno:null},...['manana','tarde','noche'].map((turno,i)=>({nombre:'Empleado '+(i+1),correo:`empleado${i+1}@sunat-demo.example`,rol:'empleado',turno})));
 const operaciones=[];for(const c of cuentas){c.clave=randomBytes(15).toString('base64url');const hash=hashClave(c.clave);operaciones.push(sql`INSERT INTO usuarios(nombre,correo,contrasena,rol,turno) VALUES (${c.nombre},${c.correo},${hash},${c.rol},${c.turno}) ON CONFLICT (correo) DO NOTHING`);}
 await sql.transaction(operaciones);
 await sql`INSERT INTO solicitudes_clave_sol(id_usuario,codigo_seguimiento,nombre_contribuyente,ruc,correo,estado)
 SELECT u.id,'SOL-DEMO-'||u.id||'-'||s,u.nombre||' / Solicitud '||s,'20'||lpad(u.id::text,9,'0'),u.correo,
 CASE WHEN s=1 THEN 'registrado' WHEN s=2 THEN 'atendido' ELSE 'rechazado' END
 FROM usuarios u CROSS JOIN generate_series(1,3) s
 WHERE u.correo IN (SELECT 'cliente'||n||'@sunat-demo.example' FROM generate_series(1,10) n)
 AND NOT EXISTS(SELECT 1 FROM solicitudes_clave_sol r WHERE r.codigo_seguimiento='SOL-DEMO-'||u.id||'-'||s)`;
 return cuentas;
}
if(process.argv[1]?.endsWith('cargar-demo.mjs')){
 if(!process.env.DATABASE_URL||!process.env.CREDENCIALES_ARCHIVO)throw new Error('Configura DATABASE_URL y CREDENCIALES_ARCHIVO en privado.');
 const cuentas=await cargarDemo(neon(process.env.DATABASE_URL));
 writeFileSync(process.env.CREDENCIALES_ARCHIVO,JSON.stringify(cuentas,null,2));
 console.log('Carga terminada. Las claves generadas son válidas únicamente para cuentas nuevas. No se modificaron cuentas existentes.');
}
