/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, AlertTriangle, RefreshCw, Wheat, Printer, Scroll, Trash2, Edit, Save } from 'lucide-react';

export default function FitosanitarioTab({
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
    <motion.div key="fit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
      {/* Banner de Sincronización Offline si hay pendientes */}
      {offlineMonitoreos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">Monitoreos guardados de forma Local (Offline)</h4>
              <p className="text-sm text-amber-800">Tienes <strong>{offlineMonitoreos.length}</strong> monitoreo(s) en espera de sincronizarse con el servidor de la nube.</p>
            </div>
          </div>
          <button
            onClick={handleSyncOffline}
            disabled={syncing}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-amber-600/10"
          >
            {syncing ? <Loader className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar Datos
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monitoreo Fitosanitario */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Monitoreo de Campo
            </h3>
            {cicloData?.estado !== 'FINALIZADO' && (
              <button onClick={() => setIsModalMonitoreoOpen(true)} className="bg-rice-green text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Nuevo Monitoreo
              </button>
            )}
          </div>

          {monitoreos.length === 0 && offlineMonitoreos.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-8 text-center">
              <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No se han registrado amenazas o plagas aún.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {/* Listar Offline Primero */}
              {offlineMonitoreos.map((m) => (
                <div key={m.id_offline} className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-2xl p-4 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Offline Pendiente</span>
                  <p className="text-xs text-amber-700 font-bold">{m.fecha}</p>
                  <h4 className="font-extrabold text-amber-900 text-base mt-1">{m.nombre_comun}</h4>
                  <p className="text-xs text-amber-800 font-medium mt-1">Tipo: {m.tipo_problema} | Daño: <span className="font-bold">{m.umbral_danio_porcentaje}%</span></p>
                  <p className="text-sm text-amber-950/80 mt-2 bg-white/70 p-2.5 rounded-xl border border-amber-100">{m.decision_tecnica}</p>
                  {m.latitud && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-800">
                      <MapPin className="w-3 h-3 text-amber-600" /> Lat: {m.latitud}, Lng: {m.longitud}
                    </div>
                  )}
                </div>
              ))}

              {/* Listar Online */}
              {monitoreos.map((m) => (
                <div key={m.id} className="border border-gray-150 bg-gray-50/50 rounded-2xl p-4 relative hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 font-semibold">{m.fecha}</p>
                  <h4 className="font-extrabold text-rice-dark text-base mt-1 flex items-center gap-2">
                    {m.nombre_comun}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${m.tipo_problema === 'PLAGA' ? 'bg-red-50 text-red-600 border border-red-100' :
                      m.tipo_problema === 'ENFERMEDAD' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                      {m.tipo_problema_display}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 font-semibold">
                    Daño estimado: <span className="font-extrabold text-red-600">{m.umbral_danio_porcentaje}%</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-2 bg-white p-2.5 rounded-xl border border-gray-100">{m.decision_tecnica}</p>
                  {m.latitud && (
                    <a
                      href={`https://www.google.com/maps?q=${m.latitud},${m.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-rice-emerald hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rice-green" /> Ver geoposicionamiento (Lat: {m.latitud}, Lng: {m.longitud})
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aplicación de Agroquímicos */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-indigo-500" /> Aplicación de Pesticidas
            </h3>
            {cicloData?.estado !== 'FINALIZADO' && (
              <button onClick={() => setIsModalAplicacionOpen(true)} className="bg-rice-green text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Registrar Aplicación
              </button>
            )}
          </div>

          {aplicaciones.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-8 text-center">
              <Droplet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No se han registrado aplicaciones de agroquímicos.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {aplicaciones.map((a) => {
                // Calcular si el periodo de carencia está activo
                const fechaAplicacion = new Date(a.fecha);
                const hoy = new Date();
                const diffTime = Math.abs(hoy - fechaAplicacion);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const carenciaActiva = diffDays <= a.periodo_carencia_dias;

                return (
                  <div key={a.id} className="border border-gray-150 bg-gray-50/50 rounded-2xl p-4 relative hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-500 font-semibold">{a.fecha}</p>
                    <h4 className="font-extrabold text-rice-dark text-base mt-1">{a.nombre_comercial}</h4>
                    <p className="text-xs text-gray-600 font-bold mt-1">I. Activo: {a.ingrediente_activo} | Dosis: {a.dosis_por_ha} L/Ha</p>

                    <div className="mt-3 text-xs bg-white p-2.5 rounded-xl border border-gray-100 font-semibold text-gray-700">
                      <p>✈️ Método: {a.equipo_aspersion}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500">Periodo de Carencia</p>
                        <span className={`text-xs font-extrabold inline-block mt-0.5 px-2.5 py-0.5 rounded-full ${carenciaActiva ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                          {carenciaActiva ? `⚠️ ACTIVO: Faltan ${a.periodo_carencia_dias - diffDays} días` : '✅ Seguro para Cosecha'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500">Costo Directo</p>
                        <p className="text-sm font-extrabold text-gray-900">{formatCOP(parseFloat(a.costo_producto) + parseFloat(a.costo_mano_obra))}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
