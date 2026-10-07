/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function RiegoTab({ 
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
    <motion.div key="riego" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Control de Riego y Lámina de Agua</h2>
                    {cicloData?.estado !== 'FINALIZADO' && (
                      <button onClick={() => setIsModalRiegoOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Registrar Riego
                      </button>
                    )}
                  </div>

                  {riegos.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                      <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-900 font-bold">Sin riegos registrados</h3>
                      <p className="text-gray-500 text-sm mt-1">El lote aún no cuenta con registros de inundación o bombeo.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Volumen (m³)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fuente Hídrica</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lámina de Agua</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Días Inundado</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Compuerta / Drenaje</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Costo Bombeo (Combustible)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {riegos.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{r.fecha}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.volumen_agua_m3} m³</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.fuente_hidrica_display}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1 text-center inline-block mt-3">{r.lamina_agua_cm} cm</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.dias_inundacion} días</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{r.estado_drenaje_display}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-rice-dark">{formatCOP(r.costo_bombeo)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
  );
}
