import { guardarCita, verificarSolapamiento, eliminarCita } from './cita-servicio.js';
import { supabase } from '../api/supabase.js';

jest.mock('../api/supabase.js', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis()
    }
}));

describe('Servicio de Citas - Pruebas Unitarias', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('HU-02: Debe rechazar la creación de cita si faltan datos obligatorios', async () => {
        await expect(
            guardarCita(1, '2026-05-25', '16:00', '17:00', null, '') 
        ).rejects.toThrow('Faltan datos obligatorios');
    });

    test('HU-02: Debe rechazar la creación de cita si la hora de inicio es igual o posterior a la de fin', async () => {
        await expect(
            guardarCita(1, '2026-05-25', '16:00', '15:00', 'Juan Perez', 'Consulta')
        ).rejects.toThrow('Hora invalida');
    });

    test('HU-02: Debe detectar solapamiento si el rango horario choca con citas existentes', async () => {
        supabase.eq.mockResolvedValueOnce({
            data: [{ hora_inicio: '15:00', hora_fin: '17:00' }],
            error: null
        });
        const ocupado = await verificarSolapamiento('2026-05-25', '16:00', '18:00');
        expect(ocupado).toBe(true);
    });

    test('HU-03: Debe invocar la eliminación de la cita en la tabla correcta', async () => {
        supabase.eq.mockResolvedValueOnce({ error: null });
        const result = await eliminarCita(99);
        expect(supabase.from).toHaveBeenCalledWith('citas');
        expect(supabase.delete).toHaveBeenCalled();
        expect(result.error).toBeNull();
    });
});