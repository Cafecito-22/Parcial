import { sql, verificarConexion } from "../config/neon-config.js";

export async function registrarUsuario(nombre, correo, contrasena){
  verificarConexion();
  await sql`INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (${nombre}, ${correo}, ${contrasena}, 'cliente')`;
}

export async function iniciarSesion(correo, contrasena){
  verificarConexion();
  const filas = await sql`
    SELECT id, nombre, correo, rol FROM usuarios
    WHERE correo = ${correo} AND contrasena = ${contrasena}
    LIMIT 1;
  `;
  if(filas.length === 0) return null;
  sessionStorage.setItem("usuario", JSON.stringify(filas[0]));
  return filas[0];
}

export function obtenerUsuario(){
  const dato = sessionStorage.getItem("usuario");
  try { const u = dato ? JSON.parse(dato) : null; return u && Number.isInteger(u.id) && ["cliente","administrador","empleado"].includes(u.rol) ? u : null; } catch { sessionStorage.removeItem("usuario"); return null; }
}

export function exigirSesion(){
  const usuario = obtenerUsuario();
  if(!usuario){
    const retorno = encodeURIComponent(location.pathname.split("/").pop() || "clave-sol.html");
    location.href = `login.html?retorno=${retorno}`;
    return null;
  }
  return usuario;
}

export function cerrarSesion(){
  sessionStorage.removeItem("usuario");
  location.href = "login.html";
}


export function exigirRol(roles){
 const u=exigirSesion();
 if(!u) return null;
 if(!roles.includes(u.rol)){ location.href=u.rol==='cliente'?'consulta.html':'panel.html'; return null; }
 document.getElementById('nombre-sesion')?.replaceChildren(document.createTextNode(`${u.nombre} (${u.rol})`));
 document.getElementById('boton-cerrar-sesion')?.addEventListener('click',cerrarSesion);
 return u;
}
