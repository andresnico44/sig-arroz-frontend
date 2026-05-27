import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Tractor, Sprout, CalendarDays, Plus, X, Loader, LogOut, 
  CheckCircle2, Clock, ShieldAlert, Droplet, Coins, MapPin, Sparkles, 
  AlertTriangle, Info, RefreshCw, Wheat
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

export default function CicloDetalle() {
  const { loteId, cicloId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const loteData = location.state?.lote || { nombre: 'Cargando...' };
  const fincaData = location.state?.finca || { nombre: 'Cargando...' };
  const cicloData = location.state?.ciclo || { nombre_ciclo: 'Cargando...', estado: 'PLANIFICADO', presupuesto_estimado: 0 };

  const [activeTab, setActiveTab] = useState('preparacion');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [preparaciones, setPreparaciones] = useState([]);
  const [siembra, setSiembra] = useState(null);
  const [fenologia, setFenologia] = useState([]);

  // Sprint 3 States
  const [monitoreos, setMonitoreos] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [fertilizaciones, setFertilizaciones] = useState([]);
  const [riegos, setRiegos] = useState([]);
  const [costos, setCostos] = useState([]);
  const [offlineMonitoreos, setOfflineMonitoreos] = useState([]);

  // Sprint 4 States
  const [cosecha, setCosecha] = useState(null);

  // Modals
  const [isModalPrepOpen, setIsModalPrepOpen] = useState(false);
  const [isModalFenoOpen, setIsModalFenoOpen] = useState(false);
  const [isModalMonitoreoOpen, setIsModalMonitoreoOpen] = useState(false);
  const [isModalAplicacionOpen, setIsModalAplicacionOpen] = useState(false);
  const [isModalFertilizacionOpen, setIsModalFertilizacionOpen] = useState(false);
  const [isModalRiegoOpen, setIsModalRiegoOpen] = useState(false);
  const [isModalCostoOpen, setIsModalCostoOpen] = useState(false);
  const [isModalCosechaOpen, setIsModalCosechaOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Forms
  const [nuevaPrep, setNuevaPrep] = useState({
    fecha: new Date().toISOString().split('T')[0],
    labor: 'RASTRA',
    horas_maquina: '',
    combustible_galones: '',
    costo_hora: '',
    observaciones: ''
  });

  const [nuevaSiembra, setNuevaSiembra] = useState({
    fecha: new Date().toISOString().split('T')[0],
    metodo: 'VOLEO',
    variedad: cicloData.variedad_arroz || '',
    dosis_kg_ha: '',
    tratamiento_semilla: '',
    germinacion_porcentaje: ''
  });

  const [nuevaFeno, setNuevaFeno] = useState({
    fecha: new Date().toISOString().split('T')[0],
    fase: 'GERMINACION',
    observaciones: ''
  });

  const [nuevoMonitoreo, setNuevoMonitoreo] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo_problema: 'PLAGA',
    nombre_comun: '',
    umbral_danio_porcentaje: '',
    decision_tecnica: '',
    latitud: '',
    longitud: ''
  });

  const [nuevaAplicacion, setNuevaAplicacion] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monitoreo: '',
    nombre_comercial: '',
    ingrediente_activo: '',
    dosis_por_ha: '',
    equipo_aspersion: 'BOMBA_ESPALDA',
    temperatura_c: '',
    velocidad_viento_kmh: '',
    periodo_carencia_dias: '',
    costo_producto: '',
    costo_mano_obra: ''
  });

  const [nuevaFertilizacion, setNuevaFertilizacion] = useState({
    fecha: new Date().toISOString().split('T')[0],
    etapa_fenologica: 'PLANTULA',
    tipo_fertilizante: 'NPK_COMPLETO',
    fuente_comercial: '',
    dosis_kg_ha: '',
    costo_producto: '',
    costo_mano_obra: ''
  });

  const [nuevoRiego, setNuevoRiego] = useState({
    fecha: new Date().toISOString().split('T')[0],
    volumen_agua_m3: '',
    fuente_hidrica: 'CANAL',
    costo_bombeo: '',
    dias_inundacion: '',
    lamina_agua_cm: '',
    estado_drenaje: 'ABIERTO'
  });

  const [nuevoCosto, setNuevoCosto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'MANO_DE_OBRA',
    descripcion: '',
    monto_total: ''
  });

  const [nuevaCosecha, setNuevaCosecha] = useState({
    fecha: new Date().toISOString().split('T')[0],
    produccion_obtenida_kg: '',
    humedad_grano_porcentaje: '',
    impurezas_porcentaje: '0',
    condiciones_cosecha: ''
  });

  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  // Cargar monitoreos offline al arrancar
  useEffect(() => {
    const saved = localStorage.getItem(`offline_monitoreos_${cicloId}`);
    if (saved) {
      setOfflineMonitoreos(JSON.parse(saved));
    }
  }, [cicloId]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [cicloId, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        resPrep, resSiembra, resFeno, resMonitoreo, 
        resAplicaciones, resFertilizaciones, resRiegos, resCostos, resCosechas
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/preparacion/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/siembra/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/fenologia/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/monitoreos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/aplicaciones-agroquimicos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/fertilizaciones/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/riegos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/costos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/cosechas/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setPreparaciones(resPrep.data);
      if (resSiembra.data && resSiembra.data.length > 0) {
        setSiembra(resSiembra.data[0]);
      } else {
        setSiembra(null);
      }
      setFenologia(resFeno.data);
      setMonitoreos(resMonitoreo.data);
      setAplicaciones(resAplicaciones.data);
      setFertilizaciones(resFertilizaciones.data);
      setRiegos(resRiegos.data);
      setCostos(resCostos.data);
      if (resCosechas.data && resCosechas.data.length > 0) {
        setCosecha(resCosechas.data[0]);
        // Update cicloData state just visually
        cicloData.estado = 'COSECHADO';
      } else {
        setCosecha(null);
      }
    } catch (err) {
      console.error(err);
      alert('Error al cargar la información del ciclo.');
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar registros guardados offline
  const handleSyncOffline = async () => {
    if (offlineMonitoreos.length === 0) return;
    setSyncing(true);
    let successCount = 0;
    const remaining = [];

    for (const mon of offlineMonitoreos) {
      try {
        await axios.post(`${API_BASE_URL}/api/monitoreos/`, {
          ...mon,
          ciclo: parseInt(cicloId)
        }, { headers: { Authorization: `Bearer ${token}` } });
        successCount++;
      } catch (err) {
        console.error("Error sincronizando monitoreo:", err);
        remaining.push(mon);
      }
    }

    setOfflineMonitoreos(remaining);
    localStorage.setItem(`offline_monitoreos_${cicloId}`, JSON.stringify(remaining));
    setSyncing(false);
    
    if (successCount > 0) {
      alert(`¡Sincronización exitosa! Se subieron ${successCount} monitoreos.`);
      fetchData();
    } else {
      alert('No se pudo establecer conexión para la sincronización.');
    }
  };

  const handleCreatePrep = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/preparacion/`, {
        ...nuevaPrep,
        ciclo: parseInt(cicloId),
        horas_maquina: parseFloat(nuevaPrep.horas_maquina),
        combustible_galones: parseFloat(nuevaPrep.combustible_galones) || 0,
        costo_hora: parseFloat(nuevaPrep.costo_hora) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPreparaciones([response.data, ...preparaciones]);
      setIsModalPrepOpen(false);
      setNuevaPrep({ fecha: new Date().toISOString().split('T')[0], labor: 'RASTRA', horas_maquina: '', combustible_galones: '', costo_hora: '', observaciones: '' });
      
      // Recargar costos
      const resCostos = await axios.get(`${API_BASE_URL}/api/costos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCostos(resCostos.data);
    } catch (err) {
      console.error(err);
      alert('Error al registrar preparación.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSiembra = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/siembra/`, {
        ...nuevaSiembra,
        ciclo: parseInt(cicloId),
        dosis_kg_ha: parseFloat(nuevaSiembra.dosis_kg_ha),
        germinacion_porcentaje: parseFloat(nuevaSiembra.germinacion_porcentaje)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSiembra(response.data);
      alert("¡Siembra registrada con éxito! El cultivo ahora está EN EJECUCIÓN.");
    } catch (err) {
      console.error(err);
      alert('Error al registrar siembra.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFeno = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/fenologia/`, {
        ...nuevaFeno,
        ciclo: parseInt(cicloId)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setFenologia([response.data, ...fenologia]);
      setIsModalFenoOpen(false);
      setNuevaFeno({ fecha: new Date().toISOString().split('T')[0], fase: 'GERMINACION', observaciones: '' });
    } catch (err) {
      console.error(err);
      alert('Error al registrar fenología.');
    } finally {
      setSaving(false);
    }
  };

  // Geolocalización Nativa
  const capturarGPS = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNuevoMonitoreo({
          ...nuevoMonitoreo,
          latitud: position.coords.latitude.toFixed(6),
          longitud: position.coords.longitude.toFixed(6)
        });
      },
      (error) => {
        console.error(error);
        alert("No se pudo obtener la geolocalización. Asegúrate de otorgar permisos.");
      }
    );
  };

  // Registrar Monitoreo Fitosanitario (Soporte Offline)
  const handleCreateMonitoreo = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...nuevoMonitoreo,
      umbral_danio_porcentaje: parseFloat(nuevoMonitoreo.umbral_danio_porcentaje),
      latitud: nuevoMonitoreo.latitud ? parseFloat(nuevoMonitoreo.latitud) : null,
      longitud: nuevoMonitoreo.longitud ? parseFloat(nuevoMonitoreo.longitud) : null
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/monitoreos/`, {
        ...payload,
        ciclo: parseInt(cicloId)
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMonitoreos([response.data, ...monitoreos]);
      setIsModalMonitoreoOpen(false);
      setNuevoMonitoreo({
        fecha: new Date().toISOString().split('T')[0],
        tipo_problema: 'PLAGA',
        nombre_comun: '',
        umbral_danio_porcentaje: '',
        decision_tecnica: '',
        latitud: '',
        longitud: ''
      });
    } catch (err) {
      console.error("Error al registrar monitoreo, intentando almacenamiento local offline:", err);
      
      // Persistencia Offline en LocalStorage
      const currentOffline = [...offlineMonitoreos, { ...payload, id_offline: Date.now() }];
      setOfflineMonitoreos(currentOffline);
      localStorage.setItem(`offline_monitoreos_${cicloId}`, JSON.stringify(currentOffline));
      
      setIsModalMonitoreoOpen(false);
      setNuevoMonitoreo({
        fecha: new Date().toISOString().split('T')[0],
        tipo_problema: 'PLAGA',
        nombre_comun: '',
        umbral_danio_porcentaje: '',
        decision_tecnica: '',
        latitud: '',
        longitud: ''
      });
      alert('⚠️ Servidor no disponible. El monitoreo ha sido guardado de forma local (Offline) en tu navegador y podrás sincronizarlo cuando recuperes la conexión.');
    } finally {
      setSaving(false);
    }
  };

  // Registrar Aplicación de Agroquímicos
  const handleCreateAplicacion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/aplicaciones-agroquimicos/`, {
        ...nuevaAplicacion,
        ciclo: parseInt(cicloId),
        monitoreo: nuevaAplicacion.monitoreo ? parseInt(nuevaAplicacion.monitoreo) : null,
        dosis_por_ha: parseFloat(nuevaAplicacion.dosis_por_ha),
        temperatura_c: nuevaAplicacion.temperatura_c ? parseFloat(nuevaAplicacion.temperatura_c) : null,
        velocidad_viento_kmh: nuevaAplicacion.velocidad_viento_kmh ? parseFloat(nuevaAplicacion.velocidad_viento_kmh) : null,
        periodo_carencia_dias: parseInt(nuevaAplicacion.periodo_carencia_dias),
        costo_producto: parseFloat(nuevaAplicacion.costo_producto) || 0,
        costo_mano_obra: parseFloat(nuevaAplicacion.costo_mano_obra) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });

      setAplicaciones([response.data, ...aplicaciones]);
      setIsModalAplicacionOpen(false);
      setNuevaAplicacion({
        fecha: new Date().toISOString().split('T')[0],
        monitoreo: '',
        nombre_comercial: '',
        ingrediente_activo: '',
        dosis_por_ha: '',
        equipo_aspersion: 'BOMBA_ESPALDA',
        temperatura_c: '',
        velocidad_viento_kmh: '',
        periodo_carencia_dias: '',
        costo_producto: '',
        costo_mano_obra: ''
      });

      // Recargar costos
      const resCostos = await axios.get(`${API_BASE_URL}/api/costos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCostos(resCostos.data);
    } catch (err) {
      console.error(err);
      alert('Error al registrar aplicación de agroquímicos.');
    } finally {
      setSaving(false);
    }
  };

  // Registrar Fertilización del Cultivo
  const handleCreateFertilizacion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/fertilizaciones/`, {
        ...nuevaFertilizacion,
        ciclo: parseInt(cicloId),
        dosis_kg_ha: parseFloat(nuevaFertilizacion.dosis_kg_ha),
        costo_producto: parseFloat(nuevaFertilizacion.costo_producto) || 0,
        costo_mano_obra: parseFloat(nuevaFertilizacion.costo_mano_obra) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });

      setFertilizaciones([response.data, ...fertilizaciones]);
      setIsModalFertilizacionOpen(false);
      setNuevaFertilizacion({
        fecha: new Date().toISOString().split('T')[0],
        etapa_fenologica: 'PLANTULA',
        tipo_fertilizante: 'NPK_COMPLETO',
        fuente_comercial: '',
        dosis_kg_ha: '',
        costo_producto: '',
        costo_mano_obra: ''
      });

      // Recargar costos
      const resCostos = await axios.get(`${API_BASE_URL}/api/costos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCostos(resCostos.data);
    } catch (err) {
      console.error(err);
      alert('Error al registrar fertilización.');
    } finally {
      setSaving(false);
    }
  };

  // Registrar Riegos y Drenaje
  const handleCreateRiego = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/riegos/`, {
        ...nuevoRiego,
        ciclo: parseInt(cicloId),
        volumen_agua_m3: parseFloat(nuevoRiego.volumen_agua_m3),
        costo_bombeo: parseFloat(nuevoRiego.costo_bombeo) || 0,
        dias_inundacion: parseInt(nuevoRiego.dias_inundacion),
        lamina_agua_cm: parseFloat(nuevoRiego.lamina_agua_cm),
      }, { headers: { Authorization: `Bearer ${token}` } });

      setRiegos([response.data, ...riegos]);
      setIsModalRiegoOpen(false);
      setNuevoRiego({
        fecha: new Date().toISOString().split('T')[0],
        volumen_agua_m3: '',
        fuente_hidrica: 'CANAL',
        costo_bombeo: '',
        dias_inundacion: '',
        lamina_agua_cm: '',
        estado_drenaje: 'ABIERTO'
      });

      // Recargar costos
      const resCostos = await axios.get(`${API_BASE_URL}/api/costos/?ciclo_id=${cicloId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCostos(resCostos.data);
    } catch (err) {
      console.error(err);
      alert('Error al registrar riego.');
    } finally {
      setSaving(false);
    }
  };

  // Asentar Costo Manual Extraordinario
  const handleCreateCosto = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/costos/`, {
        ...nuevoCosto,
        ciclo: parseInt(cicloId),
        monto_total: parseFloat(nuevoCosto.monto_total)
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCostos([response.data, ...costos]);
      setIsModalCostoOpen(false);
      setNuevoCosto({
        fecha: new Date().toISOString().split('T')[0],
        categoria: 'MANO_DE_OBRA',
        descripcion: '',
        monto_total: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error al asentar costo.');
    } finally {
      setSaving(false);
    }
  };

  // Registrar Cosecha (HU-013)
  const handleCreateCosecha = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cosechas/`, {
        ...nuevaCosecha,
        ciclo: parseInt(cicloId),
        produccion_obtenida_kg: parseFloat(nuevaCosecha.produccion_obtenida_kg),
        humedad_grano_porcentaje: parseFloat(nuevaCosecha.humedad_grano_porcentaje),
        impurezas_porcentaje: parseFloat(nuevaCosecha.impurezas_porcentaje) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCosecha(response.data);
      cicloData.estado = 'COSECHADO';
      setIsModalCosechaOpen(false);
      setNuevaCosecha({
        fecha: new Date().toISOString().split('T')[0],
        produccion_obtenida_kg: '',
        humedad_grano_porcentaje: '',
        impurezas_porcentaje: '0',
        condiciones_cosecha: ''
      });
      showToast('¡Cosecha registrada! El cultivo ha finalizado sus operaciones.', 'success');
    } catch (err) {
      console.error(err);
      alert('Error al registrar la cosecha.');
    } finally {
      setSaving(false);
    }
  };

  // Diccionarios de etiquetas
  const laborToLabel = {
    'RASTRA': 'Pase de Rastra',
    'PULIDOR': 'Pase de Pulidor',
    'CABALLONEO': 'Caballoneo',
    'NIVELACION': 'Nivelación',
    'ZANJEO': 'Zanjeo/Drenajes',
    'OTRO': 'Otro'
  };

  const faseToLabel = {
    'GERMINACION': 'Germinación',
    'PLANTULA': 'Plántula',
    'MACOLLAMIENTO': 'Macollamiento',
    'PRIMORDIO': 'Primordio Floral',
    'EMBUCHAMIENTO': 'Embuchamiento',
    'FLORACION': 'Floración',
    'GRANO_LECHOSO': 'Grano Lechoso',
    'GRANO_PASTOSO': 'Grano Pastoso',
    'MADUREZ_COSECHA': 'Madurez'
  };

  const categoriaToLabel = {
    'MANO_DE_OBRA': '💰 Mano de Obra',
    'INSUMOS_AGROQUIMICOS': '📦 Insumos / Agroquímicos',
    'MAQUINARIA': '🚜 Maquinaria',
    'ARRENDAMIENTO_TIERRA': '🌾 Arrendamiento',
    'TRANSPORTE': '🚚 Transporte',
    'OTROS': '⚙️ Otros'
  };

  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
  };

  // Calcular el costo total directo actual de la billetera
  const totalCostosDirectos = costos.reduce((acc, c) => acc + parseFloat(c.monto_total), 0);
  const presupuestoEstimado = parseFloat(cicloData.presupuesto_estimado) || 0;
  const porcentajePresupuesto = presupuestoEstimado > 0 ? (totalCostosDirectos / presupuestoEstimado) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-2 text-gray-500 hover:text-red-600 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(`/lotes/${loteId}/gestion`, { state: { lote: loteData, finca: fincaData } })}
          className="flex items-center gap-2 text-gray-600 hover:text-rice-green font-bold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver al Lote
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rice-emerald/5 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-rice-emerald uppercase tracking-widest bg-rice-emerald/10 px-3 py-1 rounded-full">Dashboard del Cultivo</span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-3">{cicloData.nombre_ciclo}</h1>
            <p className="text-gray-500 font-medium mt-1">Variedad: {cicloData.variedad_arroz} | Lote: {loteData.nombre}</p>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1.5 border rounded-xl ${siembra ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {siembra ? 'EN EJECUCIÓN' : 'PLANIFICADO'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar gap-1 bg-white p-1 rounded-2xl border">
          <button onClick={() => setActiveTab('preparacion')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'preparacion' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <Tractor className="w-4 h-4" /> Preparación
          </button>
          <button onClick={() => setActiveTab('siembra')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'siembra' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <Sprout className="w-4 h-4" /> Siembra
          </button>
          <button onClick={() => setActiveTab('fenologia')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'fenologia' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <CalendarDays className="w-4 h-4" /> Fenología
          </button>
          <button onClick={() => setActiveTab('fitosanitario')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'fitosanitario' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <ShieldAlert className="w-4 h-4" /> Sanidad Fitosanitaria
          </button>
          <button onClick={() => setActiveTab('nutricion')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'nutricion' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <Sparkles className="w-4 h-4" /> Nutrición
          </button>
          <button onClick={() => setActiveTab('riego')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'riego' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <Droplet className="w-4 h-4" /> Riego y Lámina
          </button>
          <button onClick={() => setActiveTab('costos')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'costos' ? 'bg-rice-green text-white shadow-md shadow-rice-green/10' : 'text-gray-500 hover:text-gray-800'}`}>
            <Coins className="w-4 h-4" /> Billetera de Costos
          </button>
          <button onClick={() => setActiveTab('cosecha')} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm whitespace-nowrap relative rounded-xl transition-all ${activeTab === 'cosecha' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'text-gray-500 hover:text-amber-600'}`}>
            <Wheat className="w-4 h-4" /> Cosecha y Producción
          </button>
        </div>

        <div className="pb-20">
          {loading ? (
            <div className="flex justify-center py-10"><Loader className="animate-spin text-rice-green w-8 h-8" /></div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB 1: PREPARACIÓN */}
              {activeTab === 'preparacion' && (
                <motion.div key="prep" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Labores de Adecuación Mecánica</h2>
                    <button onClick={() => setIsModalPrepOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                      <Plus className="w-4 h-4" /> Registrar Labor
                    </button>
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
              )}

              {/* TAB 2: SIEMBRA */}
              {activeTab === 'siembra' && (
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
              )}

              {/* TAB 3: FENOLOGÍA */}
              {activeTab === 'fenologia' && (
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
                        <button onClick={() => setIsModalFenoOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                          <Plus className="w-4 h-4" /> Registrar Etapa
                        </button>
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
                                  <h3 className="text-lg font-bold text-rice-dark">{faseToLabel[f.fase]}</h3>
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
              )}

              {/* TAB 4: SANIDAD FITOSANITARIA (SOPORTE OFFLINE + GPS) */}
              {activeTab === 'fitosanitario' && (
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
                        <button onClick={() => setIsModalMonitoreoOpen(true)} className="bg-rice-green text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Nuevo Monitoreo
                        </button>
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
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  m.tipo_problema === 'PLAGA' ? 'bg-red-50 text-red-600 border border-red-100' :
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
                        <button onClick={() => setIsModalAplicacionOpen(true)} className="bg-rice-green text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Registrar Aplicación
                        </button>
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
                                
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-gray-100 font-semibold text-gray-700">
                                  <p>💨 Viento: {a.velocidad_viento_kmh ? `${a.velocidad_viento_kmh} Km/h` : 'N/A'}</p>
                                  <p>🌡️ Temp: {a.temperatura_c ? `${a.temperatura_c} °C` : 'N/A'}</p>
                                  <p className="col-span-2">✈️ Método: {a.equipo_aspersion}</p>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-500">Periodo de Carencia</p>
                                    <span className={`text-xs font-extrabold inline-block mt-0.5 px-2.5 py-0.5 rounded-full ${
                                      carenciaActiva ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
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
              )}

              {/* TAB 5: NUTRICIÓN Y FERTILIZACIÓN */}
              {activeTab === 'nutricion' && (
                <motion.div key="nut" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Plan Nutricional y Fertilización</h2>
                    <button onClick={() => setIsModalFertilizacionOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                      <Plus className="w-4 h-4" /> Registrar Fertilización
                    </button>
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
              )}

              {/* TAB 6: RIEGO Y MANEJO HÍDRICO */}
              {activeTab === 'riego' && (
                <motion.div key="riego" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Control de Riego y Lámina de Agua</h2>
                    <button onClick={() => setIsModalRiegoOpen(true)} className="bg-rice-green text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-rice-green/30 hover:bg-[#154224] flex items-center gap-2 text-sm">
                      <Plus className="w-4 h-4" /> Registrar Riego
                    </button>
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
              )}

              {/* TAB 7: BILLETERA DE COSTOS (MANUALES Y AUTOMÁTICOS) */}
              {activeTab === 'costos' && (
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
                      <button onClick={() => setIsModalCostoOpen(true)} className="bg-rice-green text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#154224] text-xs shadow-md shadow-rice-green/20 flex items-center gap-1.5 shrink-0">
                        <Plus className="w-4 h-4" /> Asentar Costo Extraordinario
                      </button>
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
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {costos.map(c => (
                              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{c.fecha}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{categoriaToLabel[c.categoria] || c.categoria}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{c.descripcion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-rice-dark">{formatCOP(c.monto_total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 8: COSECHA */}
              {activeTab === 'cosecha' && (
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

                        <div className="bg-white/60 p-5 rounded-2xl backdrop-blur-sm border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* MODAL 1: PREPARACIÓN */}
      <AnimatePresence>
        {isModalPrepOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Labor de Maquinaria</h3>
                <button onClick={() => setIsModalPrepOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreatePrep} className="p-6 space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevaPrep.fecha} onChange={e => setNuevaPrep({...nuevaPrep, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Labor</label>
                  <select value={nuevaPrep.labor} onChange={e => setNuevaPrep({...nuevaPrep, labor: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                    {Object.entries(laborToLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Horas Tractor</label><input type="number" step="0.1" min="0" required value={nuevaPrep.horas_maquina} onChange={e => setNuevaPrep({...nuevaPrep, horas_maquina: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Combustible (Gal)</label><input type="number" step="0.1" min="0" value={nuevaPrep.combustible_galones} onChange={e => setNuevaPrep({...nuevaPrep, combustible_galones: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Costo por Hora (COP)</label>
                  <input type="number" step="1" min="0" required value={nuevaPrep.costo_hora} onChange={e => setNuevaPrep({...nuevaPrep, costo_hora: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 80000" />
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label><textarea rows="2" value={nuevaPrep.observaciones} onChange={e => setNuevaPrep({...nuevaPrep, observaciones: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Guardar e inyectar costo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FENOLOGÍA */}
      <AnimatePresence>
        {isModalFenoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Etapa Fenológica</h3>
                <button onClick={() => setIsModalFenoOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateFeno} className="p-6 space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha Detectada en Campo</label><input type="date" required value={nuevaFeno.fecha} onChange={e => setNuevaFeno({...nuevaFeno, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fase Vegetativa/Reproductiva</label>
                  <select value={nuevaFeno.fase} onChange={e => setNuevaFeno({...nuevaFeno, fase: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                    {Object.entries(faseToLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Observaciones (Sanidad, vigor)</label><textarea rows="3" value={nuevaFeno.observaciones} onChange={e => setNuevaFeno({...nuevaFeno, observaciones: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Registrar Fase'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: MONITOREO FITOSANITARIO (CON GPS) */}
      <AnimatePresence>
        {isModalMonitoreoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Amenaza Fitosanitaria</h3>
                <button onClick={() => setIsModalMonitoreoOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateMonitoreo} className="p-6 space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevoMonitoreo.fecha} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo Amenaza</label>
                    <select value={nuevoMonitoreo.tipo_problema} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, tipo_problema: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      <option value="PLAGA">Plaga</option>
                      <option value="ENFERMEDAD">Enfermedad</option>
                      <option value="MALEZA">Maleza</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Común</label>
                    <input type="text" required value={nuevoMonitoreo.nombre_comun} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, nombre_comun: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Sogata" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Umbral de Daño Observado (%)</label>
                  <input type="number" step="0.01" min="0" max="100" required value={nuevoMonitoreo.umbral_danio_porcentaje} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, umbral_danio_porcentaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 12.5" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Decisión Técnica Recomendada</label>
                  <textarea rows="2" required value={nuevoMonitoreo.decision_tecnica} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, decision_tecnica: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Monitorear por 3 días más..." />
                </div>

                <div className="border border-dashed border-gray-250 rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rice-emerald" /> Coordenadas Geográficas (GPS)
                    </span>
                    <button type="button" onClick={capturarGPS} className="bg-rice-emerald text-white px-2.5 py-1 rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Capturar GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input type="number" step="any" placeholder="Latitud" value={nuevoMonitoreo.latitud} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, latitud: e.target.value})} className="w-full px-3 py-1.5 bg-white border border-gray-250 rounded-xl text-xs outline-none" />
                    </div>
                    <div>
                      <input type="number" step="any" placeholder="Longitud" value={nuevoMonitoreo.longitud} onChange={e => setNuevoMonitoreo({...nuevoMonitoreo, longitud: e.target.value})} className="w-full px-3 py-1.5 bg-white border border-gray-250 rounded-xl text-xs outline-none" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Guardar Monitoreo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: APLICACIÓN DE AGROQUÍMICOS */}
      <AnimatePresence>
        {isModalAplicacionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Aplicación Fitosanitaria</h3>
                <button onClick={() => setIsModalAplicacionOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateAplicacion} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevaAplicacion.fecha} onChange={e => setNuevaAplicacion({...nuevaAplicacion, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Monitoreo Relacionado</label>
                    <select value={nuevaAplicacion.monitoreo} onChange={e => setNuevaAplicacion({...nuevaAplicacion, monitoreo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none text-sm">
                      <option value="">Ninguno / Preventivo</option>
                      {monitoreos.map(m => <option key={m.id} value={m.id}>{m.nombre_comun} ({m.fecha})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Comercial</label>
                    <input type="text" required value={nuevaAplicacion.nombre_comercial} onChange={e => setNuevaAplicacion({...nuevaAplicacion, nombre_comercial: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Roundup" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ingrediente Activo</label>
                    <input type="text" required value={nuevaAplicacion.ingrediente_activo} onChange={e => setNuevaAplicacion({...nuevaAplicacion, ingrediente_activo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Glifosato" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosis (L/Ha o Kg/Ha)</label>
                    <input type="number" step="0.01" min="0" required value={nuevaAplicacion.dosis_por_ha} onChange={e => setNuevaAplicacion({...nuevaAplicacion, dosis_por_ha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Equipo de Aspersión</label>
                    <select value={nuevaAplicacion.equipo_aspersion} onChange={e => setNuevaAplicacion({...nuevaAplicacion, equipo_aspersion: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      <option value="BOMBA_ESPALDA">Bomba de Espalda (Manual)</option>
                      <option value="DRON">Dron Agrícola</option>
                      <option value="TRACTOR">Tractor / Aguilón</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border border-indigo-100 bg-indigo-50/20 p-3 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 mb-1">Temperatura (°C)</label>
                    <input type="number" step="0.1" value={nuevaAplicacion.temperatura_c} onChange={e => setNuevaAplicacion({...nuevaAplicacion, temperatura_c: e.target.value})} className="w-full px-3 py-1.5 bg-white border border-gray-250 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: 28.5" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 mb-1">Velocidad del Viento (Km/h)</label>
                    <input type="number" step="0.1" value={nuevaAplicacion.velocidad_viento_kmh} onChange={e => setNuevaAplicacion({...nuevaAplicacion, velocidad_viento_kmh: e.target.value})} className="w-full px-3 py-1.5 bg-white border border-gray-250 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: 5.4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Periodo de Carencia (Días de retiro)</label>
                  <input type="number" step="1" min="0" required value={nuevaAplicacion.periodo_carencia_dias} onChange={e => setNuevaAplicacion({...nuevaAplicacion, periodo_carencia_dias: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Días mínimos antes de cosechar..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Producto (COP)</label>
                    <input type="number" step="1" min="0" required value={nuevaAplicacion.costo_producto} onChange={e => setNuevaAplicacion({...nuevaAplicacion, costo_producto: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 150000" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Mano Obra (COP)</label>
                    <input type="number" step="1" min="0" required value={nuevaAplicacion.costo_mano_obra} onChange={e => setNuevaAplicacion({...nuevaAplicacion, costo_mano_obra: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 80000" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Guardar e inyectar costo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: FERTILIZACIÓN */}
      <AnimatePresence>
        {isModalFertilizacionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Fertilización del Suelo</h3>
                <button onClick={() => setIsModalFertilizacionOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateFertilizacion} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevaFertilizacion.fecha} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Etapa Fenológica</label>
                    <select value={nuevaFertilizacion.etapa_fenologica} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, etapa_fenologica: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      {Object.entries(faseToLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fórmula Química</label>
                    <select value={nuevaFertilizacion.tipo_fertilizante} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, tipo_fertilizante: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      <option value="NPK_COMPLETO">NPK Completo (15-15-15)</option>
                      <option value="UREA">Urea (46-0-0)</option>
                      <option value="DAP">DAP (18-46-0)</option>
                      <option value="MEZCLA_FISICA">Mezcla Física Personalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fuente Comercial</label>
                    <input type="text" required value={nuevaFertilizacion.fuente_comercial} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, fuente_comercial: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Ferticol / Monómeros" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Dosis (Kg/Ha)</label>
                  <input type="number" step="0.1" min="0" required value={nuevaFertilizacion.dosis_kg_ha} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, dosis_kg_ha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 150" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Fertilizante (COP)</label>
                    <input type="number" step="1" min="0" required value={nuevaFertilizacion.costo_producto} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, costo_producto: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 240000" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Aplicación (COP)</label>
                    <input type="number" step="1" min="0" required value={nuevaFertilizacion.costo_mano_obra} onChange={e => setNuevaFertilizacion({...nuevaFertilizacion, costo_mano_obra: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 60000" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Guardar e inyectar costo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: RIEGO */}
      <AnimatePresence>
        {isModalRiegoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Registrar Manejo Hídrico y Riego</h3>
                <button onClick={() => setIsModalRiegoOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateRiego} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevoRiego.fecha} onChange={e => setNuevoRiego({...nuevoRiego, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fuente Hídrica</label>
                    <select value={nuevoRiego.fuente_hidrica} onChange={e => setNuevoRiego({...nuevoRiego, fuente_hidrica: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      <option value="CANAL">Canal de Riego</option>
                      <option value="RIO">Río Directo</option>
                      <option value="POZO">Pozo Profundo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Volumen de Agua (m³)</label>
                    <input type="number" step="0.1" required value={nuevoRiego.volumen_agua_m3} onChange={e => setNuevoRiego({...nuevoRiego, volumen_agua_m3: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Espesor Lámina (cm)</label>
                    <input type="number" step="0.1" required value={nuevoRiego.lamina_agua_cm} onChange={e => setNuevoRiego({...nuevoRiego, lamina_agua_cm: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 5.0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Días de Inundación</label>
                    <input type="number" step="1" min="0" required value={nuevoRiego.dias_inundacion} onChange={e => setNuevoRiego({...nuevoRiego, dias_inundacion: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 14" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estado Drenaje</label>
                    <select value={nuevoRiego.estado_drenaje} onChange={e => setNuevoRiego({...nuevoRiego, estado_drenaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                      <option value="ABIERTO">Abierto (Compuerta Abierta)</option>
                      <option value="CERRADO">Cerrado (Inundación Retenida)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Costo Bombeo / Combustible (COP)</label>
                  <input type="number" step="1" min="0" required value={nuevoRiego.costo_bombeo} onChange={e => setNuevoRiego({...nuevoRiego, costo_bombeo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 95000" />
                </div>

                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Guardar e inyectar costo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 7: COSTO EXTRAORDINARIO */}
      <AnimatePresence>
        {isModalCostoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-gray-900">Asentar Costo Manual Extraordinario</h3>
                <button onClick={() => setIsModalCostoOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateCosto} className="p-6 space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label><input type="date" required value={nuevoCosto.fecha} onChange={e => setNuevoCosto({...nuevoCosto, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" /></div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoría Contable</label>
                  <select value={nuevoCosto.categoria} onChange={e => setNuevoCosto({...nuevoCosto, categoria: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none">
                    <option value="MANO_DE_OBRA">Mano de Obra Extraordinaria</option>
                    <option value="ARRENDAMIENTO_TIERRA">Arrendamiento de Tierra / Equipos</option>
                    <option value="TRANSPORTE">Transporte / Acarreo</option>
                    <option value="INSUMOS_AGROQUIMICOS">Insumos Adicionales</option>
                    <option value="MAQUINARIA">Alquiler de Maquinaria</option>
                    <option value="OTROS">Otros Imprevistos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descripción del Gasto</label>
                  <input type="text" required value={nuevoCosto.descripcion} onChange={e => setNuevoCosto({...nuevoCosto, descripcion: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: Compra de sacos de empaque" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Monto Total COP ($)</label>
                  <input type="number" step="1" min="0" required value={nuevoCosto.monto_total} onChange={e => setNuevoCosto({...nuevoCosto, monto_total: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rice-emerald outline-none" placeholder="Ej: 50000" />
                </div>

                <button type="submit" disabled={saving} className="w-full bg-rice-green text-white py-3 rounded-xl font-bold shadow-md shadow-rice-green/35 hover:bg-[#154224] transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Asentar en Billetera'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 8: COSECHA */}
      <AnimatePresence>
        {isModalCosechaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-amber-100 flex justify-between items-center bg-amber-50">
                <h3 className="font-extrabold text-amber-900 flex items-center gap-2"><Wheat className="w-5 h-5"/> Registrar Cosecha Final</h3>
                <button onClick={() => setIsModalCosechaOpen(false)} className="p-1 text-amber-600 hover:bg-amber-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateCosecha} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Cosecha</label>
                  <input type="date" required value={nuevaCosecha.fecha} onChange={e => setNuevaCosecha({...nuevaCosecha, fecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Producción Obtenida (Kg totales)</label>
                  <input type="number" step="0.1" min="0" required value={nuevaCosecha.produccion_obtenida_kg} onChange={e => setNuevaCosecha({...nuevaCosecha, produccion_obtenida_kg: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej: 8500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Humedad (%)</label>
                    <input type="number" step="0.1" min="0" max="100" required value={nuevaCosecha.humedad_grano_porcentaje} onChange={e => setNuevaCosecha({...nuevaCosecha, humedad_grano_porcentaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej: 22.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Impurezas (%)</label>
                    <input type="number" step="0.1" min="0" max="100" required value={nuevaCosecha.impurezas_porcentaje} onChange={e => setNuevaCosecha({...nuevaCosecha, impurezas_porcentaje: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej: 2.0" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Condiciones / Observaciones</label>
                  <textarea rows="3" value={nuevaCosecha.condiciones_cosecha} onChange={e => setNuevaCosecha({...nuevaCosecha, condiciones_cosecha: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none" placeholder="Ej: Cosecha con lluvias leves en la tarde..."></textarea>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold shadow-md shadow-amber-500/35 hover:bg-amber-600 transition-colors">{saving ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Confirmar Cierre de Cultivo'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${toast.type === 'success' ? 'bg-white text-emerald-800 border-2 border-emerald-500' : 'bg-white text-red-800 border-2 border-red-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
