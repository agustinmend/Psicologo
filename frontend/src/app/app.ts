import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgendaComponent } from '../agenda.component/agenda.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AgendaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
}
