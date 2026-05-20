import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductosService } from '../../services/productos';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})

export class Admin {

  nombre = '';
  precio = 0;
  stock = 0;

  constructor(public productosService: ProductosService){}

  async agregarProducto(){

    const nuevoProducto = {

      nombre: this.nombre,
      precio: this.precio,
      stock: this.stock

    };

    await this.productosService.agregarProducto(nuevoProducto);

    this.nombre = '';
    this.precio = 0;
    this.stock = 0;

  }

}