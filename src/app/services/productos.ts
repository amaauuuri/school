import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from '@angular/fire/firestore';

import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  firestore = inject(Firestore);

  productos: Producto[] = [];

  constructor(){

    const productosRef = collection(this.firestore, 'productos');

    onSnapshot(productosRef, (snapshot) => {

      this.productos = snapshot.docs.map(doc => ({

        id: doc.id,
        ...doc.data()

      })) as Producto[];

    });

  }

  agregarProducto(producto: Producto){

    const productosRef = collection(this.firestore, 'productos');

    return addDoc(productosRef, producto);

  }

  eliminarProducto(id: string){

    const productoDoc = doc(this.firestore, `productos/${id}`);

    return deleteDoc(productoDoc);

  }

}