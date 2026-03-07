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
    this.calendarOptions.events = await this.citasSvc.getCitasMock();
  }
  async procesarNuevaCita(datosCita: any) {
    try {
      // Llamada asíncrona a la base de datos
      const respuesta = await this.citasSvc.crearCita(datosCita);
      console.log('Cita guardada en Supabase:', respuesta);
      
      // Solo cerramos el modal si la inserción fue exitosa
      this.mostrarModal = false; 
      
      // Aquí debes recargar los eventos del calendario para que la nueva cita aparezca.
      // Por ahora, simplemente podrías volver a llamar a tu método de obtención:
      // this.calendarOptions.events = await this.citasSvc.getCitas(); 
      
    } catch (error) {
      // Mala práctica: Tragar errores silenciosamente.
      // Aquí deberías mostrar un Toast o una alerta al usuario indicando el fallo.
      alert('Error al guardar la cita. Revisa la consola para más detalles.');
    }
  }
}