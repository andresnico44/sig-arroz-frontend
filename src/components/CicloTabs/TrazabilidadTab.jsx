/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function TrazabilidadTab({ 
  // State
  loteData, fincaData, cicloData,
  preparaciones, siembra, fenologia, monitoreos, aplicaciones, fertilizaciones, riegos, costos, offlineMonitoreos, cosecha, liquidacion, trazabilidad,
  isModalPrepOpen, isModalFenoOpen, isModalMonitoreoOpen, isModalAplicacionOpen, isModalFertilizacionOpen, isModalRiegoOpen, isModalCostoOpen, isModalCosechaOpen, isModalLiquidacionOpen,
  nuevaPrep, nuevaSiembra, nuevaFeno, nuevoMonitoreo, nuevaAplicacion, nuevaFertilizacion, nuevoRiego, nuevoCosto, nuevaCosecha, nuevaLiquidacion,
  saving, syncing, loadingTrazabilidad,
  faseToLabel,
  
  // Setters
  setIsModalPrepOpen, setIsModalFenoOpen, setIsModalMonitoreoOpen, setIsModalAplicacionOpen, setIsModalFertilizacionOpen, setIsModalRiegoOpen, setIsModalCostoOpen, setIsModalCosechaOpen, setIsModalLiquidacionOpen,
  setNuevaPrep, setNuevaSiembra, setNuevaFeno, setNuevoMonitoreo, setNuevaAplicacion, setNuevaFertilizacion, setNuevoRiego, setNuevoCosto, setNuevaCosecha, setNuevaLiquidacion,
  setActiveTab,
  
  // Handlers
  handleCreatePrep, handleDeletePrep, handleCreateSiembra, handleCreateFeno, handleDeleteFeno,
  handleCreateMonitoreo, handleCreateAplicacion, handleCreateFertilizacion, handleCreateRiego, 
  handleCreateCosto, handleDeleteCosto, handleCreateCosecha, handleCreateLiquidacion,
  handleSyncOffline, handleImprimirTrazabilidad, handleEditCostoSubmit, editCostoId, setEditCostoId,
  editCostoData, setEditCostoData
}) {
  return (
    <motion.div key="traz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 print:bg-white print:p-0 print:shadow-none">
                  {/* Estilo para impresión */}
                  <style>{`
                    @media print {
                      nav, .sticky, button, .tab-switcher, .hide-scrollbar, .mb-6, a, header, .no-print, .btn, footer {
                        display: none !important;
                      }
                      body {
                        background-color: white !important;
                        color: black !important;
                      }
                      main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                      }
                      .print-full-width {
                        width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                      }
                    }
                  `}</style>

                  {loadingTrazabilidad ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-3xl">
                      <Loader className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                      <p className="text-sm text-gray-500 font-bold">Consolidando trazabilidad del ciclo agronómico...</p>
                    </div>
                  ) : !trazabilidad ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center">
                      <Scroll className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-900 font-bold">No se pudo cargar la trazabilidad</h3>
                      <p className="text-gray-500 text-sm mt-1">Por favor verifica tu conexión o reintenta.</p>
                    </div>
                  ) : (
                    <div className="space-y-8 print-full-width">
                      {/* Cabecera del Reporte */}
                      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden print:border-b-2 print:border-emerald-300 print:rounded-none">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider print:bg-transparent print:border print:border-emerald-300">
                              Ficha de Trazabilidad Integral
                            </span>
                            <span className="text-2xs font-bold text-gray-400 no-print">SIG-ARROZ V3.0</span>
                          </div>
                          <h1 className="text-2xl font-black text-gray-900 mt-2">Reporte de Campaña: {trazabilidad.ciclo.nombre_ciclo}</h1>
                          <p className="text-xs font-semibold text-gray-500 mt-1">
                            Finca: {trazabilidad.finca.nombre} | Lote: {trazabilidad.lote.nombre} ({trazabilidad.lote.area_hectareas} Ha)
                          </p>
                        </div>
                        <button 
                          onClick={() => window.print()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-emerald-600/10 no-print"
                        >
                          <Printer className="w-4 h-4" /> Generar Ficha PDF
                        </button>
                      </div>

                      {/* WOW Balance Financiero Consolidado (HU-14) */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Costos vs Ingresos */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 print:border">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Flujo Consolidado</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                              <span>Egresos acumulados:</span>
                              <span className="font-bold text-gray-900">{formatCOP(trazabilidad.resumen_financiero.total_egresos)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                              <span>Ingresos netos del molino:</span>
                              <span className="font-bold text-emerald-600">{formatCOP(trazabilidad.resumen_financiero.ingreso_neto)}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-black text-gray-800">Margen Comercial:</span>
                            <span className={`text-base font-extrabold ${trazabilidad.resumen_financiero.balance_neto >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
                              {formatCOP(trazabilidad.resumen_financiero.balance_neto)}
                            </span>
                          </div>
                        </div>

                        {/* Rentabilidad por Hectárea (HU-14) */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 print:border">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Rendimiento Financiero por Ha</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                              <span>Costo / Hectárea:</span>
                              <span className="font-bold text-gray-900">{formatCOP(trazabilidad.resumen_financiero.costo_por_hectarea)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                              <span>Ingreso / Hectárea:</span>
                              <span className="font-bold text-emerald-600">{formatCOP(trazabilidad.resumen_financiero.ingreso_por_hectarea)}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-black text-gray-800">Utilidad Neta / Ha:</span>
                            <span className={`text-base font-extrabold ${trazabilidad.resumen_financiero.balance_por_hectarea >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
                              {formatCOP(trazabilidad.resumen_financiero.balance_por_hectarea)}
                            </span>
                          </div>
                        </div>

                        {/* Semáforo de Rentabilidad */}
                        <div className={`rounded-3xl p-6 shadow-sm flex flex-col justify-between border print:border ${
                          trazabilidad.liquidacion 
                            ? (trazabilidad.resumen_financiero.rentable 
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                              : 'bg-red-50/50 border-red-200 text-red-900') 
                            : 'bg-amber-50/50 border-amber-200 text-amber-900'
                        }`}>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-current">
                              {trazabilidad.liquidacion ? 'Estado del Ejercicio' : 'Ejercicio Abierto'}
                            </span>
                            <h4 className="text-2xl font-black mt-4">
                              {trazabilidad.liquidacion 
                                ? (trazabilidad.resumen_financiero.rentable ? '🏆 Campaña Rentable' : '⚠️ Campaña en Pérdida')
                                : '🚜 En Cosecha/Secamiento'}
                            </h4>
                          </div>
                          <p className="text-xs font-medium mt-3 opacity-90">
                            {trazabilidad.liquidacion 
                              ? (trazabilidad.resumen_financiero.rentable 
                                ? `El ciclo productivo generó retornos positivos para el lote ${trazabilidad.lote.nombre}.`
                                : `El ingreso neto no cubrió los costos de labranza, agroquímicos e insumos directos.`)
                              : 'Pendiente de registrar la liquidación económica del molino para arrojar el retorno financiero definitivo.'}
                          </p>
                        </div>

                      </div>

                      {/* Cronología Vertical Interactiva (Trazabilidad completa) */}
                      <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 print:border print:shadow-none">
                        <h3 className="text-lg font-black text-gray-900 pb-4 border-b border-emerald-50 flex items-center gap-2">
                          <Scroll className="w-5 h-5 text-emerald-600" /> Bitácora Técnica Cronológica de Cultivo
                        </h3>

                        <div className="relative border-l-2 border-emerald-100 ml-4 space-y-10 pb-8">
                          
                          {/* 1. ANÁLISIS DE SUELOS */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-amber-500 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">1</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Análisis Químico de Suelos del Lote</h4>
                              {trazabilidad.analisis_suelo && trazabilidad.analisis_suelo.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs">
                                  <p className="font-semibold">🧪 pH del Suelo: <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{trazabilidad.analisis_suelo[0].ph}</span></p>
                                  <p className="font-semibold">🌿 M. Orgánica: <span className="font-bold text-gray-900">{trazabilidad.analisis_suelo[0].materia_organica_porcentaje}%</span></p>
                                  <p className="font-semibold">🔬 Textura: <span className="font-bold text-gray-900">{trazabilidad.analisis_suelo[0].textura}</span></p>
                                  <p className="font-semibold sm:col-span-3 text-gray-500">
                                    Interpretación: {trazabilidad.analisis_suelo[0].interpretacion_ph} | Laboratorio: {trazabilidad.analisis_suelo[0].laboratorio} ({trazabilidad.analisis_suelo[0].fecha_muestreo})
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No se registran análisis de suelo previos al ciclo para este lote.</p>
                              )}
                            </div>
                          </div>

                          {/* 2. ADECUACIÓN MECÁNICA */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-emerald-700 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">2</div>
                            <div className="space-y-3">
                              <h4 className="text-base font-extrabold text-gray-900">Preparación del Terreno (Adecuación Mecánica)</h4>
                              {trazabilidad.preparaciones && trazabilidad.preparaciones.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="overflow-hidden border border-gray-150 rounded-2xl">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-gray-50 font-bold text-gray-500 border-b border-gray-150">
                                        <tr>
                                          <th className="px-4 py-2">Fecha</th>
                                          <th className="px-4 py-2">Labor</th>
                                          <th className="px-4 py-2">Horas Máquina</th>
                                          <th className="px-4 py-2 text-right">Costo Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                        {trazabilidad.preparaciones.map(p => (
                                          <tr key={p.id}>
                                            <td className="px-4 py-2">{p.fecha}</td>
                                            <td className="px-4 py-2">{laborToLabel[p.labor] || p.labor}</td>
                                            <td className="px-4 py-2">{p.horas_maquina} h</td>
                                            <td className="px-4 py-2 text-right">{formatCOP(p.costo_total)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No se registraron labores de maquinaria en la adecuación del terreno.</p>
                              )}
                            </div>
                          </div>

                          {/* 3. SIEMBRA */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-emerald-600 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">3</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Siembra Agronómica</h4>
                              {trazabilidad.siembra ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs font-semibold text-gray-700">
                                  <p>📅 Fecha de Siembra: <span className="font-bold text-gray-900">{trazabilidad.siembra.fecha}</span></p>
                                  <p>🌾 Variedad de Semilla: <span className="font-bold text-gray-900">{trazabilidad.siembra.variedad}</span></p>
                                  <p>⚙️ Método: <span className="font-bold text-gray-900">{trazabilidad.siembra.metodo}</span></p>
                                  <p>🌱 Dosis: <span className="font-bold text-gray-900">{trazabilidad.siembra.dosis_kg_ha} Kg/Ha (Germinación: {trazabilidad.siembra.germinacion_porcentaje}%)</span></p>
                                  {trazabilidad.siembra.tratamiento_semilla && (
                                    <p className="sm:col-span-2 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">
                                      🛡️ Tratamiento previo: {trazabilidad.siembra.tratamiento_semilla}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">Siembra aún no reportada para este ciclo.</p>
                              )}
                            </div>
                          </div>

                          {/* 4. EVOLUCIÓN FENOLÓGICA */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-green-500 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">4</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Evolución Fenológica (Monitoreo de Etapas)</h4>
                              {trazabilidad.fenologia && trazabilidad.fenologia.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {trazabilidad.fenologia.map(f => (
                                    <div key={f.id} className="bg-gray-50 border border-gray-150 p-3.5 rounded-xl flex justify-between items-center text-xs">
                                      <div>
                                        <p className="font-bold text-gray-800">{faseToLabel[f.fase] || f.fase}</p>
                                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{f.fecha}</p>
                                      </div>
                                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">Día {f.dias_transcurridos_calculados}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No se han registrado visitas técnicas fenológicas en campo.</p>
                              )}
                            </div>
                          </div>

                          {/* 5. SANIDAD Y NUTRICIÓN */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-teal-500 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">5</div>
                            <div className="space-y-3">
                              <h4 className="text-base font-extrabold text-gray-900">Manejo Integrado de Nutrición y Sanidad Fitosanitaria</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                
                                {/* Monitoreos / Plagas */}
                                <div className="space-y-2">
                                  <h5 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Amenazas y Monitoreos</h5>
                                  {trazabilidad.monitoreos && trazabilidad.monitoreos.length > 0 ? (
                                    <div className="space-y-2 text-2xs font-semibold">
                                      {trazabilidad.monitoreos.map(m => (
                                        <div key={m.id} className="bg-[#FAFDFB] border border-gray-150 p-2.5 rounded-xl">
                                          <p className="font-extrabold text-gray-900">{m.nombre_comun} ({m.tipo_problema_display})</p>
                                          <p className="text-gray-500 mt-0.5">Umbral: {m.umbral_danio_porcentaje}% | Decisión: "{m.decision_tecnica}"</p>
                                          <p className="text-[9px] text-gray-400 mt-1">Fecha: {m.fecha}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">Sin amenazas detectadas.</p>
                                  )}
                                </div>

                                {/* Aplicaciones */}
                                <div className="space-y-2">
                                  <h5 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Aplicaciones y Nutrientes</h5>
                                  {trazabilidad.fertilizaciones && trazabilidad.fertilizaciones.length > 0 ? (
                                    <div className="space-y-2 text-2xs font-semibold">
                                      {trazabilidad.fertilizaciones.map(f => (
                                        <div key={f.id} className="bg-emerald-50/20 border border-emerald-100 p-2.5 rounded-xl">
                                          <p className="font-extrabold text-emerald-950">Abonamiento: {f.tipo_fertilizante.replace(/_/g, ' ')}</p>
                                          <p className="text-emerald-800 mt-0.5">Dosis: {f.dosis_kg_ha} Kg/Ha | Fuente: {f.fuente_comercial}</p>
                                          <p className="text-[9px] text-emerald-600 mt-1">Fecha: {f.fecha}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">Sin fertilizaciones reportadas.</p>
                                  )}
                                </div>

                              </div>
                            </div>
                          </div>

                          {/* 6. MANEJO HÍDRICO */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-indigo-600 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">6</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Manejo Hídrico y Riegos</h4>
                              {trazabilidad.riegos && trazabilidad.riegos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {trazabilidad.riegos.map(r => (
                                    <div key={r.id} className="bg-gray-50 border border-gray-150 p-3.5 rounded-xl text-xs font-semibold text-gray-700">
                                      <p className="font-bold text-gray-900">Riego: {r.fecha}</p>
                                      <p className="text-indigo-600 mt-1">Lámina: {r.lamina_agua_cm} cm | {r.dias_inundacion} días</p>
                                      <p className="text-gray-550 text-gray-500 mt-0.5">Volumen: {r.volumen_agua_m3} m³ ({r.fuente_hidrica_display})</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No se registran bitácoras de compuerta o inundaciones.</p>
                              )}
                            </div>
                          </div>

                          {/* 7. COSECHA FÍSICA */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-amber-500 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">7</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Cosecha Física de Arroz Paddy</h4>
                              {trazabilidad.cosecha ? (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 text-xs font-semibold text-amber-850">
                                  <div><p className="text-amber-700 font-extrabold">Fecha</p><p className="font-bold text-amber-950 mt-0.5">{trazabilidad.cosecha.fecha}</p></div>
                                  <div><p className="text-amber-700 font-extrabold">Rendimiento</p><p className="font-black text-amber-950 mt-0.5">{trazabilidad.cosecha.rendimiento_ton_ha} Ton/Ha</p></div>
                                  <div><p className="text-amber-700 font-extrabold">Producción Total</p><p className="font-bold text-amber-950 mt-0.5">{new Intl.NumberFormat('es-CO').format(trazabilidad.cosecha.produccion_obtenida_kg)} Kg</p></div>
                                  <div><p className="text-amber-700 font-extrabold">Calidad Paddy</p><p className="font-bold text-amber-950 mt-0.5">H: {trazabilidad.cosecha.humedad_grano_porcentaje}% | I: {trazabilidad.cosecha.impurezas_porcentaje}%</p></div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">El cultivo se encuentra en fase de crecimiento; aún no se ha cosechado.</p>
                              )}
                            </div>
                          </div>

                          {/* 8. LIQUIDACIÓN ECONÓMICA */}
                          <div className="relative pl-8">
                            <div className="absolute w-5 h-5 bg-emerald-600 rounded-full -left-[11px] top-1 ring-4 ring-white flex items-center justify-center text-white text-[10px] font-black">8</div>
                            <div className="space-y-2">
                              <h4 className="text-base font-extrabold text-gray-900">Liquidación de Venta en Molino</h4>
                              {trazabilidad.liquidacion ? (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-200/50 text-xs font-semibold text-emerald-900">
                                  <div><p className="text-emerald-700 font-extrabold">Fecha Liquidación</p><p className="font-bold text-emerald-950 mt-0.5">{trazabilidad.liquidacion.fecha}</p></div>
                                  <div><p className="text-emerald-700 font-extrabold">Valor Tonelada</p><p className="font-black text-emerald-950 mt-0.5">{formatCOP(trazabilidad.liquidacion.precio_tonelada_cop)}</p></div>
                                  <div><p className="text-emerald-700 font-extrabold">Trilla (%)</p><p className="font-bold text-emerald-950 mt-0.5">Entero: {trazabilidad.liquidacion.porcentaje_grano_entero}% | Queb: {trazabilidad.liquidacion.porcentaje_grano_quebrado}%</p></div>
                                  <div><p className="text-emerald-700 font-extrabold">Ingreso Neto Recibido</p><p className="font-black text-emerald-950 mt-0.5">{formatCOP(trazabilidad.liquidacion.ingreso_neto_cop)}</p></div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">Liquidación económica pendiente de asentar.</p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </motion.div>
  );
}
