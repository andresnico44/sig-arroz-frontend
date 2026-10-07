/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function CosechaTab({ 
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
    <motion.div key="cos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {!cosecha ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Registrar Cosecha Final</h2>
                          <p className="text-sm text-gray-500 mt-1">Registra la producción física obtenida al finalizar el ciclo productivo.</p>
                        </div>
                        <button onClick={() => setIsModalCosechaOpen(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-amber-500/30 hover:bg-amber-600 flex items-center gap-2 text-sm transition-colors">
                          <Wheat className="w-4 h-4" /> Registrar Cosecha
                        </button>
                      </div>
                      
                      <div className="bg-amber-50 border border-dashed border-amber-200 rounded-2xl p-10 text-center">
                        <Wheat className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                        <h3 className="text-amber-900 font-bold">Sin registrar</h3>
                        <p className="text-amber-700/80 text-sm mt-1">El lote aún no ha sido cosechado o no se ha reportado la producción.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                      <Wheat className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-200/50" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <CheckCircle2 className="w-8 h-8 text-amber-600" />
                          <h2 className="text-2xl font-extrabold text-amber-900">Cosecha Registrada</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                          <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 lg:col-span-2 flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                              {(parseFloat(cosecha.rendimiento_ton_ha)).toFixed(2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-amber-800">Rendimiento</p>
                              <p className="text-xl font-bold text-amber-950">Ton/Ha</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Producción Total</p>
                            <p className="text-xl font-bold text-amber-950 mt-1">{new Intl.NumberFormat('es-CO').format(cosecha.produccion_obtenida_kg)} Kg</p>
                          </div>
                          
                          <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Humedad</p>
                            <p className="text-xl font-bold text-amber-950 mt-1">{cosecha.humedad_grano_porcentaje}%</p>
                          </div>
                          
                          <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Impurezas</p>
                            <p className="text-xl font-bold text-amber-950 mt-1">{cosecha.impurezas_porcentaje}%</p>
                          </div>
                        </div>

                        <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Fecha de Cosecha</p>
                            <p className="text-lg font-bold text-amber-950">{cosecha.fecha}</p>
                          </div>
                          {cosecha.condiciones_cosecha && (
                            <div className="bg-amber-100/50 px-4 py-2 rounded-xl border border-amber-200/50">
                              <p className="text-sm font-medium text-amber-900">{cosecha.condiciones_cosecha}</p>
                            </div>
                          )}
                        </div>

                        {/* SECCIÓN DE LIQUIDACIÓN ECONÓMICA DEL MOLINO (HU-13) */}
                        <div className="mt-8 border-t border-amber-200/60 pt-8">
                          {!liquidacion ? (
                            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold text-[#0D1A12] flex items-center gap-2">
                                  <Coins className="w-5 h-5 text-amber-600" /> Liquidación Económica del Molino
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Cierra económicamente este ciclo productivo registrando el pago neto final y rendimiento de trilla.</p>
                              </div>
                              <button 
                                onClick={() => setIsModalLiquidacionOpen(true)} 
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:from-amber-550 hover:to-amber-600 transition-all flex items-center gap-2 text-sm shrink-0"
                              >
                                <Coins className="w-4 h-4" /> Asentar Liquidación
                              </button>
                            </div>
                          ) : (
                            <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-6">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none"></div>
                              <div className="flex items-center gap-2.5 pb-4 border-b border-emerald-50">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                <div>
                                  <h3 className="text-lg font-black text-gray-900">Liquidación de Molino Concluida</h3>
                                  <p className="text-xs text-gray-500 font-bold">Cierre financiero y biológico del lote registrado</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
                                  <p className="text-3xs font-extrabold text-emerald-700 uppercase tracking-widest">Ingreso Neto Recibido</p>
                                  <p className="text-xl font-black text-emerald-950 mt-1">{formatCOP(liquidacion.ingreso_neto_cop)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-center">
                                  <p className="text-3xs font-extrabold text-gray-500 uppercase tracking-widest">Precio por Tonelada</p>
                                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCOP(liquidacion.precio_tonelada_cop)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-center">
                                  <p className="text-3xs font-extrabold text-gray-500 uppercase tracking-widest">Calidad de Trilla</p>
                                  <p className="text-sm font-bold text-gray-800 mt-1">🌾 Entero: {liquidacion.porcentaje_grano_entero}%</p>
                                  <p className="text-xs text-gray-400 font-bold mt-0.5">🍂 Quebrado: {liquidacion.porcentaje_grano_quebrado}%</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-center">
                                  <p className="text-3xs font-extrabold text-gray-500 uppercase tracking-widest">Descuentos Aplicados</p>
                                  <p className="text-lg font-bold text-red-650 mt-1">{formatCOP(liquidacion.descuentos_aplicados_cop)}</p>
                                </div>
                              </div>

                              <div className="text-2xs text-gray-400 font-bold flex flex-col sm:flex-row justify-between pt-2 border-t border-gray-50 gap-2">
                                <span>Fecha de Venta: {liquidacion.fecha} | Humedad Final Secado: {liquidacion.humedad_final_porcentaje}%</span>
                                {liquidacion.observaciones && <span className="italic text-gray-500">Nota: "{liquidacion.observaciones}"</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
  );
}
