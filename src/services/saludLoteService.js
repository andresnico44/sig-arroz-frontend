/**
 * Servicio / Helper para el cálculo del semáforo e indicador visual de salud general del lote.
 * HU-036: Indicador Visual de Salud General del Lote (Semáforo Agronómico)
 * Origen: CR-016 (Mejora de Monitoreo Integral y Visualización Agronómica)
 * Criterios de Aceptación:
 * - Escenario 1: Crítico (Rojo) -> daño > 15%, lámina < 2 cm o vigor MALO
 * - Escenario 2: Precaución (Amarillo) -> daño 5-15%, lámina 2-3.5 cm o vigor REGULAR
 * - Escenario 3: Óptimo (Verde) -> daño < 5%, lámina óptima 4-10 cm y vigor BUENO/EXCELENTE
 */

import api from '../api';

export const ESTADOS_SALUD = {
  CRITICO: 'CRITICO',
  PRECAUCION: 'PRECAUCION',
  OPTIMO: 'OPTIMO',
  SIN_DATOS: 'SIN_DATOS',
};

export const CONFIG_SALUD = {
  [ESTADOS_SALUD.CRITICO]: {
    id: ESTADOS_SALUD.CRITICO,
    label: 'Crítico',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500 shadow-red-200',
    barClass: 'bg-red-500',
    borderClass: 'border-red-500',
    iconColor: 'text-red-500',
    bgLight: 'bg-red-50/70',
    titulo: 'Atención Crítica Requerida',
    accionCorta: 'Acción correctiva urgente requerida',
    defaultScore: 25,
  },
  [ESTADOS_SALUD.PRECAUCION]: {
    id: ESTADOS_SALUD.PRECAUCION,
    label: 'Precaución',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500 shadow-amber-200',
    barClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    iconColor: 'text-amber-500',
    bgLight: 'bg-amber-50/70',
    titulo: 'Atención Preventiva',
    accionCorta: 'Inspección técnica recomendada en 48 horas',
    defaultScore: 65,
  },
  [ESTADOS_SALUD.OPTIMO]: {
    id: ESTADOS_SALUD.OPTIMO,
    label: 'Óptimo',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500 shadow-emerald-200',
    barClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    iconColor: 'text-emerald-500',
    bgLight: 'bg-emerald-50/70',
    titulo: 'Desarrollo Normal',
    accionCorta: 'Parámetros agronómicos en rango óptimo',
    defaultScore: 95,
  },
  [ESTADOS_SALUD.SIN_DATOS]: {
    id: ESTADOS_SALUD.SIN_DATOS,
    label: 'Sin Monitoreo',
    badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
    barClass: 'bg-gray-300',
    borderClass: 'border-gray-300',
    iconColor: 'text-gray-400',
    bgLight: 'bg-gray-50',
    titulo: 'Sin Monitoreo Reciente',
    accionCorta: 'Sin registros recientes de monitoreo',
    defaultScore: 0,
  },
};

/**
 * Calcula el estado de salud, score (0-100), anomalías y recomendaciones agronómicas.
 *
 * @param {Object} params
 * @param {Object|null} params.fenologia - Último seguimiento fenológico { estado_general, fase, fecha }
 * @param {Object|Array|null} params.fitosanitario - Último(s) monitoreo(s) { umbral_danio_porcentaje, tipo_problema, nombre_comun }
 * @param {Object|null} params.hidrico - Último registro hídrico { lamina_agua_cm, fuente_hidrica, fecha }
 * @returns {Object} Diagnóstico consolidado del lote
 */
