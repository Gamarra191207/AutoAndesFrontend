import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const ORDENES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orden-list/orden-list.component').then(m => m.OrdenListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/orden-form/orden-form.component').then(m => m.OrdenFormComponent),
    canActivate: [permisoGuard],
    data: { permiso: 'ORDEN_REGISTRAR' }
  }
];
