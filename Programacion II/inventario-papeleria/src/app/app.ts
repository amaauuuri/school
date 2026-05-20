import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventarioService } from './inventario.service';
import { Producto } from './producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html', 
  styleUrl: './app.css' 
})  
export class AppComponent {
  productos: Producto[] = [];
  nuevoProd: Producto = { id: 0, nombre: '', stockPiezas: 0, piezasPorCaja: 12 };

  constructor(private service: InventarioService) {
    this.productos = this.service.obtenerInventario();
  }

  registrar() {
    if (!this.nuevoProd.nombre || this.nuevoProd.piezasPorCaja <= 0) {
      Swal.fire('Error', 'Datos inválidos', 'error');
      return;
    }
    this.nuevoProd.id = Date.now();
    this.service.agregarProducto({ ...this.nuevoProd });
    Swal.fire('¡Éxito!', 'Producto registrado', 'success');
    this.nuevoProd = { id: 0, nombre: '', stockPiezas: 0, piezasPorCaja: 12 };
  }

  getCajas(p: Producto) { return Math.floor(p.stockPiezas / p.piezasPorCaja); }
  getSueltas(p: Producto) { return p.stockPiezas % p.piezasPorCaja; }

  ajustar(id: number, piezasPorCaja: number, esCaja: boolean, suma: boolean) {
    const cantidad = esCaja ? piezasPorCaja : 1;
    this.service.actualizarStock(id, suma ? cantidad : -cantidad);
  }

  borrar(id: number) {
    this.service.eliminar(id);
    this.productos = this.service.obtenerInventario();
  }
}