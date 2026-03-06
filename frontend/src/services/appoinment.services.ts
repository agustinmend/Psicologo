import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface CitaData {
  nombrePaciente: string;
  telefonoPaciente: string;
  fechaInicio: string;
  fechaFin: string;
  motivoConsulta: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private supabase = inject(SupabaseService).client;

  async getAppointments() {
    const { data, error } = await this.supabase
      .from('citas')
      .select('id, fecha_inicio, fecha_fin, estado, motivo_consulta, pacientes(nombre_completo, telefono)');

    if (error) throw error;
    return data;
  }

  async agendarCita(data: CitaData) {
    // 1. Obtener el ID del psicólogo (Asumimos el único para el MVP)
    const { data: psicoData, error: psicoError } = await this.supabase
      .from('psicologos')
      .select('id')
      .limit(1)
      .single();

    if (psicoError || !psicoData) throw new Error('No hay psicólogos registrados en la base de datos.');

    // 2. Buscar si el paciente ya existe por su teléfono
    let pacienteId;
    const { data: pacienteExistente } = await this.supabase
      .from('pacientes')
      .select('id')
      .eq('telefono', data.telefonoPaciente)
      .maybeSingle();

    if (pacienteExistente) {
      pacienteId = pacienteExistente.id;
    } else {
      // 3. Si no existe, lo creamos
      const { data: nuevoPaciente, error: pacienteError } = await this.supabase
        .from('pacientes')
        .insert([{ nombre_completo: data.nombrePaciente, telefono: data.telefonoPaciente }])
        .select()
        .single();

      if (pacienteError) throw pacienteError;
      pacienteId = nuevoPaciente.id;
    }

    // 4. Crear la cita usando el ID del paciente (existente o nuevo)
    const { error: citaError } = await this.supabase
      .from('citas')
      .insert([{
        psicologo_id: psicoData.id,
        paciente_id: pacienteId,
        fecha_inicio: data.fechaInicio,
        fecha_fin: data.fechaFin,
        motivo_consulta: data.motivoConsulta,
        estado: 'pendiente'
      }]);

    if (citaError) throw citaError;
  }
}