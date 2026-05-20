import { Injectable } from '@angular/core';
import { Producto } from './producto.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productos: Producto[] = [
    { id: 1, nombre: 'Sacapuntas', stockPiezas: 24, piezasPorCaja: 12 },
    { id: 2, nombre: 'Hojas', stockPiezas: 10, piezasPorCaja: 5 }
  ];

  constructor() { }

  obtenerInventario() {
    return this.productos;
  }

  agregarProducto(p: Producto) {
    this.productos.push(p);
  }

  actualizarStock(id: number, cantidad: number) {
    const p = this.productos.find(prod => prod.id === id);
    if (p) {
      p.stockPiezas += cantidad;
      if (p.stockPiezas < 0) p.stockPiezas = 0;
    }
  }

  eliminar(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
  }
}