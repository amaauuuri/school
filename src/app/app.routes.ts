import { Routes } from '@angular/router';

import { Productos } from './pages/productos/productos';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [

  {
    path: '',
    component: Productos
  },

  {
    path: 'admin',
    component: Admin
  }

];