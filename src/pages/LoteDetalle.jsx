import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FlaskConical, CalendarClock, Plus, X, Loader, Tractor, LogOut, FileText, CheckCircle2, Info } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function LoteDetalle() {
  const { loteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const loteData = location.state?.lote || { nombre: 'Cargando Lote...' };
  const fincaData = location.state?.finca || null;

  const [activeTab, setActiveTab] = useState('ciclos'); // 'ciclos' | 'analisis'
  
  // Data states
  const [ciclos, setCiclos] = useState([]);
  const [analisisList, setAnalisisList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reglas Agronómicas Calculadas (Suelo Apto para Arroz)
  const ultimoAnalisis = analisisList && analisisList.length > 0 ? analisisList[0] : null;
  const tieneAnalisis = analisisList && analisisList.length > 0;
  const esSueloApto = ultimoAnalisis ? parseFloat(ultimoAnalisis.ph) >= 5.5 : false;

  // Modals
  const [isModalCicloOpen, setIsModalCicloOpen] = useState(false);
  const [isModalAnalisisOpen, setIsModalAnalisisOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Forms
  const [nuevoCiclo, setNuevoCiclo] = useState({
    nombre_ciclo: '',
    anio: new Date().getFullYear(),
    semestre: '1',
    variedad_arroz: '',
    presupuesto_estimado: '',
    estado: 'PLANIFICADO'
  });

  const [nuevoAnalisis, setNuevoAnalisis] = useState({
    fecha_muestreo: new Date().toISOString().split('T')[0],
    ph: '',
    materia_organica_porcentaje: '',
    fosforo_ppm: '',
    potasio_meq: '',
    textura: 'FRANCO',
    laboratorio: ''
  });

  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [loteId, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCiclos, resAnalisis] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/ciclos/?lote_id=${loteId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/analisis-suelos/?lote_id=${loteId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCiclos(resCiclos.data);
      setAnalisisList(resAnalisis.data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar la información del lote.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreateCiclo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ciclos/`, {
        ...nuevoCiclo,
        lote: parseInt(loteId),
        presupuesto_estimado: parseFloat(nuevoCiclo.presupuesto_estimado)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCiclos([response.data, ...ciclos]);
      setIsModalCicloOpen(false);
      setNuevoCiclo({ semestre: '2024-A', variedad_arroz: '', presupuesto_estimado: '', estado: 'PLANIFICADO' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error al crear ciclo productivo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAnalisis = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analisis-suelos/`, {
        ...nuevoAnalisis,
        lote: parseInt(loteId),
        ph: parseFloat(nuevoAnalisis.ph),
        materia_organica_porcentaje: parseFloat(nuevoAnalisis.materia_organica_porcentaje),
        fosforo_ppm: parseFloat(nuevoAnalisis.fosforo_ppm),
        potasio_meq: parseFloat(nuevoAnalisis.potasio_meq)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAnalisisList([response.data, ...analisisList]);
      setIsModalAnalisisOpen(false);
      setNuevoAnalisis({
        fecha_muestreo: new Date().toISOString().split('T')[0],
        ph: '', materia_organica_porcentaje: '', fosforo_ppm: '', potasio_meq: '',
        textura: 'FRANCO', laboratorio: ''
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Error al registrar el análisis de suelo.';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  const getPhBadge = (interpretacion) => {
    if (interpretacion.includes('Neutro')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (interpretacion.includes('Ácido')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      'PLANIFICADO': 'bg-amber-50 text-amber-700 border-amber-200',
      'EJECUCION': 'bg-blue-50 text-blue-700 border-blue-200',
      'COSECHADO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'FINALIZADO': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return estilos[estado] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-rice-green rounded-xl flex items-center justify-center shadow-md">
                <Tractor className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-rice-dark tracking-tight">SIG-ARROZ</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-rice-dark">{username}</p>
                <p className="text-xs font-semibold text-rice-emerald uppercase tracking-wider">{rol}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de regreso dinámico */}
        <button 
          onClick={() => fincaData ? navigate(`/fincas/${fincaData.id}/lotes`, { state: { finca: fincaData } }) : navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-rice-green font-bold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver a Lotes {fincaData ? `de ${fincaData.nombre}` : ''}
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rice-emerald/5 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-rice-emerald uppercase tracking-widest bg-rice-emerald/10 px-3 py-1 rounded-full">Gestión Interna de Parcela</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">{loteData.nombre}</h1>
            {fincaData && <p className="text-gray-500 font-medium mt-1">Perteneciente a la finca {fincaData.nombre}</p>}
          </div>
        </div>

        {/* Guía Rápida Visual */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-4 shadow-sm">
          <div className="text-blue-500 shrink-0 mt-0.5">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Guía de Operación del Lote</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800/80 mt-1.5 space-y-1 font-medium">
              <li><strong>Primer Paso:</strong> Dirígete a la pestaña <em>"Análisis de Suelos"</em> y registra el muestreo del laboratorio (Obligatorio).</li>
              <li><strong>Segundo Paso:</strong> Una vez diagnosticado el suelo, ve a <em>"Ciclos Productivos"</em> e inicia un nuevo ciclo de siembra.</li>
              <li><strong>Tercer Paso:</strong> A medida que el cultivo crezca, registra las tareas y el monitoreo diario en el ciclo activo.</li>
            </ol>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('ciclos')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'ciclos' ? 'text-rice-green' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarClock className="w-5 h-5" /> Ciclos Productivos
            {activeTab === 'ciclos' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rice-green" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('analisis')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'analisis' ? 'text-rice-green' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FlaskConical className="w-5 h-5" /> Análisis de Suelos
            {activeTab === 'analisis' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rice-green" />
            )}
          </button>
        </div>

        {/* TAB 1: CICLOS PRODUCTIVOS */}
        {activeTab === 'ciclos' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historial de Siembras</h2>
                <p className="text-gray-500 text-sm">Gestiona las temporadas de siembra y cosecha de este lote</p>
              </div>
              
              {/* MAGIA DE ROLES (RBAC): El botón está estrictamente prohibido y oculto para el TECNICO */}
              {rol !== 'TECNICO' && (
                <motion.button
                  whileHover={(!tieneAnalisis || !esSueloApto) ? {} : { scale: 1.02 }} 
                  whileTap={(!tieneAnalisis || !esSueloApto) ? {} : { scale: 0.98 }}
                  onClick={() => {
                    if (!tieneAnalisis) {
                      alert("🛑 REGLA AGRONÓMICA: No puedes iniciar un Ciclo Productivo sin antes conocer el estado de la tierra. Por favor, registra primero un Análisis de Suelos en la otra pestaña.");
                      return;
                    }
                    if (!esSueloApto) {
                      alert(`🛑 REGLA AGRONÓMICA: El último análisis de suelo (${ultimoAnalisis.fecha_muestreo}) reporta un pH de ${Number(ultimoAnalisis.ph).toFixed(1)} (${ultimoAnalisis.interpretacion_ph}), lo cual es INADECUADO para el cultivo de arroz. Aplica cal de enmienda y registra un nuevo análisis corregido (pH >= 5.5) para desbloquear la siembra.`);
                      return;
                    }
                    setIsModalCicloOpen(true);
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-md ${
                    (!tieneAnalisis || !esSueloApto) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                      : 'bg-rice-green text-white shadow-rice-green/30 hover:bg-[#154224]'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Iniciar Nuevo Ciclo
                </motion.button>
              )}
            </div>

            {tieneAnalisis && !esSueloApto && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 mb-6 flex gap-4 shadow-sm">
                <Info className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Bloqueo de Calidad: Suelo Inadecuado</h4>
                  <p className="text-sm text-red-800/80 mt-1.5 leading-relaxed font-medium">
                    El último análisis de suelo ({ultimoAnalisis.fecha_muestreo}) reporta una acidez de <strong>pH {Number(ultimoAnalisis.ph).toFixed(1)} ({ultimoAnalisis.interpretacion_ph})</strong>, lo cual es inaceptable para cultivar arroz.
                  </p>
                  <p className="text-sm text-red-800 mt-2 font-bold flex items-center gap-1">
                    💡 Acción: Debes realizar una enmienda caliza al terreno y registrar un nuevo análisis verificado (pH ≥ 5.5) para desbloquear la siembra.
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10"><Loader className="animate-spin text-rice-green w-8 h-8" /></div>
            ) : ciclos.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-bold">Sin ciclos registrados</h3>
                <p className="text-gray-500 text-sm mt-1">Este lote no tiene siembras programadas actualmente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ciclos.map(ciclo => (
                  <div key={ciclo.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xxs font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full ${getEstadoBadge(ciclo.estado)}`}>
                        {ciclo.estado}
                      </span>
                      <span className="text-xs font-bold text-gray-400">{ciclo.anio} - {ciclo.semestre === '1' ? 'Semestre A' : 'Semestre B'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{ciclo.nombre_ciclo}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Var: {ciclo.variedad_arroz}</p>
                    <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 mb-4">
                      Presupuesto: <span className="text-rice-emerald">{formatCurrency(ciclo.presupuesto_estimado)}</span>
                    </p>
                    <div className="pt-3 border-t border-gray-100 flex gap-3 text-sm">
                      <button className="text-rice-green font-bold hover:underline">Ver Tareas →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: ANÁLISIS DE SUELOS */}
        {activeTab === 'analisis' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Laboratorio y Suelos</h2>
                <p className="text-gray-500 text-sm">Registra y monitorea el perfil químico del terreno</p>
              </div>
              
              {/* Aquí el TECNICO sí puede ver y usar el botón, todos pueden registrar análisis */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalAnalisisOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Registrar Análisis
              </motion.button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader className="animate-spin text-rice-green w-8 h-8" /></div>
            ) : analisisList.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-bold">Sin análisis de suelo</h3>
                <p className="text-gray-500 text-sm mt-1">Añade muestreos químicos para conocer el estado del terreno.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {analisisList.map(ana => (
                  <div key={ana.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{ana.fecha_muestreo}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 border rounded-lg ${getPhBadge(ana.interpretacion_ph)}`}>
                        pH: {Number(ana.ph).toFixed(1)} - {ana.interpretacion_ph}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-3 mt-3">
                      <div><span className="text-gray-500 font-semibold">Materia Orgánica:</span> <span className="font-bold text-gray-900">{ana.materia_organica_porcentaje}%</span></div>
                      <div><span className="text-gray-500 font-semibold">Textura:</span> <span className="font-bold text-gray-900 capitalize">{ana.textura?.toLowerCase() || 'Franco'}</span></div>
                      <div><span className="text-gray-500 font-semibold">Fósforo:</span> <span className="font-bold text-gray-900">{ana.fosforo_ppm} ppm</span></div>
                      <div><span className="text-gray-500 font-semibold">Potasio:</span> <span className="font-bold text-gray-900">{ana.potasio_meq} meq/100g</span></div>
                    </div>
                    {ana.laboratorio && (
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Realizado por: {ana.laboratorio}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Modal Nuevo Ciclo Productivo */}
      <AnimatePresence>
        {isModalCicloOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Iniciar Ciclo Productivo</h3>
                <button onClick={() => setIsModalCicloOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateCiclo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Ciclo</label>
                  <input type="text" required value={nuevoCiclo.nombre_ciclo} onChange={e => setNuevoCiclo({...nuevoCiclo, nombre_ciclo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Cosecha Verano Sur" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Año</label>
                    <input type="number" required value={nuevoCiclo.anio} onChange={e => setNuevoCiclo({...nuevoCiclo, anio: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Semestre</label>
                    <select value={nuevoCiclo.semestre} onChange={e => setNuevoCiclo({...nuevoCiclo, semestre: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none font-bold text-gray-700">
                      <option value="1">Primer Semestre (A)</option>
                      <option value="2">Segundo Semestre (B)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Variedad de Arroz</label>
                  <input type="text" required value={nuevoCiclo.variedad_arroz} onChange={e => setNuevoCiclo({...nuevoCiclo, variedad_arroz: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Fedearroz 68" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Presupuesto Estimado (COP)</label>
                  <input type="number" min="0" required value={nuevoCiclo.presupuesto_estimado} onChange={e => setNuevoCiclo({...nuevoCiclo, presupuesto_estimado: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 15000000" />
                </div>
                <button type="submit" disabled={saving} className="w-full mt-4 py-3 bg-rice-green text-white font-bold rounded-xl shadow-lg hover:bg-[#154224] transition-colors flex justify-center items-center gap-2">
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : 'Guardar Ciclo'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Análisis de Suelo */}
      <AnimatePresence>
        {isModalAnalisisOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Registrar Análisis de Suelo</h3>
                <button onClick={() => setIsModalAnalisisOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateAnalisis} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nivel de pH</label>
                    <input type="number" step="0.1" min="0" max="14" required value={nuevoAnalisis.ph} onChange={e => setNuevoAnalisis({...nuevoAnalisis, ph: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 6.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Materia Orgánica (%)</label>
                    <input type="number" step="0.1" min="0" required value={nuevoAnalisis.materia_organica_porcentaje} onChange={e => setNuevoAnalisis({...nuevoAnalisis, materia_organica_porcentaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 3.2" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fósforo (P) ppm</label>
                    <input type="number" step="0.1" min="0" required value={nuevoAnalisis.fosforo_ppm} onChange={e => setNuevoAnalisis({...nuevoAnalisis, fosforo_ppm: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 15.0" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Potasio (K) meq/100g</label>
                    <input type="number" step="0.1" min="0" required value={nuevoAnalisis.potasio_meq} onChange={e => setNuevoAnalisis({...nuevoAnalisis, potasio_meq: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 0.15" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Textura</label>
                    <select value={nuevoAnalisis.textura} onChange={e => setNuevoAnalisis({...nuevoAnalisis, textura: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-700">
                      <option value="FRANCO">Franco</option>
                      <option value="ARCILLOSO">Arcilloso</option>
                      <option value="ARENOSO">Arenoso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Laboratorio (Opcional)</label>
                    <input type="text" value={nuevoAnalisis.laboratorio} onChange={e => setNuevoAnalisis({...nuevoAnalisis, laboratorio: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Lab. Agrícola" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : 'Guardar Análisis'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
