-- Ejecutar después de crear las 14 cuentas con scripts/cargar-demo.mjs.
INSERT INTO solicitudes_clave_sol (id_usuario,codigo_seguimiento,nombre_contribuyente,ruc,correo,estado)
SELECT u.id,'SOL-DEMO-'||u.id||'-'||s,u.nombre,'20'||lpad(u.id::text,9,'0'),u.correo,
CASE WHEN s=1 THEN 'registrado' WHEN s=2 THEN 'atendido' ELSE 'rechazado' END
FROM usuarios u CROSS JOIN generate_series(1,3) s
WHERE u.correo IN (SELECT 'cliente'||n||'@sunat-demo.example' FROM generate_series(1,10) n)
AND NOT EXISTS (SELECT 1 FROM solicitudes_clave_sol r WHERE r.codigo_seguimiento='SOL-DEMO-'||u.id||'-'||s);

-- Verificación para la captura requerida (no se incluyen contraseñas):
SELECT id,nombre,correo,rol FROM usuarios ORDER BY rol,id;
SELECT rol,count(*) FROM usuarios GROUP BY rol;
SELECT id_usuario,count(*) FROM solicitudes_clave_sol GROUP BY id_usuario ORDER BY id_usuario;
SELECT * FROM solicitudes_clave_sol ORDER BY id;
