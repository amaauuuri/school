import { Injectable } from '@angular/core';
import { Servicio } from './servicio.model';

@Injectable({
  providedIn: 'root',
})
export class EsteticaService {
  private servicios: Servicio[] = [];

  constructor(){}

  obtenerServicios(): Servicio[] {
    return this.servicios;
  }

  agregarServicio(nuevoServicio: Servicio){
    this.servicios.push(nuevoServicio);
  }

  eliminarServicio(id: number) {
    this.servicios = this.servicios.filter(s => s.id !== id);
  }
}