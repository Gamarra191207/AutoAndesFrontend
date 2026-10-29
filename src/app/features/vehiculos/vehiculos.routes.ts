import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/vehiculo-list/vehiculo-list.component').then(m => m.VehiculoListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/vehiculo-form/vehiculo-form.component').then(m => m.VehiculoFormComponent),
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' }
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/vehiculo-form/vehiculo-form.component').then(m => m.VehiculoFormComponent),
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' }
  }
];
