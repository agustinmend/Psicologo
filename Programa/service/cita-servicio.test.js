jest.mock('../config/supabase.js', () => ({
    supabase: {} 
}), { virtual: true });

import { buscarCitasPorNombre, verificarSolapamientoMemoria } from './cita-servicio.js';
describe('HU-05: Búsqueda de turnos', () => {
    const mockCitasMemoria = [
        { id: 1, nombre_paciente: 'Carlos Mendoza' },
        { id: 2, nombre_paciente: 'Ana Torres' },
        { id: 3, nombre_paciente: 'Carlos Villagran' }
    ];

    test('BuscarCitasPorNombre_CoincidenciaParcial_RetornaListaFiltrada', () => {
        const resultados = buscarCitasPorNombre(mockCitasMemoria, 'carlos');        
        expect(resultados.length).toBe(2);
        expect(resultados[0].nombre_paciente).toBe('Carlos Mendoza');
        expect(resultados[1].nombre_paciente).toBe('Carlos Villagran');
    });
});

describe('HU-02: Validación de solapamiento de turnos', () => {
    const mockCitasMemoria = [
        { fecha: '2026-06-20', hora_inicio: '15:00', hora_fin: '16:00' }
    ];
    test('VerificarSolapamientoMemoria_HorarioChocaConExistente_RetornaTrue', () => {
        const ocupado = verificarSolapamientoMemoria(mockCitasMemoria, '2026-06-20', '15:30', '16:30');  
        expect(ocupado).toBe(true);
    });

    test('VerificarSolapamientoMemoria_HorarioLibre_RetornaFalse', () => {
        const ocupado = verificarSolapamientoMemoria(mockCitasMemoria, '2026-06-20', '16:00', '17:00');
        expect(ocupado).toBe(false);
    });
});