COMPLETAS
[X] getAllCVS no debería devolver un array de pages, con un number debería bastar.
[X] En producción los gráficos se malforman. Ahora se usa Recharts.
[X] En la tabla, al no encontrar entradas la paginación marca "Página 1 de 0".
[X] La información para la tabla proveniente del servidor debe actualizarse cada 5min.
[X] Establecer validaciones en el cliente para el vídeo y el pdf.
[X] Antes de permitir grabar se comprueba los permisos y que el navegador permite la grabación.

[X] El borrado en bloque parece tardar mucho.
[X] Refactorizar el endpoint changeStatus.
[X] Al cambiar de una página a la siguiente o viceversa debemos resetear la selección de filas. De este modo, evitamos problemas de incosistencia en el estado.
[X] Al cambiar el status en una fila debemos ver el spinner en la misma fila.
[X] Al eliminar un CV se debe mostrar el spinner en el botón de confirmación del modal.

[X] Crear un nuevo componente para los filtros.
[X] Inconsistencias en los colores "on focus" de los items en la navegación lateral.
[X] Hay que indicar que la tabla viene ordenada por fecha por defecto.

[X] Refactorizado componente para filtros.
[X] Añadida autenticación mediante usuario y contraseña.
[X] Evitar layout shifting usando Fontsource.

PENDIENTES
[ ] Añadir rate limitting a la subida de imagenes y a la inserción en db.
[ ] La altura de la tabla no es suficiente en dispositivos > 1080px.
[ ] No funciona tabulador para hacer focus en los checkboxes de los filtros.
[ ] Arreglar problema con la importación de db en insert-cv (eliminar inyección)
