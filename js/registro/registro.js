import { api } from "../config/neon-config.js";
import { exigirRol, cerrarSesion } from "../auth/auth.js";

const usuario = exigirRol(["cliente"]);
if(usuario){
  const nombreSesion = document.getElementById("nombre-sesion");
  if(nombreSesion) nombreSesion.textContent = usuario.nombre;
}

document.getElementById("boton-cerrar-sesion")?.addEventListener("click", cerrarSesion);

export async function guardarSolicitudClaveSol(datos){
  if(!usuario) throw new Error("Inicia sesión como cliente.");
  const resultado = await api('crearSolicitud', {nombre_contribuyente:datos.nombre,ruc:datos.ruc,correo:datos.correo});
  return resultado[0].codigo_seguimiento;
}

const formulario = document.getElementById("form-clave-sol");
if(formulario){
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const mensaje = document.getElementById("mensaje-solicitud");
    const boton = document.getElementById("boton-guardar-solicitud");
    const confirmacion = document.getElementById("confirmacion-solicitud");
    const salidaCodigo = document.getElementById("codigo-seguimiento");
    const datosFormulario = new FormData(formulario);
    const nombre = String(datosFormulario.get("nombre_contribuyente") || "").trim();
    const ruc = String(datosFormulario.get("ruc") || "").trim();
    const correo = String(datosFormulario.get("correo") || "").trim().toLowerCase();

    if(nombre.length < 3 || !/^\d{11}$/.test(ruc) || !correo.includes("@")){
      mensaje.textContent = "Revisa el nombre, el RUC de 11 dígitos y el correo.";
      mensaje.className = "mensaje-form error";
      return;
    }

    boton.disabled = true;
    boton.textContent = "Registrando...";
    mensaje.textContent = "";
    confirmacion.classList.add("resultado-oculto");
    confirmacion.classList.remove("mostrar");

    try{
      const codigo = await guardarSolicitudClaveSol({nombre, ruc, correo});
      salidaCodigo.textContent = codigo;
      confirmacion.classList.remove("resultado-oculto");
      void confirmacion.offsetWidth;
      confirmacion.classList.add("mostrar");
      mensaje.textContent = "Solicitud registrada correctamente.";
      mensaje.className = "mensaje-form ok";
      formulario.reset();
    }catch(error){
      mensaje.textContent = error.message;
      mensaje.className = "mensaje-form error";
    }finally{
      boton.disabled = false;
      boton.textContent = "Registrar solicitud";
    }
  });
}
