import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CitasService } from '../services/citas.services';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  private citasSvc = inject(CitasService);

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
    events: [] // Se limpia el eventContent, Angular se encarga en el HTML
  };

  async ngOnInit() {
    this.calendarOptions.events = await this.citasSvc.getCitasMock();
  }
}