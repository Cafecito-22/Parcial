const formularioRuc=document.getElementById("formulario-ruc");
if(formularioRuc){
  formularioRuc.addEventListener("submit",async evento=>{
    evento.preventDefault();
    const ruc=document.getElementById("ruc").value.trim();
    if(!/^\d{11}$/.test(ruc)) return;
    const boton=formularioRuc.querySelector("button");
    const resultado=document.getElementById("resultado-ruc");
    boton.disabled=true;
    boton.textContent="Validando...";
    await new Promise(resolve=>setTimeout(resolve,500));
    document.getElementById("ruc-consultado").textContent=ruc;
    document.getElementById("estado-ruc").textContent="11 dígitos válidos";
    document.getElementById("condicion-ruc").textContent="Consulta oficial disponible";
    document.getElementById("estado-consulta").textContent="RUC validado";
    resultado.classList.remove("resultado-oculto","confirmar");
    void resultado.offsetWidth;
    resultado.classList.add("confirmar");
    boton.disabled=false;
    boton.textContent="Validar";
  });
}
