import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion(["administrador","empleado"]);
const esAdmin = usuario?.rol === "administrador";
const body = document.body;
body.classList.add(esAdmin ? "modo-admin" : "modo-empleado");

document.getElementById("nombre-panel").textContent = usuario.nombre;
document.getElementById("correo-panel").textContent = usuario.correo;
document.getElementById("rol-panel").textContent = esAdmin ? "Jefe / Administrador" : "Trabajador / Empleado";
document.getElementById("titulo-panel").textContent = esAdmin ? "Panel de jefatura" : "Bandeja de revisión";
document.getElementById("descripcion-panel").textContent = esAdmin ? "Control total de las solicitudes registradas en el sistema." : "Revisa solicitudes, verifica sus datos y actualiza únicamente su estado.";
document.getElementById("imagen-rol").src = esAdmin ? "img/jefatura-sunat.jpg" : "img/equipo-sunat.jpg";
document.getElementById("texto-lateral").textContent = esAdmin ? "Puedes crear, editar y eliminar solicitudes, además de controlar su estado." : "Tu función es revisar la información enviada por los contribuyentes. No puedes crear ni eliminar solicitudes.";
document.querySelectorAll(".solo-admin").forEach(elemento => elemento.classList.toggle("oculto", !esAdmin));
document.getElementById("permiso-crear").className = `permiso ${esAdmin ? "si" : "no"}`;
document.getElementById("permiso-crear").textContent = esAdmin ? "Crear solicitudes" : "No crear solicitudes";
document.getElementById("permiso-editar").className = `permiso ${esAdmin ? "si" : "no"}`;
document.getElementById("permiso-editar").textContent = esAdmin ? "Editar todos los datos" : "Solo revisar y cambiar estado";
document.getElementById("permiso-eliminar").className = `permiso ${esAdmin ? "si" : "no"}`;
document.getElementById("permiso-eliminar").textContent = esAdmin ? "Eliminar solicitudes" : "No eliminar solicitudes";
document.getElementById("boton-cerrar-sesion")?.addEventListener("click", cerrarSesion);

