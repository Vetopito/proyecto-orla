# Dashboard de Resultados - Orla de Promoción Universitaria

Aplicación web estática (SPA en React 19 + TypeScript + Vite + Tailwind CSS) diseñada para consultar, auditar y proyectar en tiempo real los resultados de la votación de profesores para la orla universitaria, consumiendo las respuestas de Google Forms vinculadas a Google Sheets.

## 🚀 Características Implementadas

1. **Fuente de Datos en Tiempo Real (Google Sheets / Google Forms)**
   - Conexión client-side directa al endpoint gviz CSV:
     `https://docs.google.com/spreadsheets/d/[SHEET_ID]/gviz/tq?tqx=out:csv&sheet=Respuestas%20de%20formulario%201`
   - Procesamiento en streaming/navegador mediante **PapaParse**.
   - Modal interactivo para configurar el ID o URL de la hoja y el nombre de la pestaña, persistido en `localStorage`.
   - Incluye dataset de demostración (demo mode) integrado cuando no hay hoja configurada.

2. **Parser y Reglas de Recuento Avanzadas**
   - **Split seguro de profesores**: No divide por comas dentro de paréntesis `(...)` como en `Maria Teresa González (ESTD, CEST, MEA)`, asegurando que las listas de asignaturas no rompan el desglose de profesores.
   - **Detección inteligente de estados**: Reconoce automáticamente avisos como `-- Jubilado/a` o `Cambio de Adscripción` y genera insignias visuales (badges de alerta) sin desvirtuar el conteo de votos ni el nombre.
   - Generación de rankings independientes:
     - **Ranking A:** Profesores de Estadística.
     - **Ranking B:** Profesores de Informática.

3. **Interfaz de Usuario (UI / UX)**
   - **Métricas Clave (KPIs):** Tarjetas con Total de Alumnos Participantes, Votos Totales Emitidos y Marca temporal del último voto registrado.
   - **Botón "Actualizar datos":** Consulta instantánea para verificar nuevos votos en vivo.
   - **Selector de Corte (Top N):** Selector configurable (Top 3, Top 4, Top 5, Top 6, Top 10) que resalta de forma sincronizada los profesores clasificados tanto en las gráficas como en las tablas.
   - **Podio visual de Honor:** Diseño especial para los 3 profesores más votados de cada departamento (Oro, Plata, Bronce).
   - **Gráficos interactivos (Recharts):** Gráficos de barras horizontales ordenados por número de votos con tooltips personalizados y diferenciación de color para los profesores clasificados en el corte.
   - **Tabla detallada de resultados:** Posición, nombre, asignaturas, insignias de estado, conteo de votos y porcentaje sobre el total de alumnos con barra de progreso.
   - **Pestaña de Auditoría de Votantes:** Registro de respuestas individuales con buscador en tiempo real y detección automática de alumnos con envíos duplicados.

4. **Despliegue en GitHub Pages**
   - `vite.config.ts` configurado con `base: './'`.
   - Flujo de GitHub Actions en `.github/workflows/deploy.yml` para compilar y desplegar automáticamente en cada push a la rama `main`.

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📋 Pasos para conectar tu Google Sheet

1. En tu Google Form, pulsa en la pestaña **Respuestas** y luego en el icono de Google Sheets para abrir la hoja de cálculo vinculada.
2. En la hoja de cálculo, pulsa en el botón superior derecho **Compartir**.
3. En *Acceso general*, selecciona **Cualquier persona con el enlace** y rol **Lector**.
4. Copia el enlace o el ID de la URL (por ejemplo: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`).
5. Abre la aplicación, pulsa en **Fuente de datos** en la esquina superior derecha, pega el ID y pulsa **Guardar y Sincronizar**.
