import { supabase } from "../config/supabase.js";
export async function obtenerCitas() {
    const {data, error} = await supabase.from('citas').select('*');
    if(error) {
        console.error('Error al cargar citas: ', error);
        return [];
    }
    return data;
}

export async function verificarSolapamiento(fecha, horaInicio, horaFin) {
    const {data, error} = await supabase.from('citas').select('hora_inicio, hora_fin, fecha').eq('fecha', fecha);
    if(error) {
        console.error('Error validando disponibilidad: ', error);
        return true;
    }
    return verificarSolapamientoMemoria(data, fecha, horaInicio, horaFin);
}

export async function guardarCita(psicologoId, fecha, horaInicio, horaFin, nombrePaciente, descripcion) {
    validarDatosCita(fecha, horaInicio, horaFin, nombrePaciente);

    const nuevaCita = {
        psicologo_id: psicologoId,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        fecha,
        nombre_paciente: nombrePaciente,
        titulo: `Cita con ${nombrePaciente}`,
        estado: 'programado',
        descripcion: descripcion || ''
    };
    
    const {data, error} = await supabase.from('citas').insert([nuevaCita]).select();
    return {data, error};
}

export async function eliminarCita(id) {
    const {error} = await supabase.from('citas').delete().eq('id', id);
    return {error};
}

export async function actualizarCita(id, datos) {
    const {error} = await supabase.from('citas').update(datos).eq('id', id);
    return {error};
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

const esNombreInvalido = (nombre) => !nombre || typeof nombre !== 'string' || nombre.trim() === '';
const esHorarioInvalido = (inicio, fin) => inicio >= fin;

export function validarDatosCita(fecha, horaInicio, horaFin, nombrePaciente) {
    if (esNombreInvalido(nombrePaciente)) {
        throw new Error('El nombre del paciente es obligatorio.');
    }
    
    if (esHorarioInvalido(horaInicio, horaFin)) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin.');
    }
    
    return true;
}