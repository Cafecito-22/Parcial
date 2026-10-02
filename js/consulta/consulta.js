import {api} from '../config/neon-config.js';
import {exigirRol} from '../auth/auth.js';
import {tabla,mensaje} from '../solicitudes/interfaz.js';
const usuario=exigirRol(['cliente']);
async function cargar(){if(!usuario)return;try{const filas=await api('misSolicitudes');tabla(filas,false);mensaje(`${filas.length} solicitudes propias.`,true);}catch(e){mensaje(e.message);}}
document.getElementById('recargar').addEventListener('click',cargar);cargar();