function escapar(valor){
  return String(valor ?? "").replace(/[&<>"']/g, caracter => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[caracter]));
}

function etiquetaEstado(estado){
  const valor = estado || "registrado";
  return `<span class="estado estado-${escapar(valor)}">${escapar(valor.replace("_"," "))}</span>`;
}

let registros = [];

async function listar(){
  const tbody = document.getElementById("tabla-panel");
  try{
    registros = await sql`
      SELECT id, id_usuario, codigo_seguimiento, nombre_contribuyente, ruc, correo, estado, fecha_registro
      FROM solicitudes_clave_sol
      ORDER BY fecha_registro DESC NULLS LAST, id DESC;
    `;
    document.getElementById("stat-total").textContent = registros.length;
    document.getElementById("stat-registrado").textContent = registros.filter(r => r.estado === "registrado").length;
    document.getElementById("stat-atendido").textContent = registros.filter(r => r.estado === "atendido").length;
    document.getElementById("stat-rechazado").textContent = registros.filter(r => r.estado === "rechazado").length;
    if(!registros.length){
      tbody.innerHTML = `<tr><td colspan="7" class="vacio">No hay solicitudes registradas.</td></tr>`;
      return;
    }
    tbody.innerHTML = registros.map(fila => {
      const acciones = esAdmin
        ? `<div class="acciones-tabla"><button class="boton boton-claro boton-mini" data-editar="${fila.id}">Editar</button><button class="boton boton-peligro boton-mini" data-eliminar="${fila.id}">Eliminar</button></div>`
        : `<button class="boton boton-secundario boton-mini" data-revisar="${fila.id}">Revisar</button>`;
      return `<tr><td><strong>${escapar(fila.codigo_seguimiento)}</strong></td><td>${escapar(fila.nombre_contribuyente)}</td><td>${escapar(fila.ruc)}</td><td>${escapar(fila.correo)}</td><td>${etiquetaEstado(fila.estado)}</td><td>${fila.fecha_registro ? new Date(fila.fecha_registro).toLocaleDateString("es-PE") : "-"}</td><td>${acciones}</td></tr>`;
    }).join("");
  }catch(error){
    tbody.innerHTML = `<tr><td colspan="7" class="vacio">${escapar(error.message)}</td></tr>`;
  }
}

function abrirModal(id){document.getElementById(id).classList.remove("oculto")}
function cerrarModal(id){document.getElementById(id).classList.add("oculto")}
document.querySelectorAll("[data-cerrar-modal]").forEach(boton => boton.addEventListener("click", () => cerrarModal(boton.dataset.cerrarModal)));

document.getElementById("nueva-solicitud")?.addEventListener("click", () => {
  if(!esAdmin) return;
  document.getElementById("form-admin").reset();
  document.getElementById("admin-id").value = "";
  document.getElementById("titulo-modal-admin").textContent = "Nueva solicitud";
  document.getElementById("admin-estado").value = "registrado";
  abrirModal("modal-admin");
});

document.getElementById("tabla-panel")?.addEventListener("click", async evento => {
  const editar = evento.target.closest("[data-editar]");
  const eliminar = evento.target.closest("[data-eliminar]");
  const revisar = evento.target.closest("[data-revisar]");
  if(editar && esAdmin){
    const fila = registros.find(r => r.id === Number(editar.dataset.editar));
    if(!fila) return;
    document.getElementById("admin-id").value = fila.id;
    document.getElementById("admin-nombre").value = fila.nombre_contribuyente || "";
    document.getElementById("admin-ruc").value = fila.ruc || "";
    document.getElementById("admin-correo").value = fila.correo || "";
    document.getElementById("admin-estado").value = fila.estado || "registrado";
    document.getElementById("titulo-modal-admin").textContent = `Editar ${fila.codigo_seguimiento}`;
    abrirModal("modal-admin");
  }
  if(eliminar && esAdmin){
    const id = Number(eliminar.dataset.eliminar);
    const fila = registros.find(r => r.id === id);
    if(!fila) return;
    if(confirm(`¿Eliminar definitivamente la solicitud ${fila.codigo_seguimiento}?`)){
      await sql`DELETE FROM solicitudes_clave_sol WHERE id = ${id};`;
      await listar();
    }
  }
  if(revisar && !esAdmin){
    const fila = registros.find(r => r.id === Number(revisar.dataset.revisar));
    if(!fila) return;
    document.getElementById("revision-id").value = fila.id;
    document.getElementById("revision-codigo").textContent = fila.codigo_seguimiento;
    document.getElementById("revision-nombre").textContent = fila.nombre_contribuyente;
    document.getElementById("revision-ruc").textContent = fila.ruc;
    document.getElementById("revision-correo").textContent = fila.correo;
    document.getElementById("revision-estado").value = fila.estado || "registrado";
    abrirModal("modal-revision");
  }
});

document.getElementById("form-admin")?.addEventListener("submit", async evento => {
  evento.preventDefault();
  if(!esAdmin) return;
  const datos = new FormData(evento.currentTarget);
  const id = Number(datos.get("id"));
  const nombre = String(datos.get("nombre")||"").trim();
  const ruc = String(datos.get("ruc")||"").trim();
  const correo = String(datos.get("correo")||"").trim().toLowerCase();
  const estado = String(datos.get("estado")||"registrado");
  const mensaje = document.getElementById("mensaje-admin");
  if(nombre.length < 3 || !/^\d{11}$/.test(ruc) || !correo.includes("@")){
    mensaje.textContent = "Revisa los datos del formulario.";
    mensaje.className = "mensaje error";
    return;
  }
  if(id){
    await sql`
      UPDATE solicitudes_clave_sol
      SET nombre_contribuyente=${nombre}, ruc=${ruc}, correo=${correo}, estado=${estado}
      WHERE id=${id};
    `;
  }else{
    const codigo = `SOL-${Date.now().toString().slice(-8)}`;
    await sql`
      INSERT INTO solicitudes_clave_sol
        (id_usuario, codigo_seguimiento, nombre_contribuyente, ruc, correo, estado)
      VALUES
        (NULL, ${codigo}, ${nombre}, ${ruc}, ${correo}, ${estado});
    `;
  }
  mensaje.textContent = "Cambios guardados.";
  mensaje.className = "mensaje ok";
  setTimeout(async () => {cerrarModal("modal-admin");mensaje.textContent="";await listar();}, 350);
});

document.getElementById("form-revision")?.addEventListener("submit", async evento => {
  evento.preventDefault();
  if(esAdmin) return;
  const datos = new FormData(evento.currentTarget);
  const id = Number(datos.get("id"));
  const estado = String(datos.get("estado")||"registrado");
  await sql`UPDATE solicitudes_clave_sol SET estado=${estado} WHERE id=${id};`;
  const mensaje = document.getElementById("mensaje-revision");
  mensaje.textContent = "Revisión guardada.";
  mensaje.className = "mensaje ok";
  setTimeout(async () => {cerrarModal("modal-revision");mensaje.textContent="";await listar();}, 350);
});

listar();
