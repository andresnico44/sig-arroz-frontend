# 🌾 SIG-ARROZ — Frontend Web Application

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Interfaz de usuario moderna, reactiva y georreferenciada para el **Sistema de Información Georreferenciada para el Cultivo de Arroz (SIG-ARROZ)**. Permite a productores, técnicos agrícolas y administradores gestionar predios, registrar labores agronómicas de campo, monitorear el recurso hídrico, controlar plagas y enfermedades (con soporte offline) y visualizar análisis financieros de rentabilidad en tiempo real.

---

## 1. Arquitectura y Módulos de la Aplicación

La aplicación está construida como una **Single Page Application (SPA)** impulsada por **Vite + React 18**, con tipografía, componentes e iconografía optimizados para dispositivos móviles y de escritorio en campo:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SIG-ARROZ Client Web (SPA)                      │
├────────────────────────────────────────────────────────────────────────┤
│  Módulo de Autenticación & RBAC                                        │
│  - Login JWT con almacenamiento seguro en LocalStorage                 │
│  - Registro de usuarios con asignación de roles (ADMIN, PRODUCTOR)     │
│  - Rutas protegidas por perfil (ProtectedRoute.jsx)                    │
├────────────────────────────────────────────────────────────────────────┤
│  Módulo Territorial (Fincas y Lotes)                                   │
│  - Gestión de fincas, geolocalización de lotes y análisis de suelo      │
├────────────────────────────────────────────────────────────────────────┤
│  Tablero Operativo del Ciclo (CicloDetalle.jsx)                        │
│  - Tab Preparación: Labores mecánicas y consumo de horas tractor       │
│  - Tab Siembra: Variedades botánicas y prueba de germinación           │
│  - Tab Fenología: Escala agronómica de vigor y captura fotográfica     │
│  - Tab Fitosanitario: Registro de plagas/enfermedades + Modo Offline   │
│  - Tab Nutrición: Fertilización edáfica/foliar y cálculo de costos     │
│  - Tab Riego: Lámina en cm, balance de agua y compuertas de drenaje    │
│  - Tab Costos: Billetera contable y advertencias de presupuesto        │
│  - Tab Cosecha & Liquidación: Rendimiento t/ha y trilla con molino     │
│  - Tab Trazabilidad: Historial cronológico consolidado y rentabilidad  │
├────────────────────────────────────────────────────────────────────────┤
│  Panel de Administración (AdminDashboard.jsx)                          │
│  - KPIs globales de cobertura territorial y gestión de cuentas         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requisitos Previos

Asegúrese de contar con las siguientes herramientas instaladas en su entorno:

- **Node.js:** Versión `18.x`, `20.x` o superior (LTS recomendada).
- **Gestor de Paquetes:** `npm` (versión `9.x` o `10.x`) o `pnpm` / `yarn`.
- **Servicio Backend:** Una instancia en ejecución del backend `sig-arroz-backend` (localmente en `http://localhost:8000` o en la nube).

---

## 3. Puesta en Marcha en Entorno Local

Siga los siguientes pasos para configurar y arrancar la aplicación en su máquina:

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/andresnico44/sig-arroz-frontend.git
cd sig-arroz-frontend
```

### Paso 2: Instalar Dependencias
Instale los paquetes de Node.js requeridos por el proyecto:
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Cree el archivo de configuración local a partir de la plantilla `.env.example`:

- **En Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **En Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

Edite el archivo `.env` para especificar la dirección del backend:
```env
# Conexión al backend Django REST Framework
VITE_API_URL=http://localhost:8000
```

> [!TIP]
> Si no especifica `VITE_API_URL`, la aplicación detecta de forma inteligente si está ejecutándose en `localhost` y apuntará por defecto a `http://localhost:8000`.

### Paso 4: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación iniciará con soporte de recarga rápida de módulos (HMR) en:
👉 `http://localhost:5173/`

---

## 4. Scripts Disponibles

El archivo `package.json` define los siguientes comandos de ciclo de vida:

