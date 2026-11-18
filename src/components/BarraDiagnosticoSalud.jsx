import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Droplet, 
  Bug, 
  Sprout, 
  Clock, 
  RefreshCw,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { 
  ESTADOS_SALUD, 
  calcularSaludLote, 
  obtenerSaludPorLote 
} from '../services/saludLoteService';

/**
 * Barra de Diagnóstico Agronómico y Recomendaciones (HU-036 / Subtarea 3 / CR-016)
 * Se ubica en la cabecera de LoteDetalle.jsx para ofrecer una vista panorámica
 * del estado fenológico, fitosanitario e hídrico del cultivo.
 *
 * @param {Object} props
 * @param {Object} [props.diagnostico] - Diagnóstico previamente calculado
 * @param {number|string} [props.loteId] - ID del lote para carga dinámica
 * @param {Function} [props.onRefresh] - Callback al pulsar refrescar
 */
export default function BarraDiagnosticoSalud({ diagnostico: diagnosticoProp, loteId, onRefresh }) {
  const [diagnostico, setDiagnostico] = useState(diagnosticoProp || null);
  const [loading, setLoading] = useState(!diagnosticoProp && Boolean(loteId));

  const cargarSalud = async () => {
    if (!loteId) return;
    setLoading(true);
    try {
      const diag = await obtenerSaludPorLote(loteId);
      setDiagnostico(diag);
      if (onRefresh) onRefresh(diag);
    } catch (err) {
      console.error('Error al actualizar barra de diagnóstico:', err);
      setDiagnostico(calcularSaludLote());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diagnosticoProp) {
      setDiagnostico(diagnosticoProp);
      setLoading(false);
    } else if (loteId) {
      cargarSalud();
    }
  }, [diagnosticoProp, loteId]);

  const diag = diagnostico || calcularSaludLote();

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-sm mb-8 relative overflow-hidden transition-all duration-300">
      {/* Adorno visual de fondo */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-bl-full pointer-events-none opacity-20 ${
        diag.estado === ESTADOS_SALUD.CRITICO ? 'bg-red-400' :
        diag.estado === ESTADOS_SALUD.PRECAUCION ? 'bg-amber-400' :
        diag.estado === ESTADOS_SALUD.OPTIMO ? 'bg-emerald-400' :
        'bg-gray-200'
      }`} />

      {/* CABECERA DE LA BARRA DE DIAGNÓSTICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
            diag.estado === ESTADOS_SALUD.CRITICO ? 'bg-red-100 text-red-700' :
            diag.estado === ESTADOS_SALUD.PRECAUCION ? 'bg-amber-100 text-amber-800' :
            diag.estado === ESTADOS_SALUD.OPTIMO ? 'bg-emerald-100 text-emerald-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Diagnóstico Agronómico del Lote
              </h2>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 tracking-wider">
                HU-036 / Semáforo
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Síntesis integral de salud fitosanitaria, lámina de agua y vigor fenológico
            </p>
          </div>
        </div>

        {/* Badge Principal del Semáforo */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {diag.estado === ESTADOS_SALUD.CRITICO && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${diag.dotClass}`}></span>
            </span>

            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${diag.badgeClass}`}>
              {diag.label} {diag.score !== null ? `(${diag.score}%)` : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={cargarSalud}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Recalcular salud del lote"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* BARRA DE PROGRESO DE SALUD */}
      {diag.score !== null && (
        <div className="mb-6 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-400">Escala de Salud Agronómica:</span>
              <span className="font-extrabold text-gray-900">{diag.titulo}</span>
            </span>
            <span className="font-black text-sm text-gray-900">{diag.score} / 100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${diag.barClass}`}
              style={{ width: `${Math.max(5, diag.score)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* TARJETAS DE LOS TRES PILARES AGRONÓMICOS (GRID 3 COLUMNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* 1. Pilar Fitosanitario */}
        <div className={`p-4 rounded-2xl border transition-all ${
          diag.detalles.fitosanitario.estado === 'CRITICO' ? 'bg-red-50/70 border-red-200' :
          diag.detalles.fitosanitario.estado === 'PRECAUCION' ? 'bg-amber-50/70 border-amber-200' :
          'bg-gray-50/80 border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-black text-gray-800">
              <Bug className="w-4 h-4 text-purple-600" /> Sanidad Fitosanitaria
            </span>
            <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase ${
              diag.detalles.fitosanitario.estado === 'CRITICO' ? 'bg-red-200 text-red-800' :
              diag.detalles.fitosanitario.estado === 'PRECAUCION' ? 'bg-amber-200 text-amber-900' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {diag.detalles.fitosanitario.estado}
            </span>
          </div>
          <div className="text-xl font-black text-gray-900 mb-1">
            {diag.detalles.fitosanitario.valor || 'Sin Daño'}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {diag.detalles.fitosanitario.texto}
          </p>
          <p className="text-3xs text-gray-400 mt-2 italic">
            Umbral crítico: &gt; 15% de afectación
          </p>
        </div>

        {/* 2. Pilar Hídrico */}
        <div className={`p-4 rounded-2xl border transition-all ${
          diag.detalles.hidrico.estado === 'CRITICO' ? 'bg-red-50/70 border-red-200' :
          diag.detalles.hidrico.estado === 'PRECAUCION' ? 'bg-amber-50/70 border-amber-200' :
          'bg-gray-50/80 border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-black text-gray-800">
              <Droplet className="w-4 h-4 text-blue-600" /> Lámina y Riego
            </span>
            <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase ${
              diag.detalles.hidrico.estado === 'CRITICO' ? 'bg-red-200 text-red-800' :
              diag.detalles.hidrico.estado === 'PRECAUCION' ? 'bg-amber-200 text-amber-900' :
              'bg-blue-100 text-blue-800'
            }`}>
              {diag.detalles.hidrico.estado}
            </span>
          </div>
          <div className="text-xl font-black text-gray-900 mb-1">
            {diag.detalles.hidrico.valor || 'N/A'}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {diag.detalles.hidrico.texto}
          </p>
          <p className="text-3xs text-gray-400 mt-2 italic">
            Óptimo: 4 a 10 cm • Crítico: &lt; 2 cm
          </p>
        </div>

        {/* 3. Pilar Fenológico / Vigor */}
        <div className={`p-4 rounded-2xl border transition-all ${
          diag.detalles.fenologia.estado === 'CRITICO' ? 'bg-red-50/70 border-red-200' :
          diag.detalles.fenologia.estado === 'PRECAUCION' ? 'bg-amber-50/70 border-amber-200' :
          'bg-gray-50/80 border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-black text-gray-800">
              <Sprout className="w-4 h-4 text-emerald-600" /> Vigor del Cultivo
            </span>
            <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase ${
              diag.detalles.fenologia.estado === 'CRITICO' ? 'bg-red-200 text-red-800' :
              diag.detalles.fenologia.estado === 'PRECAUCION' ? 'bg-amber-200 text-amber-900' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {diag.detalles.fenologia.estado}
            </span>
          </div>
          <div className="text-xl font-black text-gray-900 mb-1 capitalize">
            {diag.detalles.fenologia.valor ? diag.detalles.fenologia.valor.toLowerCase() : 'Pendiente'}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {diag.detalles.fenologia.texto}
          </p>
          <p className="text-3xs text-gray-400 mt-2 italic">
            Vigor regular o malo requiere ajuste nutricional
          </p>
        </div>
      </div>

      {/* BANNER DE RECOMENDACIÓN TÉCNICA EN CAMPO */}
      <div className={`p-4 sm:p-5 rounded-2xl border relative z-10 transition-all ${
        diag.estado === ESTADOS_SALUD.CRITICO ? 'bg-red-50 border-red-200 text-red-900' :
        diag.estado === ESTADOS_SALUD.PRECAUCION ? 'bg-amber-50 border-amber-200 text-amber-950' :
        diag.estado === ESTADOS_SALUD.OPTIMO ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
        'bg-gray-50 border-gray-200 text-gray-800'
      }`}>
        <div className="flex gap-3.5 items-start">
          <div className="shrink-0 mt-0.5">
            {diag.estado === ESTADOS_SALUD.CRITICO ? (
              <ShieldAlert className="w-6 h-6 text-red-600" />
            ) : diag.estado === ESTADOS_SALUD.PRECAUCION ? (
              <Clock className="w-6 h-6 text-amber-600" />
            ) : diag.estado === ESTADOS_SALUD.OPTIMO ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ) : (
              <HelpCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-sm mb-1 flex items-center gap-2">
              <span>{diag.accionCorta}</span>
            </h4>
            <p className="text-xs font-medium leading-relaxed">
              {diag.recomendacion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
