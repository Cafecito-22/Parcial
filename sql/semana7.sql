ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'cliente';
ALTER TABLE solicitudes_clave_sol ADD COLUMN IF NOT EXISTS id_usuario INT REFERENCES usuarios(id);
ALTER TABLE solicitudes_clave_sol ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'registrado';
ALTER TABLE solicitudes_clave_sol ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE usuarios SET rol = 'cliente' WHERE rol IS NULL OR rol = '';
UPDATE usuarios SET rol = 'administrador' WHERE LOWER(correo) = LOWER('72922081@continental.edu.pe');
UPDATE usuarios SET rol = 'empleado' WHERE LOWER(correo) = LOWER('johaogavilan@gmail.com');
UPDATE solicitudes_clave_sol SET estado = 'registrado' WHERE estado IS NULL OR estado = '';
