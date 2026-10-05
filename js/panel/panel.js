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

const turnos = {
  manana: { clave: "manana", nombre: "Mañana", horario: "06:00–14:00", inicio: 6, fin: 14 },
  tarde: { clave: "tarde", nombre: "Tarde", horario: "14:00–22:00", inicio: 14, fin: 22 },
  noche: { clave: "noche", nombre: "Noche", horario: "22:00–06:00", inicio: 22, fin: 6 }
};

let empleadosHorario = [];

function normalizarTurno(valor){
  return String(valor || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function partesLima(){
  const formato = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const partes = Object.fromEntries(formato.formatToParts(new Date()).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
  return {
    year: Number(partes.year),
    month: Number(partes.month),
    day: Number(partes.day),
    hour: Number(partes.hour),
    minute: Number(partes.minute),
    second: Number(partes.second)
  };
}

function turnoPorHora(hora){
  if(hora >= 6 && hora < 14) return "manana";
  if(hora >= 14 && hora < 22) return "tarde";
  return "noche";
}

function fechaUtcDesdeLima(partes){
  return new Date(Date.UTC(partes.year, partes.month - 1, partes.day, 12));
}

function inicioSemanaLima(){
  const hoy = fechaUtcDesdeLima(partesLima());
  const dia = hoy.getUTCDay();
  const retroceso = dia === 0 ? 6 : dia - 1;
  const lunes = new Date(hoy);
  lunes.setUTCDate(hoy.getUTCDate() - retroceso);
  return lunes;
}

function nombreEmpleado(empleado){
  return `<div class="empleado-turno"><strong>${escapar(empleado.nombre)}</strong><span>${escapar(empleado.correo)}</span></div>`;
}

function actualizarTurnoActual(){
  if(!esAdmin) return;
  const partes = partesLima();
  const clave = turnoPorHora(partes.hour);
  const turno = turnos[clave];
  const activos = empleadosHorario.filter(e => normalizarTurno(e.turno) === clave);
  const contenedor = document.getElementById("turno-actual");
  const hora = `${String(partes.hour).padStart(2,"0")}:${String(partes.minute).padStart(2,"0")}:${String(partes.second).padStart(2,"0")}`;
  const fecha = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", weekday: "long", day: "2-digit", month: "long" }).format(new Date());
  document.getElementById("hora-turno").textContent = hora;
  document.getElementById("fecha-turno").textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const nombres = activos.length ? activos.map(e => e.nombre).join(", ") : "Sin empleado asignado";
  contenedor.className = `turno-actual turno-${clave}`;
  contenedor.innerHTML = `<div class="pulso-turno"></div><div><span>En turno ahora · ${turno.nombre} · ${turno.horario}</span><strong>${escapar(nombres)}</strong></div>`;
}

function renderizarHorarioSemanal(){
  if(!esAdmin) return;
  const contenedor = document.getElementById("horario-semanal");
  const sinTurno = document.getElementById("empleados-sin-turno");
  const grupos = { manana: [], tarde: [], noche: [] };
  const pendientes = [];
  empleadosHorario.forEach(empleado => {
    const clave = normalizarTurno(empleado.turno);
    if(grupos[clave]) grupos[clave].push(empleado);
    else pendientes.push(empleado);
  });
  const hoyPartes = partesLima();
  const hoyClave = `${hoyPartes.year}-${String(hoyPartes.month).padStart(2,"0")}-${String(hoyPartes.day).padStart(2,"0")}`;
  const turnoActual = turnoPorHora(hoyPartes.hour);
  const lunes = inicioSemanaLima();
  const nombresDias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  contenedor.innerHTML = nombresDias.map((nombre, indice) => {
    const fecha = new Date(lunes);
    fecha.setUTCDate(lunes.getUTCDate() + indice);
    const claveFecha = `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth()+1).padStart(2,"0")}-${String(fecha.getUTCDate()).padStart(2,"0")}`;
    const fechaTexto = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" }).format(fecha);
    const filas = Object.values(turnos).map(turno => {
      const empleados = grupos[turno.clave];
      const activo = claveFecha === hoyClave && turno.clave === turnoActual ? " activo" : "";
      const personas = empleados.length ? empleados.map(nombreEmpleado).join("") : `<div class="empleado-turno vacante"><strong>Sin asignar</strong><span>Disponible para asignación</span></div>`;
      return `<div class="fila-turno ${turno.clave}${activo}"><div class="hora-bloque"><strong>${turno.nombre}</strong><span>${turno.horario}</span></div><div class="personas-turno">${personas}</div></div>`;
    }).join("");
    return `<article class="dia-horario${claveFecha === hoyClave ? " hoy" : ""}"><div class="dia-titulo"><strong>${nombre}</strong><span>${fechaTexto}</span></div>${filas}</article>`;
  }).join("");
  if(pendientes.length){
    sinTurno.classList.remove("oculto");
    sinTurno.innerHTML = `<strong>Empleados sin turno asignado:</strong> ${pendientes.map(e => escapar(e.nombre)).join(", ")}`;
  }else{
    sinTurno.classList.add("oculto");
    sinTurno.innerHTML = "";
  }
}

async function cargarHorario(){
  if(!esAdmin) return;
  const contenedor = document.getElementById("horario-semanal");
  try{
    empleadosHorario = await sql`
      SELECT id, nombre, correo, turno
      FROM usuarios
      WHERE rol = 'empleado'
      ORDER BY nombre ASC;
    `;
    renderizarHorarioSemanal();
    actualizarTurnoActual();
  }catch(error){
    contenedor.innerHTML = `<div class="horario-error">${escapar(error.message)}</div>`;
  }
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
if(esAdmin){
  cargarHorario();
  actualizarTurnoActual();
  setInterval(actualizarTurnoActual, 1000);
}
