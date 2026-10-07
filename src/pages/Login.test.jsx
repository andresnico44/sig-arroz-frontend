import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

test('renders Login form correctly', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  // Test that "Iniciar Sesión" button exists
  const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
  expect(loginButton).toBeInTheDocument();

  // Test that inputs exist
  const emailInput = screen.getByLabelText(/Correo Electrónico/i);
  const passwordInput = screen.getByLabelText(/Contraseña/i);

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});
