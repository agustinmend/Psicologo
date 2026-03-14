import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CitasService } from '../services/citas.services';
import { CrearCitaComponent } from '../crear-cita.component/crear-cita.component';
@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, CrearCitaComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  private citasSvc = inject(CitasService);
  mostrarModal : boolean= false
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'timeGridWeek'
    },
    buttonText: { today: 'Hoy', week: 'Semana' },
    slotMinTime: '14:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    height: '100%',
    expandRows: true,
    dayHeaderFormat: { weekday: 'long', day: 'numeric' },

    events: []
  };

  async ngOnInit() {
    await this.cargarCitas();
  }

  async procesarNuevaCita(datosCita: any) {
    try {
      await this.citasSvc.crearCita(datosCita);
      this.mostrarModal = false; 
      await this.cargarCitas();
      
    } catch (error: any) {
      alert(error.message); 
    }
  }
  async cargarCitas() {
    try {
      const eventosBD = await this.citasSvc.getCitas();
      this.calendarOptions.events = eventosBD;
    } catch (error) {
      console.error('Fallo al cargar la agenda de Supabase', error);
    }
  }

}