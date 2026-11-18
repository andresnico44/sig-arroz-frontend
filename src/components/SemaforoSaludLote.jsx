import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  Droplet, 
  Bug, 
  Sprout, 
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  ESTADOS_SALUD, 
  calcularSaludLote, 
  obtenerSaludPorLote 
} from '../services/saludLoteService';

/**
 * Componente Visual de Semáforo de Salud Agronómica (HU-036 / CR-016)
 * Incluye Badge interactivo + Tooltip desplegable con diagnóstico detallado
 *
 * @param {Object} props
 * @param {Object} [props.diagnostico] - Objeto ya calculado por calcularSaludLote
 * @param {number|string} [props.loteId] - ID del lote para carga asíncrona automática
 * @param {boolean} [props.compact=false] - Modo compacto para tarjetas o tablas
 * @param {boolean} [props.showScore=true] - Muestra el porcentaje/score numérico
 * @param {string} [props.className=''] - Clases adicionales de Tailwind
 */
export default function SemaforoSaludLote({
  diagnostico: diagnosticoProp,
  loteId,
  compact = false,
  showScore = true,
  className = '',
}) {
  const [diagnostico, setDiagnostico] = useState(diagnosticoProp || null);
  const [loading, setLoading] = useState(!diagnosticoProp && Boolean(loteId));
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Si cambia el prop directo, actualizar
  useEffect(() => {
    if (diagnosticoProp) {
      setDiagnostico(diagnosticoProp);
      setLoading(false);
    }
  }, [diagnosticoProp]);

  // Si se provee loteId y no hay diagnóstico directo, cargar de la API
  useEffect(() => {
    if (!diagnosticoProp && loteId) {
      let isMounted = true;
      setLoading(true);

      obtenerSaludPorLote(loteId)
        .then((diag) => {
          if (isMounted) {
            setDiagnostico(diag);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setDiagnostico(calcularSaludLote());
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [loteId, diagnosticoProp]);

  // Fallback si no hay diagnóstico
  const diag = diagnostico || calcularSaludLote();

  // Icono según estado
  const renderIcon = (tam = 'w-3.5 h-3.5') => {
    switch (diag.estado) {
      case ESTADOS_SALUD.CRITICO:
        return <AlertTriangle className={`${tam} text-red-600 shrink-0`} />;
      case ESTADOS_SALUD.PRECAUCION:
        return <AlertTriangle className={`${tam} text-amber-600 shrink-0`} />;
      case ESTADOS_SALUD.OPTIMO:
        return <CheckCircle2 className={`${tam} text-emerald-600 shrink-0`} />;
      default:
        return <HelpCircle className={`${tam} text-gray-400 shrink-0`} />;
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-xs animate-pulse ${className}`}>
        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        <span>Evaluando salud...</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
      onClick={(e) => {
        // Evitar que el clic en el badge active la navegación del card contenedor
        e.stopPropagation();
      }}
    >
      {/* BADGE VISUAL INTERACTIVO */}
      <button
        type="button"
        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${diag.badgeClass} focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500`}
        aria-label={`Salud del lote: ${diag.label}`}
        title="Clic para ver desglose agronómico"
      >
        {/* Punto de color con pulso si es crítico */}
        <span className="relative flex h-2 w-2">
          {diag.estado === ESTADOS_SALUD.CRITICO && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${diag.dotClass}`}></span>
        </span>

        {renderIcon('w-3.5 h-3.5')}

        <span className="tracking-wide">{diag.label}</span>

        {showScore && diag.score !== null && (
          <span className="opacity-75 font-semibold text-3xs border-l border-current/20 pl-1.5 ml-0.5">
            {diag.score}%
          </span>
        )}
      </button>

      {/* TOOLTIP / POPOVER DESPLEGABLE */}
      {isTooltipOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 sm:w-96 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl text-left text-gray-800 text-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Triangulito flecha inferior */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>

          {/* Encabezado del Tooltip */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-2.5 mb-3">
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-gray-900">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Diagnóstico de Salud</span>
              </div>
              <p className="text-gray-500 text-3xs font-medium mt-0.5">
                Semáforo Agronómico (CR-016 / HU-036)
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wide border ${diag.badgeClass}`}>
              {diag.label} {diag.score !== null ? `• ${diag.score}%` : ''}
            </span>
          </div>

          {/* Barra de Score */}
          {diag.score !== null && (
            <div className="mb-3.5">
              <div className="flex justify-between text-3xs font-bold text-gray-600 mb-1">
                <span>Índice de Vigor y Sanidad</span>
                <span className="font-extrabold">{diag.score} / 100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${diag.barClass}`}
                  style={{ width: `${diag.score}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Desglose de los 3 Pilares Agronómicos */}
          <div className="space-y-2 mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            {/* 1. Fitosanitario */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <Bug className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                Fitosanitario:
              </span>
              <span className={`font-semibold text-3xs px-2 py-0.5 rounded-md ${
                diag.detalles.fitosanitario.estado === 'CRITICO' ? 'bg-red-100 text-red-700 font-bold' :
                diag.detalles.fitosanitario.estado === 'PRECAUCION' ? 'bg-amber-100 text-amber-800 font-bold' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {diag.detalles.fitosanitario.texto}
              </span>
            </div>

            {/* 2. Hídrico */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <Droplet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Lámina de Agua:
              </span>
              <span className={`font-semibold text-3xs px-2 py-0.5 rounded-md ${
                diag.detalles.hidrico.estado === 'CRITICO' ? 'bg-red-100 text-red-700 font-bold' :
                diag.detalles.hidrico.estado === 'PRECAUCION' ? 'bg-amber-100 text-amber-800 font-bold' :
                'bg-blue-100 text-blue-700'
              }`}>
                {diag.detalles.hidrico.texto}
              </span>
            </div>

            {/* 3. Fenología */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Vigor del Cultivo:
              </span>
              <span className={`font-semibold text-3xs px-2 py-0.5 rounded-md ${
                diag.detalles.fenologia.estado === 'CRITICO' ? 'bg-red-100 text-red-700 font-bold' :
                diag.detalles.fenologia.estado === 'PRECAUCION' ? 'bg-amber-100 text-amber-800 font-bold' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {diag.detalles.fenologia.texto}
              </span>
            </div>
          </div>

          {/* Recomendación Agronómica Específica */}
          <div className={`p-2.5 rounded-xl border text-3xs leading-relaxed ${
            diag.estado === ESTADOS_SALUD.CRITICO ? 'bg-red-50 text-red-800 border-red-200' :
            diag.estado === ESTADOS_SALUD.PRECAUCION ? 'bg-amber-50 text-amber-900 border-amber-200' :
            diag.estado === ESTADOS_SALUD.OPTIMO ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            <div className="flex gap-1.5 items-start">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Recomendación Técnica:</strong>
                <span>{diag.recomendacion}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
