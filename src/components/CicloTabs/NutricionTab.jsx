/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function NutricionTab({ 
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
    <motion.div key="nut" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Plan Nutricional y Fertilización</h2>
                    {cicloData?.estado !== 'FINALIZADO' && (
                      <button onClick={() => setIsModalFertilizacionOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Registrar Fertilización
                      </button>
                    )}
                  </div>

                  {fertilizaciones.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                      <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-900 font-bold">Sin fertilizaciones registradas</h3>
                      <p className="text-gray-500 text-sm mt-1">El plan nutricional no ha iniciado en este ciclo.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Etapa Feno.</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo / Fórmula</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fuente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dosis (Kg/Ha)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Costo Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Costo M. Obra</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Inyección</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fertilizaciones.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{f.fecha}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-rice-emerald bg-rice-emerald/5 px-2.5 py-1 rounded-xl text-center inline-block mt-3">{faseToLabel[f.etapa_fenologica] || f.etapa_fenologica}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{f.tipo_fertilizante.replace(/_/g, ' ')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{f.fuente_comercial}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-950">{f.dosis_kg_ha} Kg/Ha</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatCOP(f.costo_producto)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatCOP(f.costo_mano_obra)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-rice-dark">{formatCOP(parseFloat(f.costo_producto) + parseFloat(f.costo_mano_obra))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
  );
}
