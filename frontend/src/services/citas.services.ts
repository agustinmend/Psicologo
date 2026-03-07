import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private supabase: SupabaseClient;
  constructor() {
    const supabaseUrl = 'https://ubscjoigadsctakxigvv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic2Nqb2lnYWRzY3Rha3hpZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDIxNTUsImV4cCI6MjA4ODM3ODE1NX0.LjC-PU1vfR0jsnbU9QO3xA00QqldqykSpSIhs3hQCgo';
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Evita el error NavigatorLockAcquireTimeoutError
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  async crearCita(datosFormulario: any) {
    // 1. VALIDACIÓN ESTRÍCTA: Algoritmo de solapamiento en BD
    const { data: choques, error: errorCheck } = await this.supabase
      .from('citas')
      .select('id')
      .eq('psicologo_id', 1)
      .eq('fecha', datosFormulario.fecha)
      // Un solapamiento ocurre si: (InicioExistente < FinNuevo) AND (FinExistente > InicioNuevo)
      .lt('hora_inicio', datosFormulario.horaFin)
      .gt('hora_fin', datosFormulario.horaInicio);

    if (errorCheck) {
      console.error('Error al verificar disponibilidad:', errorCheck.message);
      throw new Error('Fallo al comunicarse con la base de datos.');
    }

    // Si el arreglo 'choques' tiene al menos 1 elemento, el horario está ocupado.
    if (choques && choques.length > 0) {
      throw new Error('El horario seleccionado se cruza con una cita ya existente.');
    }

    // 2. Mapeo estricto del Frontend a la Base de Datos (Si la validación pasa)
    const payload = {
      psicologo_id: 1, 
      titulo: datosFormulario.titulo,
      nombre_paciente: datosFormulario.nombrePaciente,
      fecha: datosFormulario.fecha,
      hora_inicio: datosFormulario.horaInicio,
      hora_fin: datosFormulario.horaFin,
      descripcion: datosFormulario.descripcion || null,
      estado: 'programada'
    };

    // 3. Inserción en Supabase
    const { data, error } = await this.supabase
      .from('citas')
      .insert([payload])
      .select(); 

    if (error) {
      throw new Error(error.message); 
    }

    return data;
  }
  // Devuelve datos estáticos simulando una petición a BD
  async getCitasMock() {
    // Simulamos un leve retraso de red (opcional, pero realista)
    await new Promise(resolve => setTimeout(resolve, 300));

    const hoy = new Date();
    
    return [
      {
        id: '1',
        title: 'Carlos Mendoza - Ansiedad',
        start: new Date(hoy.setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(hoy.setHours(11, 0, 0, 0)).toISOString(),
        backgroundColor: '#3b82f6', // Azul estándar para citas confirmadas
        borderColor: '#2563eb'
      },
      {
        id: '2',
        title: 'María López - Terapia de Pareja',
        start: new Date(hoy.setHours(14, 30, 0, 0)).toISOString(),
        end: new Date(hoy.setHours(15, 30, 0, 0)).toISOString(),
        backgroundColor: '#10b981', // Verde para un estado diferente (ej. primera sesión)
        borderColor: '#059669'
      }
    ];
  }

// Método de lectura real
  async getCitas() {
    // 1. Consulta a Supabase (Filtramos por el psicólogo 1 como definiste en tu MVP)
    const { data, error } = await this.supabase
      .from('citas')
      .select('*')
      .eq('psicologo_id', 1);

    if (error) {
      console.error('Error obteniendo citas de Supabase:', error.message);
      throw new Error(error.message);
    }

    // 2. Patrón Adapter: Transformar esquema de BD a interfaz de FullCalendar
    return data.map((cita: any) => {
      return {
        id: cita.id.toString(),
        // Concatenamos paciente y título para que se vea bien en tu tarjeta
        title: `${cita.nombre_paciente} - ${cita.titulo}`, 
        
        // Formato estricto ISO 8601: "YYYY-MM-DDTHH:mm:ss"
        start: `${cita.fecha}T${cita.hora_inicio}`, 
        end: `${cita.fecha}T${cita.hora_fin}`,
        
        // Pasamos datos extra a la propiedad extendedProps para tu HTML
        extendedProps: {
          descripcion: cita.descripcion,
          estado: cita.estado,
          // Por ahora forzamos 'azul' para que tu clase de CSS funcione. 
          // Luego podrías hacer una lógica (ej. si es primera sesión = verde).
          colorType: 'azul' 
        }
      };
    });
  }
  
}