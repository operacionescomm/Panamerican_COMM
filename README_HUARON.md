# Visual Engine COMM - Panamerican Huarón

Paquete adaptado al formato visual usado para el reporte de Huarón.

## Datos precargados
- Unidad minera: Panamerican Huarón
- Periodo operativo: Mayo 2026 (24/04/2026 al 23/05/2026)
- Atenciones: 79
- Horas: 145.1
- Requerimientos: 56
- Incidentes: 23

## Rutas de prueba
- `/test-slide10`, `/test-slide11`, `/test-slide12`, `/test-slide13`, `/test-slide14`, `/test-slide15` y `/test-slide17`
- Las mismas rutas con sufijo `-png` para obtener la imagen renderizada
- Render API: `POST /render/slide{n}`

## Diapositivas incluidas
- Slide 10: Días, atenciones y horas por día
- Slide 11: IM/SUP y evolución mensual
- Slide 12: Incidentes vs requerimientos
- Slide 13: Top 10 requerimientos
- Slide 14: Top 10 incidentes
- Slide 15: Histórico de requerimientos e incidentes
- Slide 17: Suministros general

Por ahora, la generación termina en la slide 17. Las slides 18 y 19 no están publicadas.

> Nota: Se mantuvo el diseño, la estructura de rutas y las plantillas originales. Solo se adaptaron títulos, textos y datos de muestra a Panamerican Huarón.

## Corrección para Render / Chrome

Este paquete instala automáticamente la versión de Chrome compatible con Puppeteer durante `npm install` o `npm ci`.

### Configuración recomendada en Render
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`

El archivo `render.yaml` ya contiene esta configuración.

### Diagnóstico
Después del despliegue abre:
- `/browser-status` → debe responder `ok: true` y mostrar la ruta de Chrome.
- `/test-slide13-png` → debe devolver directamente la imagen PNG.

### Ejecución local
```bash
npm ci
npm start
```

Si ya instalaste dependencias antes de recibir esta corrección:
```bash
npm run install:browser
npm start
```
