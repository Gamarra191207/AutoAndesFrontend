import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/servicio-list/servicio-list.component').then(m => m.ServicioListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/servicio-form/servicio-form.component').then(m => m.ServicioFormComponent),
    canActivate: [permisoGuard],
    data: { permiso: 'SERVICIO_ESCRIBIR' }
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/servicio-form/servicio-form.component').then(m => m.ServicioFormComponent),
    canActivate: [permisoGuard],
    data: { permiso: 'SERVICIO_ESCRIBIR' }
  }
];
