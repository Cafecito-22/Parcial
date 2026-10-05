import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion(["cliente"]);
if(usuario) document.getElementById("nombre-sesion").textContent = usuario.nombre;
document.getElementById("boton-cerrar-sesion")?.addEventListener("click", cerrarSesion);
const id = Number(new URLSearchParams(location.search).get("id"));
const formulario = document.getElementById("form-actualizar");

async function cargar(){
  const mensaje = document.getElementById("mensaje-actualizar");
  if(!Number.isInteger(id) || id <= 0){
    mensaje.textContent = "No se indicó una solicitud válida.";
    mensaje.className = "mensaje error";
    formulario.classList.add("oculto");
    return;
  }
  const filas = await sql`
    SELECT id, codigo_seguimiento, nombre_contribuyente, ruc, correo, estado
    FROM solicitudes_clave_sol
    WHERE id = ${id} AND id_usuario = ${usuario.id}
    LIMIT 1;
  `;
  if(!filas.length){
    mensaje.textContent = "La solicitud no existe o no pertenece a tu cuenta.";
    mensaje.className = "mensaje error";
    formulario.classList.add("oculto");
    return;
  }
  const fila = filas[0];
  document.getElementById("codigo").textContent = fila.codigo_seguimiento;
  document.getElementById("estado").textContent = fila.estado;
  if(fila.estado !== "registrado"){
    mensaje.textContent = "Esta solicitud ya fue revisada y ahora es de solo lectura.";
    mensaje.className = "mensaje error";
    formulario.classList.add("oculto");
    return;
  }
  document.getElementById("nombre").value = fila.nombre_contribuyente || "";
  document.getElementById("ruc").value = fila.ruc || "";
  document.getElementById("correo").value = fila.correo || "";
}

formulario?.addEventListener("submit", async evento => {
  evento.preventDefault();
  const mensaje = document.getElementById("mensaje-actualizar");
  const datos = new FormData(evento.currentTarget);
  const nombre = String(datos.get("nombre")||"").trim();
  const ruc = String(datos.get("ruc")||"").trim();
  const correo = String(datos.get("correo")||"").trim().toLowerCase();
  if(nombre.length < 3 || !/^\d{11}$/.test(ruc) || !correo.includes("@")){
    mensaje.textContent = "Revisa los datos antes de guardar.";
    mensaje.className = "mensaje error";
    return;
  }
  const resultado = await sql`
    UPDATE solicitudes_clave_sol
    SET nombre_contribuyente = ${nombre}, ruc = ${ruc}, correo = ${correo}
    WHERE id = ${id} AND id_usuario = ${usuario.id} AND estado = 'registrado'
    RETURNING id;
  `;
  if(!resultado.length){
    mensaje.textContent = "La solicitud ya no puede modificarse.";
    mensaje.className = "mensaje error";
    return;
  }
  mensaje.textContent = "Cambios guardados correctamente.";
  mensaje.className = "mensaje ok";
  setTimeout(() => location.href = "consulta.html", 650);
});

cargar().catch(error => {
  const mensaje = document.getElementById("mensaje-actualizar");
  mensaje.textContent = error.message;
  mensaje.className = "mensaje error";
});
