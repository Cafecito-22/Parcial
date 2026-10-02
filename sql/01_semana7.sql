-- Ejecutar primero en Neon SQL Editor. No elimina datos de Semana 6.
BEGIN;
CREATE TABLE IF NOT EXISTS usuarios (
 id SERIAL PRIMARY KEY, nombre VARCHAR(120) NOT NULL,
 correo VARCHAR(120) UNIQUE NOT NULL, contrasena VARCHAR(255) NOT NULL
);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'cliente';
UPDATE usuarios SET rol='cliente' WHERE rol IS NULL;
ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 'cliente', ALTER COLUMN rol SET NOT NULL;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='usuarios'::regclass AND conname='usuarios_rol_semana7_check') THEN
 ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_semana7_check CHECK (rol IN ('cliente','administrador','empleado'));
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS solicitudes_clave_sol (
 id SERIAL PRIMARY KEY, codigo_seguimiento VARCHAR(80) UNIQUE NOT NULL,
 nombre_contribuyente VARCHAR(120) NOT NULL, ruc VARCHAR(11) NOT NULL,
 correo VARCHAR(120) NOT NULL, estado VARCHAR(20) NOT NULL DEFAULT 'registrado',
 fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE solicitudes_clave_sol ADD COLUMN IF NOT EXISTS id_usuario INT;
ALTER TABLE solicitudes_clave_sol ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'registrado';
ALTER TABLE solicitudes_clave_sol ALTER COLUMN codigo_seguimiento TYPE VARCHAR(80);
ALTER TABLE solicitudes_clave_sol ALTER COLUMN estado SET DEFAULT 'registrado';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='solicitudes_clave_sol'::regclass AND contype='f' AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (id_usuario)%') THEN
 ALTER TABLE solicitudes_clave_sol ADD CONSTRAINT solicitudes_usuario_semana7_fk FOREIGN KEY (id_usuario) REFERENCES usuarios(id);
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS solicitudes_usuario_semana7_idx ON solicitudes_clave_sol(id_usuario);
COMMIT;
-- Registros anteriores sin propietario se conservan: visibles solo en el panel.
-- Asignar un propietario comprobado manualmente si se requiere:
-- UPDATE solicitudes_clave_sol SET id_usuario=ID_REAL WHERE id=ID_SOLICITUD;
