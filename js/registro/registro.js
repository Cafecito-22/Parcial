import { sql, verificarConexion } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion(["cliente"]);
if(usuario){
  document.getElementById("nombre-sesion").textContent = usuario.nombre;
  const correo = document.getElementById("correo");
  if(correo) correo.value = usuario.correo;
}
document.getElementById("boton-cerrar-sesion")?.addEventListener("click", cerrarSesion);

async function guardarSolicitud(datos){
  verificarConexion();
  const codigo = `SOL-${Date.now().toString().slice(-8)}`;
  const filas = await sql`
    INSERT INTO solicitudes_clave_sol
      (id_usuario, codigo_seguimiento, nombre_contribuyente, ruc, correo, estado)
    VALUES
      (${usuario.id}, ${codigo}, ${datos.nombre}, ${datos.ruc}, ${datos.correo}, 'registrado')
    RETURNING codigo_seguimiento;
  `;
  return filas[0].codigo_seguimiento;
}

document.getElementById("form-solicitud")?.addEventListener("submit", async evento => {
  evento.preventDefault();
  const mensaje = document.getElementById("mensaje-solicitud");
  const boton = document.getElementById("guardar-solicitud");
  const datos = new FormData(evento.currentTarget);
  const nombre = String(datos.get("nombre")||"").trim();
  const ruc = String(datos.get("ruc")||"").trim();
  const correo = String(datos.get("correo")||"").trim().toLowerCase();
  if(nombre.length < 3 || !/^\d{11}$/.test(ruc) || !correo.includes("@")){
    mensaje.textContent = "Revisa el nombre, el RUC de 11 dígitos y el correo.";
    mensaje.className = "mensaje error";
    return;
  }
  boton.disabled = true;
  boton.textContent = "Registrando...";
  try{
    const codigo = await guardarSolicitud({nombre,ruc,correo});
    document.getElementById("codigo-generado").textContent = codigo;
    document.getElementById("confirmacion").classList.remove("oculto");
    mensaje.textContent = "Solicitud registrada correctamente.";
    mensaje.className = "mensaje ok";
    evento.currentTarget.reset();
    document.getElementById("correo").value = usuario.correo;
  }catch(error){
    mensaje.textContent = error.message;
    mensaje.className = "mensaje error";
  }finally{
    boton.disabled = false;
    boton.textContent = "Registrar solicitud";
  }
});
