jest.mock('../config/supabase.js', () => ({
    supabase: {} 
}), { virtual: true });

import { buscarCitasPorNombre } from './cita-servicio.js';
//bue
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