| Script | Comando | Descripción |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Inicia el servidor de desarrollo local con Vite en el puerto `5173`. |
| `build` | `npm run build` | Compila y optimiza la aplicación para producción en el directorio `dist/`. |
| `preview` | `npm run preview` | Previsualiza localmente el paquete de producción generado en `dist/`. |
| `lint` | `npm run lint` | Ejecuta el análisis estático de código con ESLint para detectar errores de sintaxis y buenas prácticas. |
| `test` | `npm run test` | Ejecuta la suite de pruebas unitarias y de integración de componentes con Vitest. |
| `coverage` | `npm run coverage` | Genera el informe de cobertura de código (`coverage/`) con motor V8. |

---

## 5. Pruebas Automatizadas

La aplicación cuenta con cobertura de pruebas sobre formularios de autenticación, renderizado de componentes y navegación:

```bash
# Ejecutar todas las pruebas en consola
npm run test

# Ejecutar pruebas y generar reporte de cobertura
npm run coverage
```

Los reportes HTML detallados quedan disponibles en `coverage/index.html`.

---

## 6. Guía de Conexión con el Backend e Integración API

La comunicación HTTP se realiza mediante una instancia centralizada de **Axios** en [`src/api.js`](file:///c:/Users/Nicole/Desktop/SIGARROZ/sig-arroz-frontend/src/api.js):

1. **Inyección de Tokens JWT:** Un interceptor de solicitud inspecciona el `localStorage` y adjunta automáticamente la cabecera `Authorization: Bearer <token>` en cada llamado.
2. **Renovación Automática de Tokens (Refresh Flow):** Si el servidor responde con estado `401 Unauthorized`, un interceptor de respuesta captura la petición original, solicita un nuevo `access_token` al endpoint `/api/token/refresh/` usando el `refresh_token`, y reintenta la solicitud transparente para el usuario.
3. **Resiliencia y Modo Offline en Campo:**
   - Para labores en zonas rurales sin cobertura móvil (como el monitoreo fitosanitario), el frontend almacena los registros en `localStorage` (`offline_monitoreos_{cicloId}`).
   - Al restablecerse la conectividad a internet, se presenta el botón de **"Sincronizar"** para despachar en lote las peticiones pendientes al backend.

---

## 7. Despliegue en Producción (Vercel)

La aplicación está preconfigurada para despliegue continuo en **Vercel**:
- **Archivo `vercel.json`:** Configura el enrutamiento para aplicaciones SPA, redirigiendo todas las rutas hacia `index.html`:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Variables de Entorno en Vercel:**
  Configure en el panel de Vercel la variable:
  ```
  VITE_API_URL=https://tu-backend-en-railway.up.railway.app
  ```

---

## 8. Estructura de Directorios

```
sig-arroz-frontend/
├── public/                # Favicon y recursos estáticos no procesados
├── src/
│   ├── assets/            # Imágenes, iconos SVG e ilustraciones
│   ├── components/        # Componentes reutilizables (ProtectedRoute, modales)
│   ├── context/           # Contextos de React (AuthContext)
│   ├── pages/             # Vistas principales de la aplicación
│   │   ├── Landing.jsx            # Portal informativo de bienvenida
│   │   ├── Login.jsx              # Inicio de sesión
│   │   ├── Register.jsx           # Registro de usuarios
│   │   ├── Fincas.jsx             # Gestión de predios rurales
│   │   ├── Lotes.jsx              # Gestión de parcelas por finca
│   │   ├── LoteDetalle.jsx        # Detalle de lote y análisis de suelo
│   │   ├── CicloDetalle.jsx       # Gestión operativa integral de ciclo
│   │   ├── AdminDashboard.jsx     # Tablero administrativo de control
│   │   └── HistorialProduccion.jsx# Consolidado histórico de cosechas
│   ├── api.js             # Cliente Axios con interceptores JWT
│   ├── App.jsx            # Router principal y rutas protegidas
│   └── main.jsx           # Punto de entrada de React
├── .env.example           # Plantilla de variables de entorno
├── index.html             # Plantilla HTML base
├── tailwind.config.js     # Configuración de diseño y paleta de colores
├── vite.config.js         # Configuración del bundler Vite
└── vitest.config.js       # Configuración de la suite de pruebas
```

---

## 9. Licencia
Proyecto desarrollado para **SIG-ARROZ**. Documentación y gestión bajo la norma **IEEE 828:2022**.
