import { neon } from "https://esm.sh/@neondatabase/serverless";


const CADENA_NEON = "TU_CADENA_NEON";

export const conexionConfigurada = !CADENA_NEON.includes("TU_CADENA");
export const sql = conexionConfigurada ? neon(CADENA_NEON) : null;

export function verificarConexion(){
  if(!conexionConfigurada || !sql){
    throw new Error("Falta configurar la cadena de conexión de Neon en js/config/neon-config.js");
  }
}
