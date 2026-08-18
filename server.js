const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/****************************************************
 * RUTAS GENERALES
 ****************************************************/

app.get('/', (req, res) => {
  res.redirect('/test-slide13-png');
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Visual engine activo'
  });
});

app.get('/browser-status', (req, res) => {
  const executablePath = resolveChromeExecutable();
  res.status(executablePath ? 200 : 503).json({
    ok: Boolean(executablePath),
    executablePath: executablePath || null,
    cacheDirectory: path.join(__dirname, '.cache', 'puppeteer'),
    help: executablePath
      ? 'Chrome/Chromium disponible para generar PNG.'
      : 'Ejecuta npm run install:browser o configura PUPPETEER_EXECUTABLE_PATH.'
  });
});

/****************************************************
 * REGISTRO DE RUTAS POR SLIDE
 ****************************************************/

registerSlide(10, getSampleSlide10, normalizeSlide10Data);
registerSlide(11, getSampleSlide11, normalizeSlide11Data);
registerSlide(12, getSampleSlide12, normalizeSlide12Data);

// Nuevo orden del informe:
// - Slide 13: contenido anterior de la slide 14.
// - Slide 14: contenido anterior de la slide 15.
// - Slide 15: contenido anterior de la slide 13.
registerSlide(13, getSampleSlide14, normalizeSlide14Data, 14);
registerSlide(14, getSampleSlide15, normalizeSlide15Data, 15);
registerSlide(15, getSampleSlide13, normalizeSlide13Data, 13);

// La slide 17 es la ultima disponible por ahora.
registerSlide(17, getSampleSlide17, normalizeSlide17Data);

function registerSlide(slideNumber, getSampleData, normalizeData, templateNumber = slideNumber) {
  app.get(`/test-slide${slideNumber}`, async (req, res) => {
    try {
      const sample = getSampleData();
      res.render(`slide${templateNumber}`, sample);
    } catch (error) {
      console.error(`Error en /test-slide${slideNumber}:`, error);
      res.status(500).send(`Error en /test-slide${slideNumber}: ` + error);
    }
  });

  app.get(`/test-slide${slideNumber}-png`, async (req, res) => {
    try {
      const sample = getSampleData();
      const html = await renderEjsToString(`slide${templateNumber}`, sample);
      const imageBuffer = await htmlToPng(html);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imageBuffer.length);
      res.end(imageBuffer);
    } catch (error) {
      console.error(`Error generando PNG slide ${slideNumber}:`, error);
      res.status(500).send(`Error generando PNG slide ${slideNumber}: ` + error);
    }
  });

  app.post(`/render/slide${slideNumber}`, async (req, res) => {
    try {
      const data = normalizeData(req.body || {});
      const html = await renderEjsToString(`slide${templateNumber}`, data);
      const imageBuffer = await htmlToPng(html);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imageBuffer.length);
      res.end(imageBuffer);
    } catch (error) {
      console.error(`Error renderizando slide${slideNumber}:`, error);
      res.status(500).json({
        ok: false,
        error: String(error)
      });
    }
  });
}

