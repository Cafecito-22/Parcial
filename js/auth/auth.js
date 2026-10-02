import { api } from '../config/neon-config.js';
export async function registrarUsuario(nombre,correo,contrasena){await api('registrarUsuario',{nombre,correo,contrasena});}
export async function iniciarSesion(correo,contrasena){
 const resultado=await api('iniciarSesion',{correo,contrasena});
 if(!resultado.usuario)return null;
 sessionStorage.setItem('usuario',JSON.stringify(resultado.usuario));return resultado.usuario;
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

export async function cerrarSesion(){
  try { await api("cerrarSesion"); } catch { /* Se limpia también la sesión visual. */ }
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
