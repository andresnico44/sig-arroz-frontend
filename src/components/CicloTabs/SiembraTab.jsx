/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function SiembraTab({ 
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
    <motion.div key="siem" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {!siembra ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Registrar Siembra Principal</h2>
                      <form onSubmit={handleCreateSiembra} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Siembra</label>
                            <input type="date" required value={nuevaSiembra.fecha} onChange={e => setNuevaSiembra({...nuevaSiembra, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Método</label>
                            <select value={nuevaSiembra.metodo} onChange={e => setNuevaSiembra({...nuevaSiembra, metodo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                              <option value="VOLEO">Al Voleo</option>
                              <option value="MECANIZADA">Sembradora Mecanizada</option>
                              <option value="TRANSPLANTE">Transplante</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Dosis (Kg/Ha)</label>
                            <input type="number" step="0.1" required value={nuevaSiembra.dosis_kg_ha} onChange={e => setNuevaSiembra({...nuevaSiembra, dosis_kg_ha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 120" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Germinación Esperada (%)</label>
                            <input type="number" step="1" max="100" required value={nuevaSiembra.germinacion_porcentaje} onChange={e => setNuevaSiembra({...nuevaSiembra, germinacion_porcentaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 95" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tratamiento de Semilla</label>
                            <input type="text" value={nuevaSiembra.tratamiento_semilla} onChange={e => setNuevaSiembra({...nuevaSiembra, tratamiento_semilla: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Fungicidas aplicados..." />
                          </div>
                        </div>
                        <button type="submit" disabled={saving} className="bg-rice-emerald text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-600 transition-colors w-full flex justify-center items-center gap-2">
                          {saving ? <Loader className="animate-spin w-5 h-5" /> : 'Confirmar Siembra e Iniciar Ciclo'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                      <Sprout className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-200/50" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                          <h2 className="text-2xl font-extrabold text-emerald-900">Siembra Establecida</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/60 p-6 rounded-2xl backdrop-blur-sm border border-emerald-100">
                          <div><p className="text-sm font-semibold text-emerald-800">Fecha Real</p><p className="text-lg font-bold text-emerald-950">{siembra.fecha}</p></div>
                          <div><p className="text-sm font-semibold text-emerald-800">Método</p><p className="text-lg font-bold text-emerald-950">{siembra.metodo}</p></div>
                          <div><p className="text-sm font-semibold text-emerald-800">Dosis</p><p className="text-lg font-bold text-emerald-950">{siembra.dosis_kg_ha} Kg/Ha</p></div>
                          <div><p className="text-sm font-semibold text-emerald-800">Germinación</p><p className="text-lg font-bold text-emerald-950">{siembra.germinacion_porcentaje}%</p></div>
                        </div>
                        {siembra.tratamiento_semilla && (
                          <div className="mt-4 text-sm font-semibold text-emerald-800 bg-emerald-100/50 px-4 py-2 rounded-xl inline-block">
                            Tratamiento: {siembra.tratamiento_semilla}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
  );
}
