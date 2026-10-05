import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion(["cliente"]);
if(usuario) document.getElementById("nombre-sesion").textContent = usuario.nombre;
document.getElementById("boton-cerrar-sesion")?.addEventListener("click", cerrarSesion);

function escapar(valor){
  return String(valor ?? "").replace(/[&<>"']/g, caracter => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[caracter]));
}

function etiquetaEstado(estado){
  const valor = estado || "registrado";
  return `<span class="estado estado-${escapar(valor)}">${escapar(valor.replace("_"," "))}</span>`;
}

async function cargar(){
  const tbody = document.getElementById("tabla-solicitudes");
  try{
    const filas = await sql`
      SELECT id, codigo_seguimiento, nombre_contribuyente, ruc, correo, estado, fecha_registro
      FROM solicitudes_clave_sol
      WHERE id_usuario = ${usuario.id}
      ORDER BY fecha_registro DESC NULLS LAST, id DESC;
    `;
    document.getElementById("total-solicitudes").textContent = filas.length;
    document.getElementById("total-pendientes").textContent = filas.filter(f => f.estado === "registrado").length;
    document.getElementById("total-atendidas").textContent = filas.filter(f => f.estado === "atendido").length;
    if(!filas.length){
      tbody.innerHTML = `<tr><td colspan="7" class="vacio">Aún no tienes solicitudes registradas.</td></tr>`;
      return;
    }
    tbody.innerHTML = filas.map(fila => {
      const editable = fila.estado === "registrado";
      return `<tr><td><strong>${escapar(fila.codigo_seguimiento)}</strong></td><td>${escapar(fila.nombre_contribuyente)}</td><td>${escapar(fila.ruc)}</td><td>${escapar(fila.correo)}</td><td>${etiquetaEstado(fila.estado)}</td><td>${fila.fecha_registro ? new Date(fila.fecha_registro).toLocaleDateString("es-PE") : "-"}</td><td>${editable ? `<a class="boton boton-claro boton-mini" href="actualizar.html?id=${fila.id}">Editar</a>` : `<span style="color:#718089;font-size:12px">Solo lectura</span>`}</td></tr>`;
    }).join("");
  }catch(error){
    tbody.innerHTML = `<tr><td colspan="7" class="vacio">${escapar(error.message)}</td></tr>`;
  }
}

cargar();
