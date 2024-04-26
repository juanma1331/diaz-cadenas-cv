**Documento de Estimación de Costos para una Aplicación de Recolección de Currículum**

#### **1. Información Básica**

- **Uso de la aplicación** (Estimado por lo alto):

  - La página del formulario de envío del currículum se visita 2000 veces al mes.
  - La página de la tabla interactiva donde se muestran los currículums se visita unas 120 veces al mes por el personal de recursos humanos.

#### **2. Costos de los Servicios**

- **Netlify** (Despliegue):

  - Costo: €19/mes.
  - El parámetro principal para calcular el coste del servicio es el ancho de banda. Tras realizar los cálculos se estima un consumo de 1.24GB/mes. Muy por debajo del límite de 1TB/mes que ofrece la plataforma por 19$/mes.
  - Más información: [Precios de Netlify](https://www.netlify.com/pricing/)

- **Netlify** (Métricas):

  - Costo: €9/mes (fijo).

- **UploadThing** (Almacenamiento de archivos):

  - Costo: €10/100GB, luego 0.05€/GB.
  - Más información: [Precios de UploadThing](https://uploadthing.com/pricing)

- **Astro DB** (Base de Datos):
  - Costo: Gratuito. Teniendo en cuenta el tamaño de las tablas en la db y la frecuencia de uso es muy complicado superar el límite de 1GB. 1€ por cada GB adicional tras superar el límite gratuito de 1 GB.
  - Más información: [Precios de Astro DB](https://astro.build/db/)

#### **3. Resumen de Costos**

- **Costos básicos**:

  | **Servicio**                    | **Precio del Cliente** | **Límite** | **Costo por Exceder el Límite**          |
  | ------------------------------- | ---------------------- | ---------- | ---------------------------------------- |
  | **Despliegue (Ancho de Banda)** | 19€                    | 1 TB/mes   | 55€ por cada 100 GB adicional sobre 1 TB |
  | **Base de Datos**               | 0€                     | 1 GB       | 1€ por cada GB adicional                 |
  | **Almacenamiento de Archivos**  | 10€                    | 100 GB     | 0.05€ por cada GB adicional              |
  | **Métricas**                    | 9€                     | -          | -                                        |
  | **Monitorización de Errores**   | 0€                     | -          | -                                        |
  | **Total**                       | 38€                    | -          | -                                        |

#### **4. Estimaciones futuras**

- **Relación almacenamiento/costo**:
  | Años transcurridos | Número de CVs totales | Almacenamiento en uso (GB) | Costo del almacenamiento (€) |
  |--------------------|-----------------------|----------------------------|------------------------------|
  | 1 | 24,000 | 891 | 49.5 |
  | 3 | 72,000 | 2,672 | 138.6 |
  | 5 | 120,000 | 4,453 | 227.7 |
