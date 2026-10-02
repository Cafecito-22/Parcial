# Sustentación — Caso 13: SUNAT Perú / Solicitud de Clave SOL

## Proceso de negocio investigado
La Clave SOL permite acceder a SUNAT Operaciones en Línea y realizar consultas y trámites tributarios. El procedimiento oficial contempla identificación y validación del solicitante antes de generar la credencial; existen canales virtuales y atención presencial. Revisar requisitos según el tipo de contribuyente.
Fuentes oficiales consultadas el 1 de octubre de 2026:
- [Centro de Servicios Virtual: generar o recuperar Clave SOL](https://centrovirtual.sunat.gob.pe/tramites/clave-sol)
- [SUNAT: requisitos](https://orientacion.sunat.gob.pe/6614-02-requisitos-para-obtener-la-clave-sol)
- [Gob.pe: Clave SOL](https://www.gob.pe/institucion/sunat/pages/11075-clave-sol)

El proyecto académico registra y gestiona solicitudes con nombre, RUC, correo y seguimiento. No genera una Clave SOL oficial ni valida identidad con SUNAT. Los estados registrado, atendido y rechazado representan el seguimiento académico. Los turnos 06–14, 14–22 y 22–06 son una decisión de este proyecto para cubrir el requisito del aula, no horarios oficiales de SUNAT.
La investigación documental está enlazada arriba; no se afirma haber realizado una visita presencial.

## Guion de demostración (4 minutos)
1. 0:00–0:45: iniciar sesión como cliente1 de prueba.
2. 0:45–1:30: registrar una nueva solicitud y mostrar el código.
3. 1:30–2:15: consultar; aparecen las tres precargadas y la nueva. Explicar el filtro por propietario.
4. 2:15–3:00: editar la solicitud registrada. Mostrar que atendido/rechazado no permiten edición.
5. 3:00–4:00: cerrar sesión e iniciar como administrador; listar, editar estado y eliminar una solicitud creada para la demostración. Mostrar turno asignado a cada empleado y restricción fuera de turno.

## Preguntas de código
- HTML5: formularios con label, required, email y patrón de 11 dígitos; tabla con encabezados y mensajes accesibles.
- CSS3: cada HTML tiene CSS propio; diseño adaptable, transiciones, animación de aparición y prefers-reduced-motion.
- JavaScript: módulos por funcionalidad; fetch hacia API; async/await; captura de errores; confirmación de eliminación.
- Neon: usuarios y solicitudes_clave_sol; relación id_usuario; rol y turno. Consultas parametrizadas para evitar inyección.
- UPDATE propio: propietario obtenido de cookie firmada; condición de propietario y estado registrado en una misma consulta.
- Panel: permisos verificados en servidor leyendo rol y turno actuales de Neon. Empleado solo escribe en su turno; administrador sin restricción.
- Contraseñas: nuevas cuentas guardan scrypt; las antiguas se convierten al iniciar sesión correctamente.

## Evidencia comprobada
12 pruebas locales aprobadas. Contra Neon se verificaron 14 accesos, tres solicitudes de cliente1, UPDATE propio y CRUD con administrador y los tres empleados, más rechazo de escrituras fuera de turno. Las solicitudes temporales de esta verificación fueron eliminadas; permanecen las 30 precargadas y los registros anteriores del usuario.
Tomar una captura propia en Neon con la columna rol/turno y los conteos de solicitudes para adjuntarla si el docente lo solicita.
