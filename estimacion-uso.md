**Documento de Estimación de Costos para Aplicación de Recolección de Currículum**

Este documento proporciona un desglose del uso estimado de la aplicación.

#### **1\. Datos Iniciales**

- **Tráfico de la aplicación**:

  - La página del formulario es accedida entre 1000 y 2000 veces al mes.
  - La página de la tabla es accedida unas 30 veces al mes por el personal de recursos humanos.

- **Tamaño de las páginas**:

  - Página del formulario: 582 KB
  - Página de la tabla: 600 KB

- **Tamaño de las tablas en la DB**:

  - Tabla CV: 228 bytes
  - Tabla Añadido: 254 bytes

- **Uso de archivos**:

  - Cada candidato sube un vídeo (35 MB) y un PDF (3 MB).

#### **2\. Cálculos y Resultados**

- **Ancho de banda**:

  - Uso estimado: 1.13 GB/mes

- **Edge Functions**:

  - Uso estimado: 21,000 ejecuciones/mes

- **Almacenamiento de Base de Datos**:

  - Uso estimado: ~0.000004 GB/mes en detalles de filas

- **Operaciones de Base de Datos**:

  - Escrituras: 6,000/mes
  - Lecturas: 150,000/mes

- **Almacenamiento de Archivos**:

  - Uso estimado: 74.22 GB/mes
