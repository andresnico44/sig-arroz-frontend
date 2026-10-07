/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function CostosTab({ 
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
    <motion.div key="cost" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  {/* Dashboard Superior Financiero */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6"><Coins className="w-40 h-40" /></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Billetera Contable</span>
                      <h4 className="text-3xl font-extrabold mt-4">{formatCOP(totalCostosDirectos)}</h4>
                      <p className="text-gray-400 text-sm mt-1">Costo total acumulado en el ciclo</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Presupuesto Estimado</span>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-4">{formatCOP(presupuestoEstimado)}</h4>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">Definido en la planificación inicial del ciclo</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Eficiencia Financiera</span>
                        <h4 className={`text-3xl font-extrabold mt-4 ${porcentajePresupuesto > 100 ? 'text-red-600' : 'text-rice-green'}`}>{porcentajePresupuesto.toFixed(1)}%</h4>
                      </div>
                      <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden mt-3">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${porcentajePresupuesto > 100 ? 'bg-red-500' : 'bg-rice-emerald'}`}
                          style={{ width: `${Math.min(porcentajePresupuesto, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Alerta de Presupuesto Superado */}
                  {totalCostosDirectos > presupuestoEstimado && presupuestoEstimado > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 flex gap-4 items-start shadow-sm animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-900">⚠️ Presupuesto Excedido</h4>
                        <p className="text-sm text-red-800 mt-1">Los gastos directos reales del ciclo productivo han superado el presupuesto inicial estimado por un monto de <strong>{formatCOP(totalCostosDirectos - presupuestoEstimado)}</strong>.</p>
                      </div>
                    </div>
                  )}

                  {/* Bitácora de Costos Directos */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Bitácora Contable del Ciclo</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Muestra los egresos automáticos (labores, productos) y manuales.</p>
                      </div>
                      {cicloData?.estado !== 'FINALIZADO' && (
                        <button onClick={() => setIsModalCostoOpen(true)} className="bg-rice-green text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5 shrink-0">
                          <Plus className="w-4 h-4" /> Asentar Costo Extraordinario
                        </button>
                      )}
                    </div>

                    {costos.length === 0 ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-12 text-center">
                        <Coins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-bold">No se han registrado costos en este ciclo.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-250 rounded-2xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Monto COP</th>
                              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {costos.map(c => (
                              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{c.fecha}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{categoriaToLabel[c.categoria] || c.categoria}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{c.descripcion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-rice-dark">{formatCOP(c.monto_total)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {cicloData?.estado !== 'FINALIZADO' && (
                                    <>
                                      <button onClick={() => { setCostoEditando(c); setIsModalEditCostoOpen(true); }} className="text-emerald-600 hover:text-emerald-900 mr-4 transition-colors">Editar</button>
                                      <button onClick={() => setCostoAEliminar(c.id)} className="text-red-600 hover:text-red-900 transition-colors">Eliminar</button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
  );
}
