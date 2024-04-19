**Documento de Estimación de Costos para una Aplicación de Recolección de Currículum**

#### **1. Información Básica**

- **Uso de la aplicación** (Estimado por lo alto):

  - La página del formulario de envío del currículum se visita 2000 veces al mes.
  - La página de la tabla interactiva donde se muestran los currículums se visita unas 120 veces al mes por el personal de recursos humanos.

- **Tamaño de las páginas**:

  - Página del formulario: 582 KB
  - Página de currículums: 600 KB

- **Tamaño de las tablas en la DB**:

  - Tabla CV: 228 bytes
  - Tabla Añadido: 254 bytes

- **Archivos subidos por los candidatos**:
  - Cada candidato sube un vídeo de 35 MB y un documento PDF de 3 MB.

#### **2. Costos de los Servicios**

- **Netlify** (Despliegue):

  - Costo: €19/mes.
  - El parámetro principal para calcular el coste del servicio es el ancho de banda. Tras realizar los cálculos se estima un consumo de 1.24GB/mes. Muy por debajo del límite de 1TB/mes que ofrece la plataforma por 19$/mes.
  - Más información: [Precios de Netlify](https://www.netlify.com/pricing/)

- **Netlify** (Métricas):

  - Costo: €9/mes (fijo).

- **UploadThing** (Almacenamiento de archivos):

  - Costo: €10/100GB de almacenamiento (el costo tras superar el límite de 100GB aún está por determinar).
  - Más información: [Precios de UploadThing](https://uploadthing.com/pricing)

- **Astro DB** (Base de Datos):
  - Costo: Gratuito. Teniendo en cuenta el tamaño de las tablas en la db y la frecuencia de uso es muy complicado superar el límite de 1GB. 1€ por cada GB adicional tras superar el límite gratuito de 1 GB.
  - Más información: [Precios de Astro DB](https://astro.build/db/)

#### **3. Resumen de Costos**

- **Costos básicos**:

  | **Servicio**                    | **Precio del Cliente** | **Límite** | **Costo por Exceder el Límite**               |
  | ------------------------------- | ---------------------- | ---------- | --------------------------------------------- |
  | **Despliegue (Ancho de Banda)** | 19€                    | 1 TB/mes   | 55€ por cada 100 GB adicional sobre 1 TB      |
  | **Base de Datos**               | 10€                    | 1 GB       | 1€ por cada GB adicional                      |
  | **Almacenamiento de Archivos**  | 10€                    | 100 GB     | 10€ por cada 100 GB adicional (por confirmar) |
  | **Métricas**                    | 9€                     | -          | -                                             |
  | **Total**                       | 48€                    | -          | -                                             |

- **Almacenamiento de archivos adicionales**:
  - Consumo mensual aproximado de 74 GB para vídeos y documentos subidos (35 MB y 3 MB respectivamente), lo que generaría un costo adicional de aproximadamente €10 cada mes (asumiendo que los datos nunca se eliminan).
