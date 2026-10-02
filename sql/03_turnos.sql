-- Horarios del proyecto, zona America/Lima; sin borrar datos existentes.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turno VARCHAR(10)
 CHECK (turno IN ('manana','tarde','noche'));
-- Administrador: sin restricción horaria. Cliente: sin turno.
-- Empleado: fuera de su turno puede consultar; escrituras bloqueadas en API.
