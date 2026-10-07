/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function FenologiaTab({ 
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
    <motion.div key="feno" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {!siembra ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 flex gap-4 shadow-sm items-start">
                      <Clock className="w-8 h-8 text-amber-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-900 text-lg">Aún no se puede registrar fenología</h4>
                        <p className="text-amber-800/80 mt-1 font-medium">El cultivo no tiene una fecha de siembra registrada. Por favor registra la siembra primero.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Línea de Tiempo del Cultivo</h2>
                        {cicloData?.estado !== 'FINALIZADO' && (
                          <button onClick={() => setIsModalFenoOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> Registrar Etapa
                          </button>
                        )}
                      </div>

                      {fenologia.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                          <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-900 font-bold">Sin registros</h3>
                          <p className="text-gray-500 text-sm mt-1">Comienza agregando la etapa de Germinación.</p>
                        </div>
                      ) : (
                        <div className="relative border-l-2 border-rice-green/30 ml-4 space-y-8 pb-10">
                          {fenologia.map((f) => (
                            <div key={f.id} className="relative pl-8">
                              <div className="absolute w-4 h-4 bg-rice-green rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-rice-dark">{faseToLabel[f.fase]}</h3>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                      f.estado_general === 'EXCELENTE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      f.estado_general === 'BUENO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      f.estado_general === 'REGULAR' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      {f.estado_general || 'BUENO'}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                                    Día {f.dias_transcurridos_calculados}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-rice-emerald mb-2">{f.fecha}</p>
                                {f.observaciones && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{f.observaciones}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
  );
}
