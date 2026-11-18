import { describe, it, expect } from 'vitest';
import { calcularSaludLote, ESTADOS_SALUD } from './saludLoteService';

describe('HU-036: Servicio de Cálculo de Salud del Lote (Semáforo Agronómico)', () => {
  // =========================================================================
  // ESCENARIO 1: LOTE EN ESTADO CRÍTICO (ROJO)
  // =========================================================================
  describe('Escenario 1: Lote en estado crítico (Rojo)', () => {
    it('debe clasificar como CRÍTICO cuando el daño fitosanitario supera el 15%', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'BUENO' },
        fitosanitario: { umbral_danio_porcentaje: 18.5, tipo_problema: 'PLAGA', nombre_comun: 'Sogata' },
        hidrico: { lamina_agua_cm: 6.0 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.CRITICO);
      expect(resultado.label).toBe('Crítico');
      expect(resultado.barClass).toBe('bg-red-500');
      expect(resultado.alertas.length).toBeGreaterThan(0);
      expect(resultado.recomendacion).toMatch(/acción correctiva inmediata/i);
      expect(resultado.detalles.fitosanitario.estado).toBe('CRITICO');
    });

    it('debe clasificar como CRÍTICO cuando la lámina de agua es menor a 2 cm (déficit hídrico)', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'BUENO' },
        fitosanitario: { umbral_danio_porcentaje: 2.0 },
        hidrico: { lamina_agua_cm: 1.2 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.CRITICO);
      expect(resultado.detalles.hidrico.estado).toBe('CRITICO');
      expect(resultado.recomendacion).toMatch(/estrés hídrico|déficit/i);
    });

    it('debe clasificar como CRÍTICO cuando el vigor fenológico es "MALO"', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'MALO' },
        fitosanitario: { umbral_danio_porcentaje: 1.0 },
        hidrico: { lamina_agua_cm: 5.0 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.CRITICO);
      expect(resultado.detalles.fenologia.estado).toBe('CRITICO');
    });

    it('debe manejar arreglo de monitoreos y detectar el mayor porcentaje de daño si alguno supera 15%', () => {
      const monitoreos = [
        { umbral_danio_porcentaje: 3.0, nombre_comun: 'Maleza gramínea' },
        { umbral_danio_porcentaje: 22.0, nombre_comun: 'Piricularia' },
        { umbral_danio_porcentaje: 8.0, nombre_comun: 'Spodoptera' },
      ];

      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'EXCELENTE' },
        fitosanitario: monitoreos,
        hidrico: { lamina_agua_cm: 7.0 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.CRITICO);
      expect(resultado.detalles.fitosanitario.valor).toBe('22%');
    });
  });

  // =========================================================================
  // ESCENARIO 2: LOTE EN ATENCIÓN PREVENTIVA (AMARILLO)
  // =========================================================================
  describe('Escenario 2: Lote en atención preventiva (Amarillo)', () => {
    it('debe clasificar como PRECAUCIÓN cuando el daño fitosanitario está entre 5% y 15%', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'BUENO' },
        fitosanitario: { umbral_danio_porcentaje: 9.5, nombre_comun: 'Gusano cogollero' },
        hidrico: { lamina_agua_cm: 5.5 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.PRECAUCION);
      expect(resultado.label).toBe('Precaución');
      expect(resultado.barClass).toBe('bg-amber-500');
      expect(resultado.advertencias.length).toBeGreaterThan(0);
      expect(resultado.recomendacion).toMatch(/48 horas/i);
    });

    it('debe clasificar como PRECAUCIÓN cuando la lámina de agua está entre 2 y 3.5 cm', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'BUENO' },
        fitosanitario: { umbral_danio_porcentaje: 1.0 },
        hidrico: { lamina_agua_cm: 2.8 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.PRECAUCION);
      expect(resultado.detalles.hidrico.estado).toBe('PRECAUCION');
      expect(resultado.recomendacion).toMatch(/48 horas/i);
    });

    it('debe clasificar como PRECAUCIÓN cuando el vigor fenológico es "REGULAR"', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'REGULAR' },
        fitosanitario: { umbral_danio_porcentaje: 2.0 },
        hidrico: { lamina_agua_cm: 6.0 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.PRECAUCION);
      expect(resultado.detalles.fenologia.estado).toBe('PRECAUCION');
    });
  });

  // =========================================================================
  // ESCENARIO 3: LOTE EN ESTADO ÓPTIMO (VERDE)
  // =========================================================================
  describe('Escenario 3: Lote en estado óptimo (Verde)', () => {
    it('debe clasificar como ÓPTIMO cuando afección < 5%, lámina 4-10 cm y vigor BUENO o EXCELENTE', () => {
      const resultado = calcularSaludLote({
        fenologia: { estado_general: 'EXCELENTE' },
        fitosanitario: { umbral_danio_porcentaje: 1.5 },
        hidrico: { lamina_agua_cm: 6.0 },
      });

      expect(resultado.estado).toBe(ESTADOS_SALUD.OPTIMO);
      expect(resultado.label).toBe('Óptimo');
      expect(resultado.barClass).toBe('bg-emerald-500');
      expect(resultado.score).toBeGreaterThanOrEqual(85);
      expect(resultado.alertas).toHaveLength(0);
      expect(resultado.advertencias).toHaveLength(0);
      expect(resultado.recomendacion).toMatch(/óptimo|normal/i);
    });
  });

  // =========================================================================
  // ESCENARIO EDGE CASES: SIN DATOS O PARÁMETROS NULOS
  // =========================================================================
  describe('Casos especiales y tolerancia a fallos', () => {
    it('debe retornar SIN_DATOS cuando todos los parámetros son nulos o vacíos', () => {
      const resultado = calcularSaludLote({});
      expect(resultado.estado).toBe(ESTADOS_SALUD.SIN_DATOS);
      expect(resultado.score).toBeNull();
      expect(resultado.label).toBe('Sin Monitoreo');
    });
  });
});
