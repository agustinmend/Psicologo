import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService, CitaData } from '../../../services/appoinment.services';
import esLocale from '@fullcalendar/core/locales/es'

interface CitaResponse {
  id : string
  titulo : string
  fecha : string
  hora_inicio : string
  hora_fin : string
  descripcion : string
  estado : string
  paciente : {
    nombre : string
    telefono : string | null
  }
}
@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.css']
})
export class AgendaComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  isModalOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  formData: CitaData = {
    nombrePaciente: '',
    telefonoPaciente: '',
    fechaInicio: '',
    fechaFin: '',
    motivoConsulta: ''
  };

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    selectable: true,
    select: this.handleDateSelect.bind(this),
    events: [],
    locales: [esLocale],
    locale: 'es' // Calendario en español
  });

  ngOnInit() {
    this.cargarCitas();
  }

  async cargarCitas() {
    try {
      const citas = await this.appointmentService.getAppointments();
      const eventos: EventInput[] = citas.map(cita => ({
        id: cita.id,
        title: `${(cita.pacientes as any)?.nombre_completo || 'Paciente'} - ${(cita.pacientes as any)?.telefono || ''}`,
        start: cita.fecha_inicio,
        end: cita.fecha_fin,
        backgroundColor: cita.estado === 'pendiente' ? '#f39c12' : '#27ae60' // Colores según estado
      }));
      
      this.calendarOptions.update(options => ({ ...options, events: eventos }));
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    this.formData = {
      nombrePaciente: '',
      telefonoPaciente: '',
      fechaInicio: selectInfo.startStr,
      fechaFin: selectInfo.endStr,
      motivoConsulta: ''
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async saveAppointment() {
    if (!this.formData.nombrePaciente || !this.formData.telefonoPaciente) {
      alert('El nombre y el teléfono son obligatorios.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.appointmentService.agendarCita(this.formData);
      this.closeModal();
      await this.cargarCitas();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un problema al guardar la cita.');
    } finally {
      this.isLoading.set(false);
    }
  }
}