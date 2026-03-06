import { Routes } from '@angular/router';
import { AgendaComponent } from './features/agenda/agenda';

export const routes: Routes = [
  { path: '', component: AgendaComponent },
  { path: '**', redirectTo: '' }
];