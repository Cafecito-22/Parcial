import { neon } from "https://esm.sh/@neondatabase/serverless";

const CADENA_NEON = "postgresql://neondb_owner:npg_wAJhQVIe3t1g@ep-still-violet-b5der5qx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(CADENA_NEON);

export function verificarConexion(){
  if(!sql) throw new Error("No se pudo iniciar la conexión con Neon.");
}