export function calcularSaludLote({ fenologia = null, fitosanitario = null, hidrico = null } = {}) {
  // Extraer valores normalizados
  const vigor = fenologia?.estado_general ? String(fenologia.estado_general).toUpperCase().trim() : null;

  // En fitosanitario puede ser un objeto o arreglo de problemas activos
  let danioPorcentaje = 0;
  let plagaPrincipal = null;

  if (Array.isArray(fitosanitario) && fitosanitario.length > 0) {
    // Tomar el daño máximo reportado entre plagas/enfermedades
    const maxDanioItem = fitosanitario.reduce((prev, curr) => {
      const valCurr = parseFloat(curr.umbral_danio_porcentaje) || 0;
      const valPrev = parseFloat(prev?.umbral_danio_porcentaje) || 0;
      return valCurr > valPrev ? curr : prev;
    }, fitosanitario[0]);

    danioPorcentaje = parseFloat(maxDanioItem?.umbral_danio_porcentaje) || 0;
    plagaPrincipal = maxDanioItem?.nombre_comun || maxDanioItem?.tipo_problema || null;
  } else if (fitosanitario) {
    danioPorcentaje = parseFloat(fitosanitario.umbral_danio_porcentaje) || 0;
    plagaPrincipal = fitosanitario.nombre_comun || fitosanitario.tipo_problema || null;
  }

  const tieneFitosanitario = fitosanitario !== null && fitosanitario !== undefined;
  const tieneHidrico = hidrico !== null && hidrico !== undefined && hidrico.lamina_agua_cm !== undefined && hidrico.lamina_agua_cm !== null;
  const laminaAgua = tieneHidrico ? parseFloat(hidrico.lamina_agua_cm) : null;
  const tieneFenologia = Boolean(vigor);

  // Si no hay datos de ningún pilar
  if (!tieneFenologia && !tieneFitosanitario && !tieneHidrico) {
    return {
      estado: ESTADOS_SALUD.SIN_DATOS,
      ...CONFIG_SALUD[ESTADOS_SALUD.SIN_DATOS],
      score: null,
      recomendacion: 'No se registran monitoreos activos en este ciclo para calcular el semáforo de salud.',
      alertas: [],
      detalles: {
        fenologia: { valor: null, estado: 'SIN_DATOS', texto: 'Sin registros fenológicos' },
        fitosanitario: { valor: null, estado: 'SIN_DATOS', texto: 'Sin reportes de plagas/enfermedades' },
        hidrico: { valor: null, estado: 'SIN_DATOS', texto: 'Sin mediciones de lámina' },
      },
    };
  }

  const alertas = [];
  const advertencias = [];

  // =========================================================================
  // 1. EVALUACIÓN FITOSANITARIA (RF-21, RF-31 / HU-036)
  // =========================================================================
  let estadoFito = 'OPTIMO';
  let textoFito = `Incidencia baja (${danioPorcentaje}%)`;

  if (tieneFitosanitario) {
    if (danioPorcentaje > 15) {
      estadoFito = 'CRITICO';
      textoFito = `Daño crítico (${danioPorcentaje}%)${plagaPrincipal ? ` por ${plagaPrincipal}` : ''}`;
      alertas.push({
        tipo: 'FITOSANITARIO',
        severidad: 'CRITICA',
        mensaje: `Afección fitosanitaria del ${danioPorcentaje}% supera el umbral de daño económico (15%).`,
      });
    } else if (danioPorcentaje >= 5) {
      estadoFito = 'PRECAUCION';
      textoFito = `Incidencia moderada (${danioPorcentaje}%)${plagaPrincipal ? ` (${plagaPrincipal})` : ''}`;
      advertencias.push({
        tipo: 'FITOSANITARIO',
        severidad: 'PREVENTIVA',
        mensaje: `Incidencia fitosanitaria en rango de advertencia (${danioPorcentaje}%). Monitorear progresión.`,
      });
    }
  }

  // =========================================================================
  // 2. EVALUACIÓN HÍDRICA (RF-26, RF-29 / HU-036)
  // =========================================================================
  let estadoHidrico = 'OPTIMO';
  let textoHidrico = laminaAgua !== null ? `Lámina óptima (${laminaAgua} cm)` : 'Sin datos de lámina';

  if (tieneHidrico) {
    if (laminaAgua < 2.0) {
      estadoHidrico = 'CRITICO';
      textoHidrico = `Déficit hídrico crítico (${laminaAgua} cm < 2 cm)`;
      alertas.push({
        tipo: 'HIDRICO',
        severidad: 'CRITICA',
        mensaje: `Lámina de agua en ${laminaAgua} cm (< 2 cm). Riesgo de estrés hídrico severo.`,
      });
    } else if (laminaAgua >= 2.0 && laminaAgua <= 3.5) {
      estadoHidrico = 'PRECAUCION';
      textoHidrico = `Lámina baja preventiva (${laminaAgua} cm)`;
      advertencias.push({
        tipo: 'HIDRICO',
        severidad: 'PREVENTIVA',
        mensaje: `Lámina de agua baja (${laminaAgua} cm). Programar turno de riego en 48 horas.`,
      });
    } else if (laminaAgua > 15.0) {
      // Sobre-inundación crítica
      estadoHidrico = 'PRECAUCION';
      textoHidrico = `Sobre-inundación (${laminaAgua} cm)`;
      advertencias.push({
        tipo: 'HIDRICO',
        severidad: 'PREVENTIVA',
        mensaje: `Lámina excesiva (${laminaAgua} cm). Verificar compuertas de drenaje.`,
      });
    }
  }

  // =========================================================================
  // 3. EVALUACIÓN FENOLÓGICA / VIGOR (RF-23, RF-32 / HU-036)
  // =========================================================================
  let estadoFeno = 'OPTIMO';
  let textoFeno = vigor ? `Vigor ${vigor.toLowerCase()}` : 'Sin reporte de vigor';

  if (tieneFenologia) {
    if (vigor === 'MALO') {
      estadoFeno = 'CRITICO';
      textoFeno = 'Vigor deficiente (MALO)';
      alertas.push({
        tipo: 'FENOLOGIA',
        severidad: 'CRITICA',
        mensaje: 'Vigor general clasificado como MALO: amarillamiento o estancamiento vegetativo.',
      });
    } else if (vigor === 'REGULAR') {
      estadoFeno = 'PRECAUCION';
      textoFeno = 'Vigor regular (REGULAR)';
      advertencias.push({
        tipo: 'FENOLOGIA',
        severidad: 'PREVENTIVA',
        mensaje: 'Vigor clasificado como REGULAR: requiere revisión de plan de fertilización.',
      });
    }
  }

  // =========================================================================
  // SÍNTESIS FINAL DEL SEMÁFORO (Gherkin: Escenarios 1, 2 y 3)
  // =========================================================================
  let estadoFinal = ESTADOS_SALUD.OPTIMO;
  let recomendacion = 'El cultivo presenta desarrollo normal. Mantener el monitoreo fitosanitario y régimen hídrico habitual.';
  let scoreBase = 95;

  if (alertas.length > 0) {
    // Escenario 1: Crítico (Rojo)
    estadoFinal = ESTADOS_SALUD.CRITICO;
    scoreBase = Math.max(15, 45 - (alertas.length * 10));
    recomendacion = 'Acción correctiva inmediata requerida: ' + alertas.map(a => a.mensaje).join(' ');
  } else if (advertencias.length > 0) {
    // Escenario 2: Preventivo (Amarillo)
    estadoFinal = ESTADOS_SALUD.PRECAUCION;
    scoreBase = Math.max(50, 75 - (advertencias.length * 8));
    recomendacion = 'Inspección técnica requerida en 48 horas: ' + advertencias.map(w => w.mensaje).join(' ');
  } else {
    // Escenario 3: Óptimo (Verde)
    estadoFinal = ESTADOS_SALUD.OPTIMO;
    scoreBase = 96;
    recomendacion = 'Lote en estado óptimo. Parámetros fitosanitarios (< 5%), hídricos (4-10 cm) y fenológicos (vigor adecuado) dentro de rangos normales.';
  }

  return {
    estado: estadoFinal,
    ...CONFIG_SALUD[estadoFinal],
    score: scoreBase,
    recomendacion,
    alertas,
    advertencias,
    detalles: {
      fitosanitario: {
        valor: tieneFitosanitario ? `${danioPorcentaje}%` : null,
        estado: estadoFito,
        texto: textoFito,
      },
      hidrico: {
        valor: tieneHidrico ? `${laminaAgua} cm` : null,
        estado: estadoHidrico,
        texto: textoHidrico,
      },
      fenologia: {
        valor: vigor || null,
        estado: estadoFeno,
        texto: textoFeno,
      },
    },
  };
}

