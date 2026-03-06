import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  
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
}