import { registrarUsuario, iniciarSesion } from "./auth.js";

const pestanasAcceso=document.querySelectorAll(".pestana");
pestanasAcceso.forEach(boton=>{boton.addEventListener("click",()=>{pestanasAcceso.forEach(item=>item.classList.remove("activa"));document.querySelectorAll(".panel-formulario").forEach(panel=>panel.classList.remove("activo"));boton.classList.add("activa");document.getElementById(`panel-${boton.dataset.panel}`).classList.add("activo")})});
if(location.protocol==="file:"){document.querySelectorAll("#form-login, #form-registro-usuario").forEach(formulario=>{formulario.addEventListener("submit",evento=>{evento.preventDefault();const mensaje=formulario.querySelector(".mensaje-form");mensaje.textContent="Abre el proyecto con Live Server para conectar con la base de datos.";mensaje.className="mensaje-form error"})})}

const formRegistro = document.getElementById("form-registro-usuario");
if(formRegistro){
  formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const mensaje = document.getElementById("mensaje-registro");
    const datos = new FormData(formRegistro);
    const nombre = String(datos.get("nombre") || "").trim();
    const correo = String(datos.get("correo") || "").trim().toLowerCase();
    const contrasena = String(datos.get("contrasena") || "");

    if(nombre.length < 3 || !correo.includes("@") || contrasena.length < 4){
      mensaje.textContent = "Revisa los datos ingresados.";
      mensaje.className = "mensaje-form error";
      return;
    }

    mensaje.textContent = "Creando cuenta...";
    mensaje.className = "mensaje-form";
    try{
      await registrarUsuario(nombre, correo, contrasena);
      mensaje.textContent = "Cuenta creada. Ya puedes iniciar sesión.";
      mensaje.className = "mensaje-form ok";
      formRegistro.reset();
      document.querySelector('[data-panel="login"]')?.click();
    }catch(error){
      mensaje.textContent = error.message.includes("unique") || error.message.includes("duplicate")
        ? "Ese correo ya está registrado."
        : error.message;
      mensaje.className = "mensaje-form error";
    }
  });
}

const formLogin = document.getElementById("form-login");
if(formLogin){
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const mensaje = document.getElementById("mensaje-login");
    const datos = new FormData(formLogin);
    const correo = String(datos.get("correo") || "").trim().toLowerCase();
    const contrasena = String(datos.get("contrasena") || "");

    mensaje.textContent = "Verificando...";
    mensaje.className = "mensaje-form";
    try{
      const usuario = await iniciarSesion(correo, contrasena);
      if(!usuario){
        mensaje.textContent = "Correo o contraseña incorrectos.";
        mensaje.className = "mensaje-form error";
        return;
      }
      mensaje.textContent = `Bienvenido, ${usuario.nombre}.`;
      mensaje.className = "mensaje-form ok";
      location.href = usuario.rol === 'cliente' ? 'registro.html' : 'panel.html';
    }catch(error){
      mensaje.textContent = error.message;
      mensaje.className = "mensaje-form error";
    }
  });
}
