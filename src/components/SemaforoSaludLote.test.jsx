import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SemaforoSaludLote from './SemaforoSaludLote';
import { calcularSaludLote } from '../services/saludLoteService';

describe('HU-036 / Subtarea 2: Componente Visual SemaforoSaludLote', () => {
  it('renderiza correctamente el badge en estado ÓPTIMO (Verde)', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'EXCELENTE' },
      fitosanitario: { umbral_danio_porcentaje: 2 },
      hidrico: { lamina_agua_cm: 6 },
    });

    render(<SemaforoSaludLote diagnostico={diag} />);

    const badge = screen.getByRole('button', { name: /salud del lote: óptimo/i });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('Óptimo');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('renderiza correctamente el badge en estado CRÍTICO (Rojo)', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'MALO' },
      fitosanitario: { umbral_danio_porcentaje: 20 },
      hidrico: { lamina_agua_cm: 1.0 },
    });

    render(<SemaforoSaludLote diagnostico={diag} />);

    const badge = screen.getByRole('button', { name: /salud del lote: crítico/i });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('Crítico');
    expect(badge.className).toContain('text-red-700');
  });

  it('renderiza correctamente el badge en estado PRECAUCIÓN (Amarillo)', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'REGULAR' },
      fitosanitario: { umbral_danio_porcentaje: 8 },
      hidrico: { lamina_agua_cm: 3.0 },
    });

    render(<SemaforoSaludLote diagnostico={diag} />);

    const badge = screen.getByRole('button', { name: /salud del lote: precaución/i });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('Precaución');
    expect(badge.className).toContain('text-amber-700');
  });

  it('muestra el Tooltip detallado al interactuar o hacer clic en el badge', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'BUENO' },
      fitosanitario: { umbral_danio_porcentaje: 18, nombre_comun: 'Sogata' },
      hidrico: { lamina_agua_cm: 5 },
    });

    render(<SemaforoSaludLote diagnostico={diag} />);

    const badge = screen.getByRole('button', { name: /salud del lote/i });
    fireEvent.click(badge);

    // Debe mostrar la ventana de diagnóstico
    expect(screen.getByText('Diagnóstico de Salud')).toBeDefined();
    expect(screen.getByText(/Semáforo Agronómico/i)).toBeDefined();
    expect(screen.getByText(/Fitosanitario:/i)).toBeDefined();
    expect(screen.getByText(/Lámina de Agua:/i)).toBeDefined();
    expect(screen.getByText(/Vigor del Cultivo:/i)).toBeDefined();
    expect(screen.getByText(/Recomendación Técnica:/i)).toBeDefined();
  });

  it('evita la propagación de eventos de clic al contenedor padre de la tarjeta', () => {
    const onClickCard = vi.fn();
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'EXCELENTE' },
      fitosanitario: { umbral_danio_porcentaje: 1 },
      hidrico: { lamina_agua_cm: 7 },
    });

    render(
      <div onClick={onClickCard}>
        <SemaforoSaludLote diagnostico={diag} />
      </div>
    );

    const badge = screen.getByRole('button', { name: /salud del lote/i });
    fireEvent.click(badge);

    // El clic en el badge no debe haber disparado el onClick del contenedor padre
    expect(onClickCard).not.toHaveBeenCalled();
  });
});
