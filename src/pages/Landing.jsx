import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tractor, Leaf, Coins, ShieldAlert, CheckCircle2, 
  MapPin, Sparkles, Sprout, ArrowRight, ArrowUpRight, 
  Settings, Users, ChevronRight, BarChart3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [pH, setPH] = useState(5.2);
  const [showSeedAnim, setShowSeedAnim] = useState(false);
  const [isApt, setIsApt] = useState(false);

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/fincas');
    }
  }, [navigate]);

  // Actualizar aptitud del suelo
  useEffect(() => {
    setIsApt(pH >= 5.5 && pH <= 7.5);
    if (pH < 5.5) {
      setShowSeedAnim(false); // Resetear animación si deja de ser apto
    }
  }, [pH]);

  // Variantes para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-gray-100 overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Luces y brillos de fondo decorativos */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-950/20 rounded-full filter blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full filter blur-[180px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* 1. Navbar Sticky con Efecto de Cristal */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#060a08]/75 border-b border-emerald-950/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1E5631] to-[#4C9A2A] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              SIG-ARROZ
              <span className="text-xs font-bold text-[#D4AF37] px-1.5 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                V3.0
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Dos Columnas) */}
      <header className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-7 space-y-8"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            La plataforma definitiva para agricultura de precisión
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]"
          >
            Inteligencia Agronómica <br />
            y Financiera <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-[#D4AF37] bg-clip-text text-transparent">
              en la Palma de tu Mano
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-400 max-w-xl font-medium leading-relaxed"
          >
            Lleva el control absoluto de tus fincas y lotes. Toma decisiones basadas en calidad real de suelo, gestiona labores, monitorea plagas con GPS y controla el presupuesto de tu cosecha de arroz en tiempo real.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <Link 
              to="/register" 
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-[#4C9A2A] hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-extrabold shadow-lg shadow-emerald-950/60 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              Comienza Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#simulador" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              Probar Simulador
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </a>
          </motion.div>

          {/* Estadísticas Híbridas */}
          <motion.div 
            variants={itemVariants}
            className="pt-8 border-t border-emerald-950/40 grid grid-cols-3 gap-6 max-w-lg"
          >
            <div>
              <p className="text-3xl font-black text-[#D4AF37] tracking-tight">+25%</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Productividad Promedio</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-400 tracking-tight">-15%</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Costo de Insumos</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-200 tracking-tight">100%</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Control Financiero</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Columna Derecha: El Simulador Wow de pH */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          id="simulador"
          className="lg:col-span-5"
        >
          <div className="relative group">
            {/* Brillo de fondo interactivo */}
            <div className={`absolute -inset-0.5 rounded-3xl blur-2xl opacity-35 transition-all duration-500 ${
              isApt ? 'bg-emerald-500' : 'bg-red-500'
            }`}></div>

            <div className="relative bg-[#0b120e]/95 border border-emerald-900/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-950/50">
                <div>
                  <h3 className="text-lg font-black text-white">Simulador de Suelo Activo</h3>
                  <p className="text-xs text-gray-500 font-bold">Lógica de Siembra y Bloqueo Agronómico</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center">
                  <Leaf className={`w-4 h-4 transition-colors ${isApt ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
              </div>

              {/* Slider de pH */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">Nivel de pH del Suelo:</span>
                  <span className={`text-xl font-black px-3 py-1 rounded-lg ${
                    isApt ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'
                  }`}>
                    {pH.toFixed(1)}
                  </span>
                </div>

                <input 
                  type="range" 
                  min="4.0" 
                  max="8.0" 
                  step="0.1" 
                  value={pH} 
                  onChange={(e) => setPH(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-emerald-950/60 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                <div className="flex justify-between text-2xs text-gray-500 font-bold">
                  <span>4.0 (Ácido)</span>
                  <span>5.5 (Límite Apto)</span>
                  <span>7.5 (Límite Apto)</span>
                  <span>8.0 (Alcalino)</span>
                </div>
              </div>

              {/* Alerta de Aptitud de Suelo Dinámica */}
              <AnimatePresence mode="wait">
                {!isApt ? (
                  <motion.div 
                    key="not-apt"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-red-950/30 border border-red-900/30 flex gap-3 text-sm"
                  >
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-400">Suelo No Apto (Bloqueo Agronómico)</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        El pH es demasiado ácido. El sistema **bloqueará** el inicio de cualquier ciclo productivo de siembra en este lote para evitar pérdidas. Se requiere enmienda mineral (Cal).
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="apt"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/30 flex gap-3 text-sm"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-400">Suelo Óptimo para Arroz</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        El pH se encuentra en el rango saludable (5.5 - 7.5). El sistema **desbloquea** inmediatamente la creación de ciclos de siembra de precisión. ¡Listo para sembrar!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón y Animación del Brote en Vivo */}
              <div>
                <button
                  onClick={() => isApt && setShowSeedAnim(true)}
                  disabled={!isApt}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    isApt 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/50 hover:-translate-y-0.5' 
                      : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  {showSeedAnim ? '¡Ciclo de Cosecha Simulado!' : 'Simular Iniciar Ciclo'}
                </button>

                {/* Zona de micro-animación de la germinación del arroz */}
                <AnimatePresence>
                  {showSeedAnim && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-emerald-950/50 flex flex-col items-center justify-center text-center space-y-2 bg-[#060a08]/40 rounded-2xl p-4 border border-emerald-950/30"
                    >
                      <div className="relative w-16 h-16 bg-[#0D1A12] border border-emerald-900/30 rounded-2xl flex items-center justify-center overflow-hidden">
                        <motion.div 
                          initial={{ scale: 0.5, y: 15 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                        >
                          <Sprout className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </motion.div>
                        <div className="absolute bottom-0 w-full h-3 bg-amber-950/40 border-t border-amber-900/30"></div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#D4AF37] tracking-tight">¡Semilla Germinada con Éxito!</p>
                        <p className="text-2xs text-gray-500 font-bold mt-0.5">Ciclo activo: Lote en estado EN_CICLO</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* 3. Features Section (Estilo Cristal/Glassmorphism) */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-emerald-950/30">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Características Destacadas</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Diseñado para Agricultores Modernos
          </h3>
          <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
            Unificamos la agronomía rigurosa y las finanzas contables en una interfaz limpia y libre de complicaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Análisis de Suelo */}
          <div className="bg-[#0b120e]/60 border border-emerald-900/20 hover:border-emerald-800/40 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Análisis de Suelos Dinámico</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              Conoce el pH, fósforo y potasio de tus lotes. Valida la aptitud agronómica antes de planificar tu siembra para evitar riesgos.
            </p>
          </div>

          {/* Card 2: Bitácora de Labores */}
          <div className="bg-[#0b120e]/60 border border-emerald-900/20 hover:border-emerald-800/40 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Tractor className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Bitácora de Campo de Precisión</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              Registra horas de maquinaria, combustible, siembra, monitoreo fitosanitario y compuertas de riego integradas de forma cronológica.
            </p>
          </div>

          {/* Card 3: Billetera Contable */}
          <div className="bg-[#0b120e]/60 border border-emerald-900/20 hover:border-emerald-800/40 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Coins className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Billetera Contable del Cultivo</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              Egresos autoinyectados desde las labores registradas y costos extraordinarios manuales. Controla tu margen de rentabilidad y eficiencia en tiempo real.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-emerald-950/30 flex flex-col md:flex-row items-center justify-between text-xs font-medium text-gray-500 gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-950/50 rounded-lg border border-emerald-900/30 flex items-center justify-center">
            <Tractor className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="font-bold text-gray-300">SIG-ARROZ</span>
        </div>
        <p>© 2026 SIG-ARROZ. Todos los derechos reservados. Agricultura de precisión y eficiencia contable.</p>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-emerald-400 transition-colors">Iniciar Sesión</Link>
          <span>•</span>
          <Link to="/register" className="hover:text-emerald-400 transition-colors">Registrarse</Link>
        </div>
      </footer>
    </div>
  );
}
