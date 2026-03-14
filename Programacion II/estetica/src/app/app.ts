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

  guardar(){
    if (!this.servicioActual.nombrePerro || !this.servicioActual.tipoServicio || this.servicioActual.precio <= 0) {
      alert("Por favor, llena todos los campos correctamente.");
      return;
    }
    this.servicioActual.id = Date.now();
    this.esteticaService.agregarServicio({...this.servicioActual});
    this.verTodo(); 
    this.servicioActual = { id: 0, nombrePerro: '', tipoServicio: '', precio: 0 };
  }

  eliminar(id: number) {
    this.esteticaService.eliminarServicio(id);
    this.verTodo(); 
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