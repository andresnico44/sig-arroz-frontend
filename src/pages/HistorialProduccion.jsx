import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tractor, LogOut, Loader, ArrowLeft, Calendar, User, 
  TrendingUp, Maximize, BarChart2, Filter, X, 
  Sparkles, Award, MapPin, Activity, ArrowUpRight, AlertTriangle, ListFilter
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function HistorialProduccion() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de datos
  const [harvests, setHarvests] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [filteredLotes, setFilteredLotes] = useState([]);
  
  // Estados de control
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros seleccionados
  const [selectedFinca, setSelectedFinca] = useState('');
  const [selectedLote, setSelectedLote] = useState('');

  // Datos del usuario logueado
  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  // Inicialización y carga de filtros y datos
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Si viene algún pre-filtro por navegación
    const stateFincaId = location.state?.fincaId || '';
    const stateLoteId = location.state?.loteId || '';

    if (stateFincaId) setSelectedFinca(stateFincaId.toString());
    if (stateLoteId) setSelectedLote(stateLoteId.toString());

    fetchInitialData(stateFincaId, stateLoteId);
  }, [token]);

  // Cargar fincas, lotes y cosechas de forma paralela
  const fetchInitialData = async (preFincaId, preLoteId) => {
    try {
      setLoading(true);
      setError('');

      // 1. Obtener Fincas
      const fincasRes = await axios.get(`${API_BASE_URL}/api/fincas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFincas(fincasRes.data);

      // 2. Obtener Lotes
      const lotesRes = await axios.get(`${API_BASE_URL}/api/lotes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLotes(lotesRes.data);

      // Si se pre-filtró una finca, limitar los lotes disponibles en el selector
      if (preFincaId) {
        const filtered = lotesRes.data.filter(l => l.finca === parseInt(preFincaId));
        setFilteredLotes(filtered);
      } else {
        setFilteredLotes(lotesRes.data);
      }

      // 3. Obtener Cosechas (con filtros si aplican)
      let url = `${API_BASE_URL}/api/cosechas/`;
      const params = [];
      if (preLoteId) {
        params.push(`lote_id=${preLoteId}`);
      } else if (preFincaId) {
        params.push(`finca_id=${preFincaId}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const cosechasRes = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHarvests(cosechasRes.data);

    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del historial de rendimiento.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar cosechas filtradas cuando cambie Finca o Lote
  const fetchFilteredHarvests = async (fincaId, loteId) => {
    try {
      setLoading(true);
      setError('');
      
      let url = `${API_BASE_URL}/api/cosechas/`;
      const queryParams = {};
      if (loteId) {
        queryParams.lote_id = loteId;
      } else if (fincaId) {
        queryParams.finca_id = fincaId;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams
      });
      setHarvests(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al recargar el listado de cosechas con los filtros aplicados.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en el selector de Fincas
  const handleFincaChange = (e) => {
    const fincaId = e.target.value;
    setSelectedFinca(fincaId);
    setSelectedLote(''); // Limpiar lote al cambiar de finca

    if (fincaId) {
      // Filtrar lotes de esta finca
      const filtered = lotes.filter(l => l.finca === parseInt(fincaId));
      setFilteredLotes(filtered);
      fetchFilteredHarvests(fincaId, '');
    } else {
      setFilteredLotes(lotes);
      fetchFilteredHarvests('', '');
    }
  };

  // Manejar cambio en el selector de Lotes
  const handleLoteChange = (e) => {
    const loteId = e.target.value;
    setSelectedLote(loteId);
    fetchFilteredHarvests(selectedFinca, loteId);
  };

  // Restablecer todos los filtros
  const handleClearFilters = () => {
    setSelectedFinca('');
    setSelectedLote('');
    setFilteredLotes(lotes);
    fetchFilteredHarvests('', '');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- CÁLCULO DE KPIs DINÁMICOS (WOW ANALYTICS) ---
  const totalHarvestsCount = harvests.length;

  const totalProductionKg = harvests.reduce((sum, h) => sum + parseFloat(h.produccion_obtenida_kg || 0), 0);

  const averageYield = totalHarvestsCount > 0 
    ? (harvests.reduce((sum, h) => sum + parseFloat(h.rendimiento_ton_ha || 0), 0) / totalHarvestsCount).toFixed(2)
    : '0.00';

  // Buscar el récord (mejor rendimiento)
  const bestHarvest = harvests.reduce((max, h) => {
    const currentYield = parseFloat(h.rendimiento_ton_ha || 0);
    const maxYield = parseFloat(max?.rendimiento_ton_ha || 0);
    return currentYield > maxYield ? h : max;
  }, null);

  // Formateador de números
  const formatKg = (kg) => {
    return new Intl.NumberFormat('es-CO').format(kg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E2F0E6] via-[#FAFDFB] to-[#D5EDDB] text-gray-800 font-sans selection:bg-emerald-600 selection:text-white relative pb-20 overflow-hidden">
      
      {/* Orbes decorativos */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#4C9A2A]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#1E5631]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar con efecto de cristal */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FAFDFB]/90 border-b border-emerald-100/90 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1E5631] to-[#4C9A2A] rounded-xl flex items-center justify-center shadow-md">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0D1A12] flex items-center gap-1.5">
              SIG-ARROZ
              <span className="text-xs font-bold text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/35 shadow-sm">
                Rendimientos
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900">{username || 'Productor'}</p>
              <p className="text-2xs font-extrabold text-[#D4AF37] uppercase tracking-wider bg-[#1E5631] px-2 py-0.5 rounded shadow-sm">{rol}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-600 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all border border-gray-150 hover:border-red-200 shadow-sm bg-white"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenedor principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Botón de regreso */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver atrás
        </button>

        {/* Banner principal */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1E5631] via-[#2A6C40] to-[#4C9A2A] text-white border-b-4 border-[#D4AF37] rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="text-2xs font-black text-[#D4AF37] uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full">
              📊 Historial y Analítica Agronómica
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mt-2 drop-shadow-md">
              Rendimiento y Productividad de Cultivos
            </h1>
            <p className="text-sm sm:text-base text-emerald-50 font-semibold leading-relaxed drop-shadow-sm">
              Consulta el historial completo de cosechas de tus fincas. Evalúa los rendimientos calculados automáticamente por hectárea, detecta tendencias de calidad según humedad o impurezas y haz un seguimiento a tus records de producción.
            </p>
          </div>
        </motion.div>

        {/* Tarjetas de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Promedio de Rendimiento */}
          <div className="bg-white border-l-4 border-emerald-600 border border-emerald-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Rendimiento Promedio</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {averageYield} <span className="text-xs font-bold text-emerald-600">Ton/Ha</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 text-3xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Productividad media registrada
            </div>
          </div>

          {/* Récord Histórico */}
          <div className="bg-white border-l-4 border-[#D4AF37] border border-amber-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
            {bestHarvest && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none"></div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Récord de Rendimiento</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {bestHarvest ? bestHarvest.rendimiento_ton_ha : '0.00'}{' '}
                  <span className="text-xs font-bold text-[#b8952b]">Ton/Ha</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b8952b] shadow-sm">
                <Award className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <div className="mt-3 text-3xs text-gray-550 text-gray-500 font-bold truncate max-w-full">
              {bestHarvest ? (
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded shadow-sm border border-amber-200/50">
                  🏆 Lote: {bestHarvest.lote_nombre}
                </span>
              ) : (
                'Sin registros aún'
              )}
            </div>
          </div>

          {/* Producción Total */}
          <div className="bg-white border-l-4 border-blue-600 border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Producción Acumulada</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {formatKg(totalProductionKg)} <span className="text-xs font-bold text-blue-600">Kg</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
                <Maximize className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-3xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Volumen total cosechado
            </div>
          </div>

          {/* Ciclos Concluidos */}
          <div className="bg-white border-l-4 border-purple-600 border border-purple-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs text-gray-500 font-bold uppercase tracking-wider">Ciclos Cosechados</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {totalHarvestsCount} <span className="text-xs font-bold text-purple-600">Ciclos</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-3xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              Cierres productivos registrados
            </div>
          </div>

        </div>

        {/* Panel de Filtros */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-base font-black text-gray-900">Búsqueda y Filtros de Cosechas</h3>
                <p className="text-2xs text-gray-500 font-bold">Filtra el historial por finca y lote para evaluar rendimientos específicos</p>
              </div>
            </div>
            
            {(selectedFinca || selectedLote) && (
              <button 
                onClick={handleClearFilters}
                className="text-2xs font-extrabold text-red-650 hover:underline flex items-center gap-1 bg-red-50 border border-red-200/50 px-2.5 py-1 rounded-lg transition-all text-red-600"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Selector de Finca */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Finca:</label>
              <select
                value={selectedFinca}
                onChange={handleFincaChange}
                className="w-full px-4 py-3 bg-[#FAFDFB] border border-emerald-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Todas las Fincas</option>
                {fincas.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>

            {/* Selector de Lote */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lote:</label>
              <select
                value={selectedLote}
                onChange={handleLoteChange}
                disabled={filteredLotes.length === 0}
                className="w-full px-4 py-3 bg-[#FAFDFB] border border-emerald-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
              >
                <option value="">Todos los Lotes</option>
                {filteredLotes.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* Tabla / Contenido de Cosechas */}
        <section className="bg-white border border-emerald-100 rounded-3xl shadow-md overflow-hidden">
          
          <div className="px-6 py-5 border-b border-emerald-50 bg-[#FAFDFB] flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">Historial Detallado</h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              {totalHarvestsCount} Registro(s) de producción
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-10 h-10 text-emerald-700 animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-bold">Filtrando historial de cosechas...</p>
            </div>
          ) : harvests.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-150">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-base font-black text-gray-900 mb-1">No hay registros de cosecha</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                No se encontraron cosechas que coincidan con los filtros seleccionados o el productor aún no registra cierres.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="text-emerald-700 font-bold hover:underline"
              >
                Ir a Fincas para gestionar un lote
              </button>
            </div>
          ) : (
            /* Tabla Interactiva Premium */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-3xs font-extrabold uppercase text-gray-400 tracking-wider">
                    <th className="px-6 py-4">Finca / Lote</th>
                    <th className="px-6 py-4">Ciclo de Cultivo</th>
                    <th className="px-6 py-4">Fecha Cosecha</th>
                    <th className="px-6 py-4">Producción (Kg)</th>
                    <th className="px-6 py-4 text-center">Humedad (%)</th>
                    <th className="px-6 py-4 text-center">Impurezas (%)</th>
                    <th className="px-6 py-4 text-right">Rendimiento</th>
                    <th className="px-6 py-4 pl-8 max-w-xs">Condiciones / Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                  {harvests.map((harvest) => {
                    const yieldValue = parseFloat(harvest.rendimiento_ton_ha || 0);
                    const moisture = parseFloat(harvest.humedad_grano_porcentaje || 0);
                    const impurities = parseFloat(harvest.impurezas_porcentaje || 0);

                    // Determinar colores de rendimiento
                    let yieldStyle = "text-gray-900 font-black";
                    let yieldBadge = null;

                    if (yieldValue >= 6.0) {
                      yieldStyle = "text-emerald-700 font-black text-sm";
                      yieldBadge = (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded shadow-sm border border-emerald-250 ml-1">
                          Óptimo
                        </span>
                      );
                    } else if (yieldValue < 4.0) {
                      yieldStyle = "text-amber-700 font-black";
                      yieldBadge = (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded shadow-sm border border-amber-250 ml-1 inline-flex items-center gap-0.5" title="Rendimiento por debajo de la media regional (4 Ton/Ha)">
                          <AlertTriangle className="w-3 h-3" /> Bajo
                        </span>
                      );
                    }

                    // Determinar calidad de humedad (ideal entre 18% y 22% al cosechar)
                    let moistureStyle = "bg-gray-100 text-gray-800";
                    if (moisture >= 18 && moisture <= 22) {
                      moistureStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
                    } else if (moisture > 22) {
                      moistureStyle = "bg-amber-50 text-amber-700 border border-amber-200/50";
                    } else if (moisture > 0 && moisture < 18) {
                      moistureStyle = "bg-blue-50 text-blue-700 border border-blue-200/50";
                    }

                    // Determinar impurezas (ideal < 5%)
                    let impuritiesStyle = "bg-gray-100 text-gray-800";
                    if (impurities > 5.0) {
                      impuritiesStyle = "bg-red-50 text-red-700 border border-red-200/50";
                    } else if (impurities > 0) {
                      impuritiesStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
                    }

                    return (
                      <motion.tr 
                        key={harvest.id}
                        whileHover={{ backgroundColor: '#F8FAF9' }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {harvest.finca_nombre}
                            </span>
                            <span className="text-3xs text-gray-400 font-extrabold uppercase mt-0.5">
                              Lote: {harvest.lote_nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-850">
                          {harvest.ciclo_nombre}
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-bold">
                          {new Date(harvest.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {formatKg(harvest.produccion_obtenida_kg)} <span className="text-[10px] text-gray-400 font-bold">Kg</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full ${moistureStyle}`}>
                            {moisture}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full ${impuritiesStyle}`}>
                            {impurities}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={yieldStyle}>{yieldValue}</span>
                            <span className="text-[10px] text-gray-400 font-extrabold uppercase shrink-0">Ton/Ha</span>
                            {yieldBadge}
                          </div>
                        </td>
                        <td className="px-6 py-4 pl-8 max-w-xs text-2xs text-gray-500 font-medium italic break-words">
                          {harvest.condiciones_cosecha || <span className="text-gray-300 font-normal">Sin observaciones</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
