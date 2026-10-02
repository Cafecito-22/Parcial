# SUNAT Perú — Semana 7

Sitio moderno con animaciones, tres roles y CRUD de Solicitud de Clave SOL.

## Vercel (corrección de conexión)
1. En el proyecto Parcial: Settings → Environment Variables.
2. Crear DATABASE_URL, con la cadena Neon de tu proyecto. Marcar Production, Preview y Development. No usar un prefijo PUBLIC y no colocar la contraseña en GitHub.
3. Aplicar sql/01_semana7.sql en Neon SQL Editor si aún no se ha ejecutado. sql/02_datos_prueba.sql carga las cuentas académicas y 30 solicitudes opcionales.
4. Desplegar de nuevo después de guardar la variable: Deployments → último despliegue → Redeploy.
5. En Build and Deployment usar Framework Preset Other, sin Build Command y Output Directory en la raíz (.). El proyecto incluye api/sunat.js y package.json para instalar el driver.
6. Abrir login.html y crear una cuenta o usar una cuenta existente. Las contraseñas existentes son compatibles y se convierten a un hash al iniciar sesión correctamente.

El navegador llama a /api/sunat. Solo el servidor lee DATABASE_URL. Los roles se verifican en Neon para cada operación; el propietario se obtiene de una sesión firmada, no del navegador. UPDATE propio verifica propietario y estado registrado en la misma consulta. Administrador y empleado tienen CRUD completo, con confirmación antes de eliminar. Las altas del panel tienen propietario NULL según la guía.

CSS independiente para cada HTML y JS modular. Inicio, servicios, contacto, cronograma, imágenes y ruta clave-sol.html conservados. Animaciones respetan la preferencia de movimiento reducido.

Para ejecutar localmente usar Vercel CLI (`vercel dev`) y DATABASE_URL privada; Live Server por sí solo no ejecuta la API. Consultar sql/02_datos_prueba.sql para cuentas de demostración. Nunca usar datos personales reales en esta tarea.

## Pruebas
12 pruebas locales aprobadas. En Neon se verificaron los 14 accesos y el CRUD de cada rol, incluida la restricción de los tres turnos.
`npm test` verifica firmas de sesión, compatibilidad de contraseñas, protección de roles, propietario y estado de actualización, y rechazo de operaciones desconocidas. Las comprobaciones remotas necesitan un despliegue con DATABASE_URL configurada.

## Turnos de empleados (hora de Perú)
Mañana: 06:00–14:00. Tarde: 14:00–22:00. Noche–madrugada: 22:00–06:00.
Cada empleado puede consultar todos los registros en cualquier momento y realizar el CRUD, incluido cambiar estados, durante su turno. El administrador puede hacerlo a cualquier hora. La API verifica el turno para cada escritura usando America/Lima; el navegador muestra el horario y la disponibilidad.
Ejecutar sql/03_turnos.sql para añadir la columna y scripts/cargar-demo.mjs para 10 clientes, 1 administrador, 3 empleados y 30 solicitudes. Las claves se generan aleatoriamente y se guardan solo en el archivo privado indicado por CREDENCIALES_ARCHIVO. No subir ese archivo a GitHub. Las cuentas existentes no se reemplazan.
