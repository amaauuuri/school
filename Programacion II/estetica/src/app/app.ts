import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { EsteticaService } from './estetica';   
import { Servicio } from './servicio.model';    

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  listaServicios: Servicio[] = [];
  servicioActual: Servicio = { id: 0, nombrePerro: '', tipoServicio: '', precio: 0 };

  constructor(private esteticaService: EsteticaService){
    this.verTodo(); 
  }

 guardar() {
  if (!this.servicioActual.nombrePerro || !this.servicioActual.tipoServicio || this.servicioActual.precio <= 0) {
    Swal.fire({
      icon: 'error',
      title: '¡Faltan datos!',
      text: 'Por favor, llena el nombre, servicio y un precio mayor a 0.',
      confirmButtonColor: '#3498db'
    });
    return;
  }

  this.servicioActual.id = Date.now();
  this.esteticaService.agregarServicio({ ...this.servicioActual });
  this.verTodo();

 
  Swal.fire({
    icon: 'success',
    title: '¡Perrito registrado!',
    showConfirmButton: false,
    timer: 1500
  });

  this.servicioActual = { id: 0, nombrePerro: '', tipoServicio: '', precio: 0 };
}

eliminar(id: number) {
  Swal.fire({
    title: '¿Eliminar registro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {

    if (result.isConfirmed) {
      this.esteticaService.eliminarServicio(id);
      this.verTodo();
      
      Swal.fire(
        '¡Borrado!',
        'El servicio ha sido eliminado correctamente.',
        'success'
      );
    }
  });
}
  obtenerTotal(): number {
    return this.listaServicios.reduce((acc, obj) => acc + Number(obj.precio), 0);
  }

  filtrarCaros() {
    this.listaServicios = this.esteticaService.obtenerServicios().filter(s => s.precio > 200);
  }

  verTodo() {
    this.listaServicios = this.esteticaService.obtenerServicios();
  }
}