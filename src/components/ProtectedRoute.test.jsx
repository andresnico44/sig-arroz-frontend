import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('HU-033 / CR-013: Matriz de Control de Acceso por Rol (ProtectedRoute)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Escenario 1: Redirige a /login cuando un visitante sin sesión intenta acceder a /fincas', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/fincas']}>
        <Routes>
          <Route path="/login" element={<div>Vista Login</div>} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTOR', 'TECNICO']} />}>
            <Route path="/fincas" element={<div>Panel Fincas</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vista Login')).toBeInTheDocument();
    expect(screen.queryByText('Panel Fincas')).not.toBeInTheDocument();
  });

  it('Escenario 1 (Admin URL): Redirige a /login cuando un visitante sin sesión intenta acceder a /admin/dashboard', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Vista Login</div>} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<div>Panel Admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vista Login')).toBeInTheDocument();
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
  });

  it('Escenario 2: Usuario PRODUCTOR intentando acceder a ruta exclusiva de ADMIN es redirigido a /fincas', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { username: 'productor_test', rol: 'PRODUCTOR' },
      token: 'jwt-valid-token-productor',
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin/usuarios']}>
        <Routes>
          <Route path="/fincas" element={<div>Panel Fincas del Productor</div>} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/usuarios" element={<div>Panel Admin Usuarios</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Fincas del Productor')).toBeInTheDocument();
    expect(screen.queryByText('Panel Admin Usuarios')).not.toBeInTheDocument();
  });

  it('Escenario 2 (Técnico): Usuario TECNICO intentando acceder a ruta de ADMIN es redirigido a /fincas', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { username: 'tecnico_test', rol: 'TECNICO' },
      token: 'jwt-valid-token-tecnico',
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <Routes>
          <Route path="/fincas" element={<div>Panel Fincas</div>} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<div>Panel Admin Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Fincas')).toBeInTheDocument();
    expect(screen.queryByText('Panel Admin Dashboard')).not.toBeInTheDocument();
  });

  it('Escenario 3: Acceso legítimo de ADMIN a ruta exclusiva /admin-dashboard renderiza el componente hijo', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { username: 'admin_test', rol: 'ADMIN' },
      token: 'jwt-valid-token-admin',
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <Routes>
          <Route path="/fincas" element={<div>Panel Fincas</div>} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<div>Panel Admin Dashboard Exitoso</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Admin Dashboard Exitoso')).toBeInTheDocument();
  });

  it('Escenario 3 (Productor): Acceso legítimo de PRODUCTOR a /fincas renderiza la vista solicitada', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { username: 'productor_test', rol: 'PRODUCTOR' },
      token: 'jwt-valid-token-productor',
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/fincas']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTOR', 'TECNICO']} />}>
            <Route path="/fincas" element={<div>Vista Fincas Autorizada</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vista Fincas Autorizada')).toBeInTheDocument();
  });

  it('Renderiza indicador de carga cuando la verificación de sesión está en progreso', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: null,
      token: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/fincas']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTOR', 'TECNICO']} />}>
            <Route path="/fincas" element={<div>Vista Fincas</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  });
});

