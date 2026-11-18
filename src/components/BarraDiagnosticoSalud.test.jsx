import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarraDiagnosticoSalud from './BarraDiagnosticoSalud';
import { calcularSaludLote } from '../services/saludLoteService';

describe('HU-036 / Subtarea 3: Componente BarraDiagnosticoSalud', () => {
  it('renderiza el título, score y los 3 pilares agronómicos', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'BUENO' },
      fitosanitario: { umbral_danio_porcentaje: 3.5 },
      hidrico: { lamina_agua_cm: 6.0 },
    });

    render(<BarraDiagnosticoSalud diagnostico={diag} />);

    expect(screen.getByText('Diagnóstico Agronómico del Lote')).toBeDefined();
    expect(screen.getByText(/Sanidad Fitosanitaria/i)).toBeDefined();
    expect(screen.getByText(/Lámina y Riego/i)).toBeDefined();
    expect(screen.getByText(/Vigor del Cultivo/i)).toBeDefined();
    expect(screen.getByText('6 cm')).toBeDefined();
    expect(screen.getByText('3.5%')).toBeDefined();
  });

  it('muestra la alerta de acción correctiva urgente en estado CRÍTICO', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'MALO' },
      fitosanitario: { umbral_danio_porcentaje: 25.0, nombre_comun: 'Sogata' },
      hidrico: { lamina_agua_cm: 1.0 },
    });

    render(<BarraDiagnosticoSalud diagnostico={diag} />);

    expect(screen.getByText(/Acción correctiva urgente requerida/i)).toBeDefined();
    const criticos = screen.getAllByText(/CRITICO/i);
    expect(criticos.length).toBeGreaterThan(0);
    expect(screen.getByText(/umbral de daño económico/i)).toBeDefined();
  });

  it('muestra la recomendación de inspección técnica en 48 horas en estado PRECAUCIÓN', () => {
    const diag = calcularSaludLote({
      fenologia: { estado_general: 'REGULAR' },
      fitosanitario: { umbral_danio_porcentaje: 8.0 },
      hidrico: { lamina_agua_cm: 3.0 },
    });

    render(<BarraDiagnosticoSalud diagnostico={diag} />);

    expect(screen.getByText(/Inspección técnica recomendada en 48 horas/i)).toBeDefined();
    const precauciones = screen.getAllByText(/PRECAUCION/i);
    expect(precauciones.length).toBeGreaterThan(0);
  });
});
