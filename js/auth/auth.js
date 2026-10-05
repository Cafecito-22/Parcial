import { sql, verificarConexion } from "../config/neon-config.js";

function normalizarUsuario(usuario){
  if(!usuario) return null;
  return {...usuario, rol: usuario.rol || "cliente"};
}

export async function registrarUsuario(nombre, correo, contrasena){
  verificarConexion();
  const filas = await sql`
    INSERT INTO usuarios (nombre, correo, contrasena, rol)
    VALUES (${nombre}, ${correo}, ${contrasena}, 'cliente')
    RETURNING id, nombre, correo, rol;
  `;
  const usuario = normalizarUsuario(filas[0]);
  sessionStorage.setItem("usuario", JSON.stringify(usuario));
  return usuario;
}

export async function iniciarSesion(correo, contrasena){
  verificarConexion();
  const filas = await sql`
    SELECT id, nombre, correo, COALESCE(rol, 'cliente') AS rol
    FROM usuarios
    WHERE LOWER(correo) = LOWER(${correo}) AND contrasena = ${contrasena}
    LIMIT 1;
  `;
  if(filas.length === 0) return null;
  const usuario = normalizarUsuario(filas[0]);
  sessionStorage.setItem("usuario", JSON.stringify(usuario));
  return usuario;
}

export function obtenerUsuario(){
  const dato = sessionStorage.getItem("usuario");
  if(!dato) return null;
  try{return normalizarUsuario(JSON.parse(dato));}catch{return null;}
}

export function destinoPorRol(usuario){
  if(!usuario) return "login.html";
  return usuario.rol === "administrador" || usuario.rol === "empleado" ? "panel.html" : "cuenta.html";
}

export function exigirSesion(rolesPermitidos=[]){
  const usuario = obtenerUsuario();
  if(!usuario){
    const retorno = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    location.href = `login.html?retorno=${retorno}`;
    return null;
  }
  if(rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)){
    location.href = destinoPorRol(usuario);
    return null;
  }
  return usuario;
}

export function cerrarSesion(){
  sessionStorage.removeItem("usuario");
  location.href = "login.html";
}
