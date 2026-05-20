import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ProductosService } from '../../services/productos';

@Component({
  selector: 'app-productos',
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})

export class Productos {

  constructor(public productosService: ProductosService){}

  eliminarProducto(id:string){

    this.productosService.eliminarProducto(id);

  }

}