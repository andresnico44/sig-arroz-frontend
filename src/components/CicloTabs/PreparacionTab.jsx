/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function PreparacionTab({ 
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
    <motion.div key="prep" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Labores de Adecuación Mecánica</h2>
                    {cicloData?.estado !== 'FINALIZADO' && (
                      <button onClick={() => setIsModalPrepOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Registrar Labor
                      </button>
                    )}
                  </div>
                  
                  {preparaciones.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                      <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-900 font-bold">Sin labores registradas</h3>
                      <p className="text-gray-500 text-sm mt-1">El lote no ha sido preparado aún.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Labor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Humedad</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horas Máquina</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Combustible</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Costo / Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Costo Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {preparaciones.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{p.fecha}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{laborToLabel[p.labor]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {p.condicion_humedad === 'CAPACIDAD_CAMPO' ? 'Cap. Campo' : p.condicion_humedad === 'SATURADO' ? 'Saturado' : 'Seco'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.horas_maquina} h</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.combustible_galones} Gal</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{formatCOP(p.costo_hora)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCOP(p.costo_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
  );
}