const HUARON_SAMPLE_DATA = {
  "slide10": {
    "titulo": "ATENCIONES EN LA OPERACIÓN PANAMERICAN HUARÓN - MAYO 2026",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "unidadMinera": "Panamerican Huarón",
    "diasPeriodo": 30,
    "totalAtenciones": 79,
    "totalHoras": 145.1,
    "promedioAtencionesDia": "2.9",
    "promedioHorasDia": "5.4",
    "horasPorAtencion": "1.84",
    "diasConAtencion": 27,
    "dias": [
      {
        "fecha": "24/04/2026",
        "dia": "24",
        "atenciones": 4,
        "horas": 8.0
      },
      {
        "fecha": "25/04/2026",
        "dia": "25",
        "atenciones": 2,
        "horas": 2.0
      },
      {
        "fecha": "26/04/2026",
        "dia": "26",
        "atenciones": 3,
        "horas": 4.5
      },
      {
        "fecha": "27/04/2026",
        "dia": "27",
        "atenciones": 2,
        "horas": 3.0
      },
      {
        "fecha": "28/04/2026",
        "dia": "28",
        "atenciones": 1,
        "horas": 8.0
      },
      {
        "fecha": "30/04/2026",
        "dia": "30",
        "atenciones": 4,
        "horas": 8.0
      },
      {
        "fecha": "02/05/2026",
        "dia": "02",
        "atenciones": 2,
        "horas": 4.0
      },
      {
        "fecha": "04/05/2026",
        "dia": "04",
        "atenciones": 1,
        "horas": 2.0
      },
      {
        "fecha": "05/05/2026",
        "dia": "05",
        "atenciones": 3,
        "horas": 7.5
      },
      {
        "fecha": "06/05/2026",
        "dia": "06",
        "atenciones": 2,
        "horas": 4.0
      },
      {
        "fecha": "07/05/2026",
        "dia": "07",
        "atenciones": 3,
        "horas": 6.5
      },
      {
        "fecha": "08/05/2026",
        "dia": "08",
        "atenciones": 2,
        "horas": 4.5
      },
      {
        "fecha": "09/05/2026",
        "dia": "09",
        "atenciones": 3,
        "horas": 5.0
      },
      {
        "fecha": "10/05/2026",
        "dia": "10",
        "atenciones": 4,
        "horas": 9.0
      },
      {
        "fecha": "11/05/2026",
        "dia": "11",
        "atenciones": 1,
        "horas": 2.0
      },
      {
        "fecha": "12/05/2026",
        "dia": "12",
        "atenciones": 4,
        "horas": 8.5
      },
      {
        "fecha": "13/05/2026",
        "dia": "13",
        "atenciones": 3,
        "horas": 3.5
      },
      {
        "fecha": "14/05/2026",
        "dia": "14",
        "atenciones": 5,
        "horas": 4.0
      },
      {
        "fecha": "15/05/2026",
        "dia": "15",
        "atenciones": 2,
        "horas": 4.0
      },
      {
        "fecha": "16/05/2026",
        "dia": "16",
        "atenciones": 4,
        "horas": 6.3
      },
      {
        "fecha": "17/05/2026",
        "dia": "17",
        "atenciones": 3,
        "horas": 4.0
      },
      {
        "fecha": "18/05/2026",
        "dia": "18",
        "atenciones": 4,
        "horas": 5.3
      },
      {
        "fecha": "19/05/2026",
        "dia": "19",
        "atenciones": 4,
        "horas": 3.5
      },
      {
        "fecha": "20/05/2026",
        "dia": "20",
        "atenciones": 3,
        "horas": 7.5
      },
      {
        "fecha": "21/05/2026",
        "dia": "21",
        "atenciones": 3,
        "horas": 6.0
      },
      {
        "fecha": "22/05/2026",
        "dia": "22",
        "atenciones": 3,
        "horas": 6.0
      },
      {
        "fecha": "23/05/2026",
        "dia": "23",
        "atenciones": 4,
        "horas": 8.5
      }
    ],
    "insight": "Durante Mayo 2026, Huarón registró 79 atenciones y 145.1 horas efectivas, concentradas en 27 días con actividad."
  },
  "slide11": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Atenciones por Tipo y Evolución Mensual",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "meses": [
      {
        "mes": "Feb-26",
        "mina": 86,
        "superficie": 7,
        "total": 94,
        "requerimientos": 58,
        "incidentes": 36,
        "horas": 189.6
      },
      {
        "mes": "Mar-26",
        "mina": 81,
        "superficie": 7,
        "total": 88,
        "requerimientos": 59,
        "incidentes": 29,
        "horas": 168.3
      },
      {
        "mes": "Abr-26",
        "mina": 66,
        "superficie": 18,
        "total": 85,
        "requerimientos": 62,
        "incidentes": 23,
        "horas": 176.1
      },
      {
        "mes": "May-26",
        "mina": 58,
        "superficie": 21,
        "total": 79,
        "requerimientos": 56,
        "incidentes": 23,
        "horas": 145.1
      }
    ],
    "totalAtenciones": 346,
    "totalMinaGlobal": 291,
    "totalSuperficieGlobal": 53,
    "totalMesActualValue": 79,
    "insight": "El comportamiento de los últimos cuatro periodos muestra predominio de atenciones en interior mina y continuidad operativa del soporte TI en Huarón."
  },
  "slide12": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Incidentes vs Requerimientos",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalAtenciones": 79,
    "incidentes": 23,
    "requerimientos": 56,
    "brecha": 33,
    "pctIncidentes": "29.11%",
    "pctRequerimientos": "70.89%",
    "tabla": {
      "up": "TOTAL",
      "incidentes": 23,
      "requerimientos": 56,
      "total": 79,
      "pctIncidentes": "29.11%",
      "pctRequerimientos": "70.89%",
      "pctTotal": "100%"
    },
    "insight": "Los requerimientos representan 70.89% de las atenciones del periodo, manteniendo mayor peso que los incidentes."
  },
  "slide13": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Detalle de Requerimientos e Incidentes",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalRequerimientos": 563,
    "totalIncidentes": 472,
    "totalAtenciones": 1035,
    "participacionRequerimientos": "54%",
    "participacionIncidentes": "46%",
    "promedioMensualTotal": "103.5",
    "meses": [
      {
        "mes": "Ago-25",
        "incidentes": 25,
        "requerimientos": 91
      },
      {
        "mes": "Set-25",
        "incidentes": 75,
        "requerimientos": 49
      },
      {
        "mes": "Oct-25",
        "incidentes": 95,
        "requerimientos": 44
      },
      {
        "mes": "Nov-25",
        "incidentes": 67,
        "requerimientos": 47
      },
      {
        "mes": "Dic-25",
        "incidentes": 65,
        "requerimientos": 42
      },
      {
        "mes": "Ene-26",
        "incidentes": 34,
        "requerimientos": 55
      },
      {
        "mes": "Feb-26",
        "incidentes": 36,
        "requerimientos": 58
      },
      {
        "mes": "Mar-26",
        "incidentes": 29,
        "requerimientos": 59
      },
      {
        "mes": "Abr-26",
        "incidentes": 23,
        "requerimientos": 62
      },
      {
        "mes": "May-26",
        "incidentes": 23,
        "requerimientos": 56
      }
    ],
    "insight": "El histórico muestra 563 requerimientos y 472 incidentes acumulados, lo que permite priorizar acciones de mantenimiento y continuidad operativa."
  },
  "slide14": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Top 10 Requerimientos",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalRequerimientos": 56,
    "totalTiempoHoras": 97.1,
    "items": [
      {
        "nombre": "Instalacion Nueva",
        "cantidad": 23,
        "tiempoHoras": 35.8
      },
      {
        "nombre": "Cable Seccionado",
        "cantidad": 5,
        "tiempoHoras": 4.0
      },
      {
        "nombre": "Inspeccion De Telefonos Instalaos",
        "cantidad": 3,
        "tiempoHoras": 6.0
      },
      {
        "nombre": "Mantenimiento De Equipos",
        "cantidad": 2,
        "tiempoHoras": 4.5
      },
      {
        "nombre": "Renovacion De Flota",
        "cantidad": 2,
        "tiempoHoras": 3.3
      },
      {
        "nombre": "Reparacion",
        "cantidad": 2,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Expocicion",
        "cantidad": 1,
        "tiempoHoras": 8.0
      },
      {
        "nombre": "Inspeccion",
        "cantidad": 1,
        "tiempoHoras": 3.0
      },
      {
        "nombre": "Reparacion De Señal De Radio",
        "cantidad": 1,
        "tiempoHoras": 3.0
      },
      {
        "nombre": "Cable Retirado Por Shocrete",
        "cantidad": 1,
        "tiempoHoras": 2.5
      }
    ],
    "insight": "La mayor concentración de requerimientos corresponde a Instalacion Nueva con 23 atenciones."
  },
  "slide15": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Top 10 Incidentes",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalIncidentes": 23,
    "totalTiempoHoras": 48.0,
    "items": [
      {
        "nombre": "Cable Seccionado",
        "cantidad": 5,
        "tiempoHoras": 13.0
      },
      {
        "nombre": "Cable Averiado",
        "cantidad": 2,
        "tiempoHoras": 4.0
      },
      {
        "nombre": "Estandarizado De Cable De Comunicación",
        "cantidad": 2,
        "tiempoHoras": 4.0
      },
      {
        "nombre": "Gabinete Caido",
        "cantidad": 1,
        "tiempoHoras": 3.0
      },
      {
        "nombre": "Cable Desconectado Por Inundacion",
        "cantidad": 1,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Cable Fibra Optica Seccionado",
        "cantidad": 1,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Cable Retirado Por Voladura",
        "cantidad": 1,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Cable Seccionado Por Desate De Rocas",
        "cantidad": 1,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Cables Desordenados",
        "cantidad": 1,
        "tiempoHoras": 2.0
      },
      {
        "nombre": "Cables Sueltos",
        "cantidad": 1,
        "tiempoHoras": 2.0
      }
    ],
    "insight": "El principal incidente del periodo corresponde a Cable Seccionado, concentrando 5 registros."
  },
  "slide17": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Top Suministros General",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalSuministros": 3352.0,
    "items": [
      {
        "nombre": "CABLE STP",
        "unidad": "MT",
        "cantidad": 1210.0,
        "requerimientos": 1060.0,
        "incidentes": 150.0
      },
      {
        "nombre": "CABLE LEAKY FEEDER",
        "unidad": "MT",
        "cantidad": 1060.0,
        "requerimientos": 800.0,
        "incidentes": 260.0
      },
      {
        "nombre": "CABLES DE COMUNICACIÓN",
        "unidad": "MT",
        "cantidad": 450.0,
        "requerimientos": 200.0,
        "incidentes": 250.0
      },
      {
        "nombre": "CABLE FIBRA OPTICA",
        "unidad": "MT",
        "cantidad": 140.0,
        "requerimientos": 60.0,
        "incidentes": 80.0
      },
      {
        "nombre": "CINTILLO",
        "unidad": "UN",
        "cantidad": 85.0,
        "requerimientos": 85.0,
        "incidentes": 0.0
      },
      {
        "nombre": "CINTILLOS",
        "unidad": "UN",
        "cantidad": 80.0,
        "requerimientos": 80.0,
        "incidentes": 0.0
      },
      {
        "nombre": "TUBO CORUGADO",
        "unidad": "MT",
        "cantidad": 50.0,
        "requerimientos": 50.0,
        "incidentes": 0.0
      },
      {
        "nombre": "CABLE DE ENERGIA",
        "unidad": "MT",
        "cantidad": 40.0,
        "requerimientos": 40.0,
        "incidentes": 0.0
      },
      {
        "nombre": "MANGUITOS TERMOCONTRAIBLES",
        "unidad": "UN",
        "cantidad": 32.0,
        "requerimientos": 2.0,
        "incidentes": 30.0
      },
      {
        "nombre": "TUBERIA CONDUIT",
        "unidad": "MT",
        "cantidad": 30.0,
        "requerimientos": 30.0,
        "incidentes": 0.0
      }
    ],
    "insight": "El suministro de mayor uso corresponde a CABLE STP con 1210.0 MT."
  },
  "slide18": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Suministros en Requerimientos",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalSuministrosRequerimientos": 2571.0,
    "items": [
      {
        "nombre": "CABLE STP",
        "unidad": "MT",
        "cantidad": 1060.0
      },
      {
        "nombre": "CABLE LEAKY FEEDER",
        "unidad": "MT",
        "cantidad": 800.0
      },
      {
        "nombre": "CABLES DE COMUNICACIÓN",
        "unidad": "MT",
        "cantidad": 200.0
      },
      {
        "nombre": "CINTILLO",
        "unidad": "UN",
        "cantidad": 85.0
      },
      {
        "nombre": "CINTILLOS",
        "unidad": "UN",
        "cantidad": 80.0
      },
      {
        "nombre": "CABLE FIBRA OPTICA",
        "unidad": "MT",
        "cantidad": 60.0
      },
      {
        "nombre": "TUBO CORUGADO",
        "unidad": "MT",
        "cantidad": 50.0
      },
      {
        "nombre": "CABLE DE ENERGIA",
        "unidad": "MT",
        "cantidad": 40.0
      },
      {
        "nombre": "TUBERIA CONDUIT",
        "unidad": "MT",
        "cantidad": 30.0
      },
      {
        "nombre": "TELEFONOS",
        "unidad": "UN",
        "cantidad": 25.0
      }
    ],
    "insight": "En requerimientos, el principal suministro utilizado fue CABLE STP con 1060.0 MT."
  },
  "slide19": {
    "titulo": "Panamerican Huarón - Mayo 2026 - Suministros en Incidentes",
    "periodo": "Mayo 2026",
    "logoText": "COMM",
    "totalSuministrosIncidentes": 781.0,
    "items": [
      {
        "nombre": "CABLE LEAKY FEEDER",
        "unidad": "MT",
        "cantidad": 260.0
      },
      {
        "nombre": "CABLES DE COMUNICACIÓN",
        "unidad": "MT",
        "cantidad": 250.0
      },
      {
        "nombre": "CABLE STP",
        "unidad": "MT",
        "cantidad": 150.0
      },
      {
        "nombre": "CABLE FIBRA OPTICA",
        "unidad": "MT",
        "cantidad": 80.0
      },
      {
        "nombre": "MANGUITOS TERMOCONTRAIBLES",
        "unidad": "UN",
        "cantidad": 30.0
      },
      {
        "nombre": "CABLE DUAXIAL",
        "unidad": "MT",
        "cantidad": 2.0
      },
      {
        "nombre": "AMPLIFICADOR BDA 3",
        "unidad": "UN",
        "cantidad": 1.0
      },
      {
        "nombre": "BANDEJA DE EMPALME",
        "unidad": "UN",
        "cantidad": 1.0
      },
      {
        "nombre": "BLOCK",
        "unidad": "UN",
        "cantidad": 1.0
      },
      {
        "nombre": "EMPALME DE LEAKY FEEDER",
        "unidad": "UN",
        "cantidad": 1.0
      }
    ],
    "insight": "En incidentes, el mayor consumo corresponde a CABLE LEAKY FEEDER con 260.0 MT."
  }
};

