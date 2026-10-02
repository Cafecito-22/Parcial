# SUNAT Perú — Caso 13 — Semana 7

## Puesta en marcha
1. Extraer el ZIP y abrir esta carpeta en Visual Studio Code.
2. Ejecutar `sql/01_semana7.sql` en el SQL Editor de la base Neon usada en Semana 6. El archivo también permite crear las tablas en una base vacía. No borra registros anteriores.
3. Ejecutar opcionalmente `sql/02_datos_prueba.sql`: 10 clientes con 3 solicitudes cada uno, 1 administrador y 2 empleados. Repetirlo no duplica los datos de prueba. Si esos correos ya existían, se conservan sus cuentas y contraseñas; revisar sus roles.
4. Configurar CADENA_NEON en `js/config/neon-config.js` en la copia local. La contraseña de conexión se ha retirado de esta publicación pública.
5. Abrir `index.html` con Live Server (HTTP); los módulos no funcionan abriendo archivos directamente con file://. Se necesita Internet para el driver de Neon.

Cuentas de prueba nuevas: cliente1@correo.com hasta cliente10@correo.com, admin@correo.com, empleado1@correo.com y empleado2@correo.com. Contraseña: 1234.

## Flujos
- Cuenta pública: siempre cliente, sin selector de rol.
- Cliente: login → registro.html → consulta.html → actualizar.html?id=… . Solo ve lo propio. La carga y el UPDATE verifican id_usuario y estado='registrado'; el cliente no cambia el estado ni elimina.
- Administrador y empleado: login → panel.html. Ambos listan todos, crean, editan campos y estado, y eliminan con confirmación. Las altas del panel tienen id_usuario NULL, como exige la guía para atención presencial/telefónica.
- clave-sol.html conserva el formulario previo como ruta compatible. Servicios, cronograma, contacto, inicio e imágenes se conservan.
- Cada HTML tiene un CSS propio independiente. Los JS están organizados como módulos por funcionalidad.
- Las solicitudes antiguas sin id_usuario siguen visibles en el panel. No se atribuyen automáticamente por correo: si corresponde, asignar al propietario real con SQL.

## Pruebas de aceptación / exposición
1. Entrar como cliente1: aparecen 3 solicitudes precargadas; crear una y comprobar 4.
2. Editar la registrada; volver a consultar y comprobar los cambios.
3. Intentar abrir un id de cliente2: no aparece el formulario. Los estados atendido/rechazado no ofrecen edición.
4. Cambiar una solicitud a atendido desde el panel mientras otro cliente la edita: guardar desde el cliente debe rechazar la actualización.
5. Cliente que abre panel.html es redirigido; visitante sin sesión va a login.
6. Entrar como administrador: ver las 30 precargadas más las nuevas; crear, editar (incluido estado) y eliminar. Cancelar la confirmación no elimina.
7. Repetir el CRUD como empleado1 y empleado2.
8. Cerrar sesión y comprobar que las páginas protegidas piden acceso.
9. Ejecutar las consultas al final del SQL de prueba y tomar la captura de Neon requerida por la guía.

## Alcance y verificación
Se preserva el enfoque académico de Semana 6 y de la guía: driver Neon y credenciales de conexión en el navegador, contraseña de usuario en texto y sesión en sessionStorage. Las restricciones de rol de la interfaz no constituyen autorización segura del servidor. Para uso real se requiere un backend, autenticación segura, hashes y permisos de base adecuados. No publicar esta conexión de propietario.

Se verificaron las 10 páginas, sus rutas locales, CSS individuales, imports y sintaxis de todos los módulos. Pruebas locales con conexión simulada comprobaron alta pública como cliente, lectura de rol al iniciar sesión, redirecciones de acceso, rechazo de sesión inválida y cierre de sesión. La entrega no ejecuta SQL ni modifica la base remota: ejecutar los archivos anteriores y completar las pruebas de aceptación en Neon. No se fabrica una captura de base ni se afirma validación W3C o prueba remota no realizada.

## Diseño actualizado
Diseño adaptable con tarjetas, estados de colores, navegación activa, transiciones al interactuar y aparición de secciones al desplazarse. Respeta la preferencia del sistema para reducir movimiento. Cada página conserva su CSS propio.
