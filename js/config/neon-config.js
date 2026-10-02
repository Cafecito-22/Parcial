// Neon se conecta solo desde el servidor de Vercel.
export async function api(accion,datos={}){
 const respuesta=await fetch('/api/sunat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion,...datos})});
 let contenido;try{contenido=await respuesta.json();}catch{throw new Error('El servidor no está disponible. Revisa el despliegue de Vercel.');}
 if(!respuesta.ok)throw new Error(contenido.error||'No se pudo completar la operación.');
 return contenido;
}