function getSampleSlide10() {
  return normalizeSlide10Data(HUARON_SAMPLE_DATA.slide10);
}

function getSampleSlide11() {
  return normalizeSlide11Data(HUARON_SAMPLE_DATA.slide11);
}

function getSampleSlide12() {
  return normalizeSlide12Data(HUARON_SAMPLE_DATA.slide12);
}

function getSampleSlide13() {
  return normalizeSlide13Data(HUARON_SAMPLE_DATA.slide13);
}

function getSampleSlide14() {
  return normalizeSlide14Data(HUARON_SAMPLE_DATA.slide14);
}

function getSampleSlide15() {
  return normalizeSlide15Data(HUARON_SAMPLE_DATA.slide15);
}

function getSampleSlide17() {
  return normalizeSlide17Data(HUARON_SAMPLE_DATA.slide17);
}

function getSampleSlide18() {
  return normalizeSlide18Data(HUARON_SAMPLE_DATA.slide18);
}

function getSampleSlide19() {
  return normalizeSlide19Data(HUARON_SAMPLE_DATA.slide19);
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 10
 ****************************************************/

function normalizeSlide10Data(body) {
  const dias = Array.isArray(body.dias) ? body.dias : [];

  const cleanedDias = dias
    .filter(d => d && (d.fecha !== undefined || d.dia !== undefined))
    .map(d => ({
      fecha: String(d.fecha || d.dia || '').trim(),
      dia: String(d.dia || d.fecha || '').trim(),
      atenciones: toNumber(d.atenciones),
      horas: toNumber(d.horas)
    }));

  const totalAtenciones =
    toNumber(body.totalAtenciones) ||
    cleanedDias.reduce((acc, d) => acc + d.atenciones, 0);

  const totalHoras =
    toNumber(body.totalHoras) ||
    cleanedDias.reduce((acc, d) => acc + d.horas, 0);

  const diasConAtencion =
    toNumber(body.diasConAtencion || body.diasPeriodo) ||
    cleanedDias.filter(d => d.atenciones > 0 || d.horas > 0).length;

  const promedioAtencionesDia =
    body.promedioAtencionesDia ||
    (diasConAtencion ? (totalAtenciones / diasConAtencion).toFixed(1) : '0.0');

  const promedioHorasDia =
    body.promedioHorasDia ||
    (diasConAtencion ? (totalHoras / diasConAtencion).toFixed(1) : '0.0');

  const horasPorAtencion =
    body.horasPorAtencion ||
    (totalAtenciones ? (totalHoras / totalAtenciones).toFixed(2) : '0.00');

  const insightPrincipal =
    body.insight ||
    'La distribución diaria evidencia estabilidad operativa y picos controlados de demanda durante el periodo evaluado.';

  const insights =
    Array.isArray(body.insights) && body.insights.length
      ? body.insights
      : [
          insightPrincipal,
          'El volumen de atenciones se mantiene dentro de un comportamiento operativo controlado.',
          'El seguimiento diario permite identificar picos de demanda y mejorar la planificación de recursos.'
        ];

  return {
    titulo:
      body.titulo ||
      `ATENCIONES EN LA OPERACIÓN PANAMERICAN HUARÓN - ${body.periodo || 'PERIODO'}`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    diasPeriodo: toNumber(body.diasPeriodo) || diasConAtencion,
    totalAtenciones,
    totalHoras,
    promedioAtencionesDia,
    promedioHorasDia,
    horasPorAtencion,
    diasConAtencion,

    dias: cleanedDias,

    insight: insightPrincipal,
    insights: insights
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 11
 ****************************************************/

function normalizeSlide11Data(body) {
  const rawMeses = Array.isArray(body.meses)
    ? body.meses
    : Array.isArray(body.mensualItems)
      ? body.mensualItems
      : [];

  let meses = rawMeses
    .filter(item => item && (item.mes || item.periodo || item[0]))
    .map(item => {
      if (Array.isArray(item)) {
        const mina = toNumber(item[1]);
        const superficie = toNumber(item[2]);
        const total = toNumber(item[3]) || mina + superficie;

        return {
          mes: String(item[0] || '').trim(),
          mina,
          superficie,
          total
        };
      }

      const mina = toNumber(
        item.mina ??
        item.im ??
        item.atencionesMina ??
        item.interiorMina ??
        0
      );

      const superficie = toNumber(
        item.superficie ??
        item.sup ??
        item.atencionesSuperficie ??
        0
      );

      const total = toNumber(
        item.total ??
        item.atenciones ??
        item.cantidad ??
        0
      ) || mina + superficie;

      return {
        mes: String(item.mes || item.periodo || '').trim(),
        mina,
        superficie,
        total
      };
    })
    .filter(item => item.mes);

  if (!meses.length) {
    meses = [
      { mes: 'Ene-26', mina: 137, superficie: 23, total: 160 },
      { mes: 'Feb-26', mina: 133, superficie: 10, total: 143 },
      { mes: 'Mar-26', mina: 128, superficie: 21, total: 149 },
      { mes: 'Abr-26', mina: 121, superficie: 16, total: 137 }
    ];
  }

  const totalMinaGlobal =
    toNumber(body.totalMinaGlobal ?? body.minaAtenciones ?? body.totalMina ?? 0) ||
    meses.reduce((acc, item) => acc + item.mina, 0);

  const totalSuperficieGlobal =
    toNumber(body.totalSuperficieGlobal ?? body.superficieAtenciones ?? body.totalSuperficie ?? 0) ||
    meses.reduce((acc, item) => acc + item.superficie, 0);

  const totalAtenciones =
    toNumber(body.totalAtenciones ?? body.totalGeneral ?? 0) ||
    meses.reduce((acc, item) => acc + item.total, 0) ||
    totalMinaGlobal + totalSuperficieGlobal;

  const mesActual = meses[meses.length - 1] || {
    mes: '-',
    mina: 0,
    superficie: 0,
    total: 0
  };

  const totalMesActualValue =
    toNumber(body.totalMesActualValue ?? body.totalMesActual ?? body.totalPeriodo ?? 0) ||
    mesActual.total;

  const participacionMina =
    body.participacionMina ||
    calcPctOneDecimal(totalMinaGlobal, totalAtenciones);

  const participacionSuperficie =
    body.participacionSuperficie ||
    calcPctOneDecimal(totalSuperficieGlobal, totalAtenciones);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Atenciones por Tipo y Evolución Mensual`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    meses,
    mensualItems: meses,

    totalAtenciones,
    totalMinaGlobal,
    totalSuperficieGlobal,

    minaAtenciones: totalMinaGlobal,
    superficieAtenciones: totalSuperficieGlobal,

    participacionMina,
    participacionSuperficie,

    totalMesActualValue,

    insight:
      body.insight ||
      `Predominio de atenciones en la operación minera (${participacionMina}), evidenciando enfoque en servicios preventivos y controlados.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 12
 ****************************************************/

function normalizeSlide12Data(body) {
  const kpis = body.kpis || {};

  const totalAtenciones = toNumber(
    body.totalAtenciones ??
    kpis.totalAtenciones ??
    0
  );

  const incidentes = toNumber(
    body.incidentes ??
    kpis.incidentes ??
    0
  );

  const requerimientos = toNumber(
    body.requerimientos ??
    kpis.requerimientos ??
    0
  );

  const total = totalAtenciones || incidentes + requerimientos;

  const pctIncidentes =
    body.pctIncidentes ??
    kpis.pctIncidentes ??
    calcPct(incidentes, total);

  const pctRequerimientos =
    body.pctRequerimientos ??
    kpis.pctRequerimientos ??
    calcPct(requerimientos, total);

  const brecha = toNumber(
    body.brecha ??
    kpis.brecha ??
    requerimientos - incidentes
  );

  const tabla = normalizeTablaSlide12(body.tabla, {
    incidentes,
    requerimientos,
    total,
    pctIncidentes,
    pctRequerimientos
  });

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Incidentes vs Requerimientos`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalAtenciones: total,
    incidentes,
    requerimientos,
    brecha,

    pctIncidentes,
    pctRequerimientos,

    donutIncidentes: incidentes,
    donutRequerimientos: requerimientos,

    tabla,

    insight:
      body.insight ||
      'La mayoría de las atenciones corresponden a requerimientos, evidenciando prioridad de gestión en actividades planificadas frente a incidencias.'
  };
}

function normalizeTablaSlide12(tabla, base) {
  if (tabla && !Array.isArray(tabla)) {
    return {
      up: tabla.up || 'TOTAL',
      incidentes: tabla.incidentes ?? base.incidentes,
      requerimientos: tabla.requerimientos ?? base.requerimientos,
      total: tabla.total ?? base.total,
      pctIncidentes: tabla.pctIncidentes ?? base.pctIncidentes,
      pctRequerimientos: tabla.pctRequerimientos ?? base.pctRequerimientos,
      pctTotal: tabla.pctTotal || '100%'
    };
  }

  if (Array.isArray(tabla) && tabla.length >= 3) {
    return {
      up: tabla[1][0] || 'TOTAL',
      incidentes: tabla[1][1],
      requerimientos: tabla[1][2],
      total: tabla[1][3],
      pctIncidentes: tabla[2][1],
      pctRequerimientos: tabla[2][2],
      pctTotal: tabla[2][3] || '100%'
    };
  }

  return {
    up: 'TOTAL',
    incidentes: base.incidentes,
    requerimientos: base.requerimientos,
    total: base.total,
    pctIncidentes: base.pctIncidentes,
    pctRequerimientos: base.pctRequerimientos,
    pctTotal: '100%'
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 13
 ****************************************************/

function normalizeSlide13Data(body) {
  const rawMeses = Array.isArray(body.meses)
    ? body.meses
    : Array.isArray(body.mensualItems)
      ? body.mensualItems
      : [];

  let meses = rawMeses
    .filter(item => item && (item.mes || item.periodo || item[0]))
    .map(item => {
      if (Array.isArray(item)) {
        return {
          mes: String(item[0] || '').trim(),
          incidentes: toNumber(item[1]),
          requerimientos: toNumber(item[2])
        };
      }

      return {
        mes: String(item.mes || item.periodo || '').trim(),
        incidentes: toNumber(
          item.incidentes ??
          item.incidente ??
          item.inc ??
          0
        ),
        requerimientos: toNumber(
          item.requerimientos ??
          item.requerimiento ??
          item.req ??
          0
        )
      };
    })
    .filter(item => item.mes);

  if (!meses.length) {
    meses = [
      { mes: 'Jul-25', incidentes: 81, requerimientos: 176 },
      { mes: 'Ago-25', incidentes: 77, requerimientos: 180 },
      { mes: 'Set-25', incidentes: 81, requerimientos: 190 },
      { mes: 'Oct-25', incidentes: 100, requerimientos: 178 },
      { mes: 'Nov-25', incidentes: 90, requerimientos: 224 },
      { mes: 'Dic-25', incidentes: 73, requerimientos: 216 },
      { mes: 'Ene-26', incidentes: 47, requerimientos: 82 },
      { mes: 'Feb-26', incidentes: 50, requerimientos: 90 },
      { mes: 'Mar-26', incidentes: 53, requerimientos: 113 },
      { mes: 'Abr-26', incidentes: 39, requerimientos: 120 }
    ];
  }

  const totalRequerimientos =
    toNumber(body.totalRequerimientos ?? body.requerimientos ?? 0) ||
    meses.reduce((acc, item) => acc + item.requerimientos, 0);

  const totalIncidentes =
    toNumber(body.totalIncidentes ?? body.incidentes ?? 0) ||
    meses.reduce((acc, item) => acc + item.incidentes, 0);

  const totalAtenciones =
    toNumber(body.totalAtenciones ?? body.total ?? 0) ||
    totalRequerimientos + totalIncidentes;

  // Las participaciones siempre se derivan de las cantidades finales.
  // Así se evita conservar un "0%" enviado por un payload desactualizado.
  const participacionRequerimientos =
    calcPctNoDecimal(totalRequerimientos, totalAtenciones);

  const participacionIncidentes =
    calcPctNoDecimal(totalIncidentes, totalAtenciones);

  const promedioMensualTotal =
    body.promedioMensualTotal ||
    (meses.length ? (totalAtenciones / meses.length).toFixed(1) : '0.0');

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Detalle de Requerimientos e Incidentes`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    meses,
    mensualItems: meses,

    totalRequerimientos,
    totalIncidentes,
    totalAtenciones,

    participacionRequerimientos,
    participacionIncidentes,
    promedioMensualTotal,

    insight:
      body.insight ||
      `La gestión operativa se mantiene eficiente, con una alta participación de requerimientos (${participacionRequerimientos}) frente a incidentes (${participacionIncidentes}), lo que evidencia un entorno controlado y predecible.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 14
 ****************************************************/

function normalizeSlide14Data(body) {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.topRequerimientos)
      ? body.topRequerimientos
      : [];

  let items = normalizeParetoItems(rawItems, 'requerimiento');

  const totalTop10 = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalTiempoHoras =
    toNumber(body.totalTiempoHoras ?? body.tiempoTotalHoras ?? body.totalHoras ?? 0) ||
    items.reduce((acc, item) => acc + item.tiempoHoras, 0);

  const totalRequerimientos =
    toNumber(body.totalRequerimientos ?? body.total ?? body.requerimientos ?? 0) ||
    totalTop10;

  items = items.map(item => ({
    ...item,
    porcentaje: item.porcentaje || calcPct(item.cantidad, totalRequerimientos)
  }));

  const top1 = items[0] || {
    nombre: '-',
    cantidad: 0,
    tiempoHoras: 0,
    porcentaje: '0.00%'
  };

  const top2Cantidad = items.slice(0, 2).reduce((acc, item) => acc + item.cantidad, 0);
  const top3Cantidad = items.slice(0, 3).reduce((acc, item) => acc + item.cantidad, 0);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Top 10 Requerimientos`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalRequerimientos,
    totalTop10,
    totalTiempoHoras,

    pctTop2: body.pctTop2 || calcPct(top2Cantidad, totalRequerimientos),
    pctTop3: body.pctTop3 || calcPct(top3Cantidad, totalRequerimientos),
    pctTop10: body.pctTop10 || calcPct(totalTop10, totalRequerimientos),

    items,

    insight:
      body.insight ||
      `La mayor incidencia se concentra en ${top1.nombre}.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 15
 ****************************************************/

function normalizeSlide15Data(body) {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.topIncidentes)
      ? body.topIncidentes
      : [];

  let items = normalizeParetoItems(rawItems, 'incidente');

  const totalTop10 = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalTiempoHoras =
    toNumber(body.totalTiempoHoras ?? body.tiempoTotalHoras ?? body.totalHoras ?? 0) ||
    items.reduce((acc, item) => acc + item.tiempoHoras, 0);

  const totalIncidentes =
    toNumber(body.totalIncidentes ?? body.total ?? body.incidentes ?? 0) ||
    totalTop10;

  items = items.map(item => ({
    ...item,
    porcentaje: item.porcentaje || calcPct(item.cantidad, totalIncidentes)
  }));

  const top1 = items[0] || {
    nombre: '-',
    cantidad: 0,
    tiempoHoras: 0,
    porcentaje: '0.00%'
  };

  const top2Cantidad = items.slice(0, 2).reduce((acc, item) => acc + item.cantidad, 0);
  const top3Cantidad = items.slice(0, 3).reduce((acc, item) => acc + item.cantidad, 0);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Top 10 Incidentes`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalIncidentes,
    totalTop10,
    totalTiempoHoras,

    pctTop2: body.pctTop2 || calcPct(top2Cantidad, totalIncidentes),
    pctTop3: body.pctTop3 || calcPct(top3Cantidad, totalIncidentes),
    pctTop10: body.pctTop10 || calcPct(totalTop10, totalIncidentes),

    items,

    insight:
      body.insight ||
      `La mayor incidencia se concentra en ${top1.nombre}.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 17
 ****************************************************/

function normalizeSlide17Data(body) {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.topSuministros)
      ? body.topSuministros
      : [];

  let items = normalizeSuministroItems(rawItems);

  const totalTop10 = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalSuministros =
    toNumber(body.totalSuministros ?? body.total ?? body.suministros ?? 0) ||
    totalTop10;

  items = items.map(item => ({
    ...item,
    porcentaje: item.porcentaje || calcPct(item.cantidad, totalSuministros)
  }));

  const top1 = items[0] || {
    nombre: '-',
    unidad: '-',
    requerimientos: 0,
    incidentes: 0,
    cantidad: 0,
    porcentaje: '0.00%'
  };

  const top2Cantidad = items.slice(0, 2).reduce((acc, item) => acc + item.cantidad, 0);
  const top3Cantidad = items.slice(0, 3).reduce((acc, item) => acc + item.cantidad, 0);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Top Suministros General`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalSuministros,
    totalTop10,

    pctTop2: body.pctTop2 || calcPct(top2Cantidad, totalSuministros),
    pctTop3: body.pctTop3 || calcPct(top3Cantidad, totalSuministros),
    pctTop10: body.pctTop10 || calcPct(totalTop10, totalSuministros),

    items,

    insight:
      body.insight ||
      `El suministro de mayor uso corresponde a ${top1.nombre}.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 18
 ****************************************************/

function normalizeSlide18Data(body) {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.topSuministrosRequerimientos)
      ? body.topSuministrosRequerimientos
      : [];

  let items = normalizeSuministroSimpleItems(rawItems);

  const totalTop10 = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalSuministrosRequerimientos =
    toNumber(
      body.totalSuministrosRequerimientos ??
      body.totalSuministros ??
      body.total ??
      0
    ) || totalTop10;

  items = items.map(item => ({
    ...item,
    porcentaje: item.porcentaje || calcPct(item.cantidad, totalSuministrosRequerimientos)
  }));

  const top1 = items[0] || {
    nombre: '-',
    unidad: '-',
    cantidad: 0,
    porcentaje: '0.00%'
  };

  const top2Cantidad = items.slice(0, 2).reduce((acc, item) => acc + item.cantidad, 0);
  const top3Cantidad = items.slice(0, 3).reduce((acc, item) => acc + item.cantidad, 0);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Suministros en Requerimientos`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalSuministrosRequerimientos,
    totalSuministros: totalSuministrosRequerimientos,
    totalTop10,

    pctTop2: body.pctTop2 || calcPct(top2Cantidad, totalSuministrosRequerimientos),
    pctTop3: body.pctTop3 || calcPct(top3Cantidad, totalSuministrosRequerimientos),
    pctTop10: body.pctTop10 || calcPct(totalTop10, totalSuministrosRequerimientos),

    items,

    insight:
      body.insight ||
      `El suministro de mayor uso en requerimientos corresponde a ${top1.nombre}.`
  };
}

/****************************************************
 * NORMALIZAR DATOS - SLIDE 19
 ****************************************************/

function normalizeSlide19Data(body) {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.topSuministrosIncidentes)
      ? body.topSuministrosIncidentes
      : [];

  let items = normalizeSuministroSimpleItems(rawItems);

  const totalTop10 = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalSuministrosIncidentes =
    toNumber(
      body.totalSuministrosIncidentes ??
      body.totalSuministros ??
      body.total ??
      0
    ) || totalTop10;

  items = items.map(item => ({
    ...item,
    porcentaje: item.porcentaje || calcPct(item.cantidad, totalSuministrosIncidentes)
  }));

  const top1 = items[0] || {
    nombre: '-',
    unidad: '-',
    cantidad: 0,
    porcentaje: '0.00%'
  };

  const top2Cantidad = items.slice(0, 2).reduce((acc, item) => acc + item.cantidad, 0);
  const top3Cantidad = items.slice(0, 3).reduce((acc, item) => acc + item.cantidad, 0);

  return {
    titulo:
      body.titulo ||
      `Panamerican Huarón - ${body.periodo || 'Periodo'} - Suministros en Incidentes`,

    periodo: body.periodo || 'Periodo',
    logoText: body.logoText || 'COMM',

    totalSuministrosIncidentes,
    totalSuministros: totalSuministrosIncidentes,
    totalTop10,

    pctTop2: body.pctTop2 || calcPct(top2Cantidad, totalSuministrosIncidentes),
    pctTop3: body.pctTop3 || calcPct(top3Cantidad, totalSuministrosIncidentes),
    pctTop10: body.pctTop10 || calcPct(totalTop10, totalSuministrosIncidentes),

    items,

    insight:
      body.insight ||
      `El suministro de mayor uso en incidentes corresponde a ${top1.nombre}.`
  };
}

/****************************************************
 * HELPERS GENERALES
 ****************************************************/

function normalizeParetoItems(rawItems, type) {
  return rawItems
    .filter(item => item && (item.nombre || item.descripcion || item[type] || item[0]))
    .map(item => {
      if (Array.isArray(item)) {
        return {
          nombre: String(item[0] || '').trim(),
          cantidad: toNumber(item[1]),
          tiempoHoras: toNumber(item[2])
        };
      }

      return {
        nombre: String(
          item.nombre ||
          item.descripcion ||
          item[type] ||
          item.requerimiento ||
          item.incidente ||
          ''
        ).trim(),

        cantidad: toNumber(item.cantidad ?? item.total ?? item.valor ?? 0),

        tiempoHoras: toNumber(
          item.tiempoHoras ??
          item.tiempo ??
          item.horas ??
          item.totalHoras ??
          0
        )
      };
    })
    .filter(item => item.nombre && item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function normalizeSuministroItems(rawItems) {
  return rawItems
    .filter(item => item && (item.nombre || item.descripcion || item.suministro || item.material || item[0]))
    .map(item => {
      if (Array.isArray(item)) {
        const req = toNumber(item[2]);
        const inc = toNumber(item[3]);
        const total = toNumber(item[4]) || req + inc;

        return {
          nombre: String(item[0] || '').trim(),
          unidad: String(item[1] || '-').trim(),
          requerimientos: req,
          incidentes: inc,
          cantidad: total
        };
      }

      const req = toNumber(item.requerimientos ?? item.req ?? item.cantidadRequerimientos ?? 0);
      const inc = toNumber(item.incidentes ?? item.inc ?? item.cantidadIncidentes ?? 0);
      const total = toNumber(item.cantidad ?? item.total ?? item.valor ?? 0) || req + inc;

      return {
        nombre: String(
          item.nombre ||
          item.descripcion ||
          item.suministro ||
          item.material ||
          ''
        ).trim(),

        unidad: String(
          item.unidad ||
          item.um ||
          item.medida ||
          '-'
        ).trim(),

        requerimientos: req,
        incidentes: inc,
        cantidad: total
      };
    })
    .filter(item => item.nombre && item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function normalizeSuministroSimpleItems(rawItems) {
  return rawItems
    .filter(item => item && (item.nombre || item.descripcion || item.suministro || item.material || item[0]))
    .map(item => {
      if (Array.isArray(item)) {
        return {
          nombre: String(item[0] || '').trim(),
          unidad: String(item[1] || '-').trim(),
          cantidad: toNumber(item[2])
        };
      }

      return {
        nombre: String(
          item.nombre ||
          item.descripcion ||
          item.suministro ||
          item.material ||
          ''
        ).trim(),

        unidad: String(
          item.unidad ||
          item.um ||
          item.medida ||
          '-'
        ).trim(),

        cantidad: toNumber(item.cantidad ?? item.total ?? item.valor ?? 0)
      };
    })
    .filter(item => item.nombre && item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function toNumber(value) {
  if (typeof value === 'number') return value;

  const txt = String(value || '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  return Number(txt) || 0;
}

function calcPct(value, total) {
  if (!total) return '0.00%';
  return ((Number(value) / Number(total)) * 100).toFixed(2) + '%';
}

function calcPctOneDecimal(value, total) {
  if (!total) return '0.0%';
  return ((Number(value) / Number(total)) * 100).toFixed(1) + '%';
}

function calcPctNoDecimal(value, total) {
  if (!total) return '0%';
  return Math.round((Number(value) / Number(total)) * 100) + '%';
}

function renderEjsToString(viewName, data) {
  return new Promise((resolve, reject) => {
    app.render(viewName, data, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
}

/****************************************************
 * CONVERTIR HTML A PNG
 ****************************************************/

async function htmlToPng(html) {
  let browser;

  try {
    const executablePath = resolveChromeExecutable();

    if (!executablePath) {
      throw new Error(
        'No se encontró Chrome/Chromium. Ejecuta `npm run install:browser` durante el build ' +
        'o configura PUPPETEER_EXECUTABLE_PATH con la ruta del navegador.'
      );
    }

    const launchOptions = {
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    await page.setViewport({
      width: 1600,
      height: 900,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    const cssFiles = ['styles.css', 'comm-standard.css'];

    for (const cssFile of cssFiles) {
      const stylePath = path.join(__dirname, 'public', cssFile);
      if (fs.existsSync(stylePath)) {
        await page.addStyleTag({ path: stylePath });
      }
    }

    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    return Buffer.from(screenshot);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/****************************************************
 * BUSCAR CHROME / EDGE / CHROMIUM
 ****************************************************/

function resolveChromeExecutable() {
  const configuredPaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN
  ].filter(Boolean);

  const systemPaths = [
    // Linux / Render / Docker
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',

    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',

    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ];

  const candidates = [...configuredPaths, ...systemPaths];

  // Puppeteer conoce la ruta de la versión descargada en su caché.
  try {
    const puppeteerPath = puppeteer.executablePath();
    if (puppeteerPath) candidates.unshift(puppeteerPath);
  } catch (error) {
    // La caché aún no existe; continuamos con las demás rutas.
  }

  return candidates.find(candidate => {
    try {
      return candidate && fs.existsSync(candidate);
    } catch (error) {
      return false;
    }
  }) || null;
}

/****************************************************
 * INICIAR SERVIDOR
 ****************************************************/

app.listen(PORT, () => {
  console.log(`Visual engine corriendo en http://localhost:${PORT}`);
});
