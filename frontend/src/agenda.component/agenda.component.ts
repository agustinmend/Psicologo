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

    height: '100%', // Obliga al calendario a respetar el alto del contenedor
    expandRows: true, // Estira las filas para rellenar huecos vacíos
    dayHeaderFormat: { weekday: 'long', day: 'numeric' }, // Formato: "lunes 16"

    events: [] // Se limpia el eventContent, Angular se encarga en el HTML
  };

  async ngOnInit() {
    // Primera carga al abrir la página
    await this.cargarCitas();
  }

  async procesarNuevaCita(datosCita: any) {
    try {
      // 1. Intenta guardar en Base de Datos (incluye la validación de solapamiento)
      await this.citasSvc.crearCita(datosCita);
      
      // 2. Solo si no hubo errores, cerramos el modal
      this.mostrarModal = false; 
      
      // 3. Refrescar el estado del calendario
      await this.cargarCitas();
      
    } catch (error: any) {
      // 4. Feedback directo al usuario.
      // Aquí el alert mostrará "El horario seleccionado se cruza con una cita ya existente."
      alert(error.message); 
    }
  }
  async cargarCitas() {
    try {
      // Llamamos al backend real, no al mock
      const eventosBD = await this.citasSvc.getCitas();
      
      // Actualizamos la propiedad events. Angular detectará el cambio y repintará FullCalendar.
      this.calendarOptions.events = eventosBD;
    } catch (error) {
      console.error('Fallo al cargar la agenda de Supabase', error);
    }
  }

}