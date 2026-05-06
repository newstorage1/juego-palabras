Configuración inicial:
El proyecto utilizaba un script de Bash (.sh) para ejecutar los procesos de forma secuencial. El servidor de Node se lanzaba en primer plano, bloqueando la ejecución del cliente de React. Además, el servidor intentaba servir archivos estáticos de la carpeta /client mientras React intentaba usar su propio servidor de desarrollo en el mismo entorno, generando conflictos de puertos y procesos "zombie" que dejaban los puertos 3000 y 3001 ocupados.

Enfoque de corrección:
Se unificó la gestión de procesos utilizando la librería concurrently dentro del package.json raíz. Este enfoque permite:

Ejecución Paralela: Iniciar el backend (puerto 3001) y el frontend (puerto 3000) simultáneamente con un solo comando: npm run dev.

Gestión de Prefijos: Uso de --prefix client para disparar scripts del frontend sin necesidad de navegar manualmente entre directorios.

Separación de Responsabilidades: Se delegó el servicio de la interfaz al servidor de desarrollo de React, utilizando el proxy configurado para la comunicación con la API, eliminando la inestabilidad en las rutas del servidor Express.