/**
 * Consulta la API y sintetiza el semáforo para un ciclo específico.
 *
 * @param {number|string} cicloId
 * @returns {Promise<Object>} Diagnóstico de salud consolidado
 */
export async function obtenerSaludPorCiclo(cicloId) {
  if (!cicloId) {
    return calcularSaludLote();
  }

  try {
    const [resFeno, resFito, resHidrico] = await Promise.allSettled([
      api.get(`/api/seguimientos/?ciclo_id=${cicloId}`),
      api.get(`/api/monitoreos/?ciclo_id=${cicloId}`),
      api.get(`/api/riegos/?ciclo_id=${cicloId}`),
    ]);

    const seguimientos = resFeno.status === 'fulfilled' ? (resFeno.value.data || []) : [];
    const monitoreos = resFito.status === 'fulfilled' ? (resFito.value.data || []) : [];
    const riegos = resHidrico.status === 'fulfilled' ? (resHidrico.value.data || []) : [];

    // Último seguimiento fenológico
    const ultimoFeno = Array.isArray(seguimientos) && seguimientos.length > 0 ? seguimientos[0] : null;

    // Últimos monitoreos (pasamos la lista para tomar el daño más crítico)
    const fitosanitarios = Array.isArray(monitoreos) && monitoreos.length > 0 ? monitoreos : null;

    // Último registro hídrico
    const ultimoHidrico = Array.isArray(riegos) && riegos.length > 0 ? riegos[0] : null;

    return calcularSaludLote({
      fenologia: ultimoFeno,
      fitosanitario: fitosanitarios,
      hidrico: ultimoHidrico,
    });
  } catch (error) {
    console.error('Error al calcular salud para ciclo', cicloId, error);
    return calcularSaludLote();
  }
}

