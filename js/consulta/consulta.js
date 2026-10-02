import {sql} from '../config/neon-config.js';
import {exigirRol} from '../auth/auth.js';
import {tabla,mensaje} from '../solicitudes/interfaz.js';
const usuario=exigirRol(['cliente']);
async function cargar(){if(!usuario)return;try{const filas=await sql`SELECT * FROM solicitudes_clave_sol WHERE id_usuario=${usuario.id} ORDER BY id DESC`;tabla(filas,false);mensaje(`${filas.length} solicitudes propias.`,true);}catch(e){mensaje(e.message);}}
document.getElementById('recargar').addEventListener('click',cargar);cargar();