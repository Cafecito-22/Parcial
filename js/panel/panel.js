import {api} from '../config/neon-config.js';
import {exigirRol} from '../auth/auth.js';
import {datos,mensaje,tabla} from '../solicitudes/interfaz.js';
const usuario=exigirRol(['administrador','empleado']),form=document.getElementById('form-panel');let editando=null;
export async function listarTodos(){if(!usuario)throw new Error('Acceso denegado');return api('listarTodos');}
export async function crearRegistro(d){if(!usuario)throw new Error('Acceso denegado');return api('crearPanel',d);}
export async function actualizarComoPanel(id,d){if(!usuario)throw new Error('Acceso denegado');return api('actualizarPanel',{id,...d});}
export async function eliminarRegistro(id){if(!usuario)throw new Error('Acceso denegado');return api('eliminarPanel',{id});}
function editar(f){editando=f.id;for(const k of ['nombre_contribuyente','ruc','correo','estado'])form.elements[k].value=f[k];mensaje('Editando solicitud '+f.codigo_seguimiento,true);form.scrollIntoView({behavior:'smooth'});}
let eliminando=false;
async function eliminar(f){if(eliminando||!confirm('¿Eliminar definitivamente la solicitud '+f.codigo_seguimiento+'?'))return;eliminando=true;try{const filas=await eliminarRegistro(f.id);if(!filas.length)throw new Error('La solicitud ya fue eliminada.');if(editando===f.id){editando=null;form.reset();}await cargar();mensaje('Solicitud eliminada correctamente.',true);}catch(e){mensaje(e.message);}finally{eliminando=false;}}
async function cargar(){if(!usuario)return;try{tabla(await listarTodos(),true,editar,eliminar);}catch(e){mensaje(e.message);}}
form.addEventListener('submit',async e=>{e.preventDefault();if(!usuario)return;const boton=form.querySelector('[type="submit"]');boton.disabled=true;try{const d=datos(form);if(!['registrado','atendido','rechazado'].includes(d.estado))throw new Error('Estado inválido');const filas=editando?await actualizarComoPanel(editando,d):await crearRegistro(d);if(!filas.length)throw new Error('La solicitud ya no existe.');editando=null;form.reset();await cargar();mensaje('Solicitud guardada correctamente.',true);}catch(e){mensaje(e.message);}finally{boton.disabled=false;}});
document.getElementById('cancelar').addEventListener('click',()=>{editando=null;form.reset();mensaje('Formulario listo para una nueva solicitud.',true);});document.getElementById('recargar').addEventListener('click',cargar);cargar();