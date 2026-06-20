import { supabase } from "../config/supabase.js";
export async function obtenerCitas() {
    const {data, error} = await supabase.from('citas').select('*')
    if(error) {
        console.error('Error al cargar citas: ', error)
        return []
    }
    return  data
}
export async function verificarSolapamiento(fecha, horaInicio, horaFin) {
    const {data, error} = await supabase.from('citas').select('hora_inicio, hora_fin').eq('fecha', fecha)
    if(error) {
        console.error('Error validando disponibilidad: ', error)
        return true
    }
    return data.some(cita =>
        horaInicio < cita.hora_fin && horaFin > cita.hora_inicio
    )
}
export async function guardarCita(psicologoId, fecha, horaInicio, horaFin, nombrePaciente, descripcion) {
    if(!psicologoId || !fecha || !horaInicio || !horaFin || !nombrePaciente) {
        throw new Error('Faltan datos obligatorios')
    }
    if(horaInicio >= horaFin) {
        throw new Error ('Hora invalida')
    }
    const nuevaCita = {
        psicologo_id: psicologoId,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        fecha,
        nombre_paciente: nombrePaciente,
        titulo: `Cita con ${nombrePaciente}`,
        estado: 'programado',
        descripcion: descripcion
    }
    const {data, error} = await supabase.from('citas').insert([nuevaCita]).select()
    return {data, error}
}

export async function eliminarCita(id) {
    const {error} = await supabase.from('citas').delete().eq('id', id)
    return {error}
}

export async function actualizarCita(id, datos) {
    const {error} = await supabase.from('citas').update(datos).eq('id', id)
    return {error}
}

export function buscarCitasPorNombre(citas, textoBusqueda) {
    if (!citas || !Array.isArray(citas)) return [];
    if (!textoBusqueda || textoBusqueda.trim() === '') return citas;
    const textoLimpio = textoBusqueda.trim().toLowerCase();
    return citas.filter(cita => 
        cita.nombre_paciente.toLowerCase().includes(textoLimpio)
    );
}

export function verificarSolapamientoMemoria(citas, fecha, horaInicio, horaFin) {
    if (!citas || !Array.isArray(citas)) return false;
    return citas.some(cita =>
        cita.fecha === fecha &&
        horaInicio < cita.hora_fin &&
        horaFin > cita.hora_inicio
    );
}