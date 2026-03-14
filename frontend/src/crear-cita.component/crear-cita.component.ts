import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-cita.component.html',
  styleUrl: './crear-cita.component.css'
})
export class CrearCitaComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  citaForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    nombrePaciente: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required),
    horaInicio: new FormControl('', Validators.required),
    horaFin: new FormControl('', Validators.required),
    descripcion: new FormControl('')
  });

  onGuardar() {
    if (this.citaForm.valid) {
      this.guardar.emit(this.citaForm.value);
    } else {
      this.citaForm.markAllAsTouched();
    }
  }

  onCancelar() {
    this.cerrar.emit();
  }
}