/**
 * Consulta la API para determinar el ciclo activo de un lote y retorna su estado de salud.
 *
 * @param {number|string} loteId
 * @returns {Promise<Object>} Diagnóstico de salud con referencia al ciclo analizado
 */
export async function obtenerSaludPorLote(loteId) {
  if (!loteId) {
    return { ...calcularSaludLote(), cicloId: null, cicloNombre: null };
  }

  try {
    const resCiclos = await api.get(`/api/ciclos/?lote_id=${loteId}`);
    const ciclos = resCiclos.data || [];

    if (!Array.isArray(ciclos) || ciclos.length === 0) {
      return {
        ...calcularSaludLote(),
        cicloId: null,
        cicloNombre: null,
      };
    }

    // Buscar ciclo activo (no cosechado ni finalizado)
    const cicloActivo = ciclos.find(c => 
      !['COSECHADO', 'FINALIZADO'].includes(String(c.estado).toUpperCase())
    ) || ciclos[0];

    const diagnostico = await obtenerSaludPorCiclo(cicloActivo.id);
    return {
      ...diagnostico,
      cicloId: cicloActivo.id,
      cicloNombre: cicloActivo.nombre_ciclo,
    };
  } catch (error) {
    console.error('Error al consultar ciclos para salud de lote', loteId, error);
    return { ...calcularSaludLote(), cicloId: null, cicloNombre: null };
  }
}
