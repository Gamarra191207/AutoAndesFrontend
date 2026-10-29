import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { invitadoGuard } from './core/guards/invitado-guard';
import { permisoGuard } from './core/guards/permiso-guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AccesoDenegadoComponent } from './shared/pages/acceso-denegado/acceso-denegado.component';
import { NoEncontradoComponent } from './shared/pages/no-encontrado/no-encontrado.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [invitadoGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'servicios'
      },
      {
        path: 'servicios',
        loadChildren: () => import('./features/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES),
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_LEER' }
      },
      {
        path: 'vehiculos',
        loadChildren: () => import('./features/vehiculos/vehiculos.routes').then(m => m.VEHICULOS_ROUTES),
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_LEER' }
      },
      {
        path: 'ordenes',
        loadChildren: () => import('./features/ordenes/ordenes.routes').then(m => m.ORDENES_ROUTES),
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_LEER' }
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        canActivate: [permisoGuard],
        data: { permiso: 'REPORTE_VER' }
      }
    ]
  },
  {
    path: 'acceso-denegado',
    component: AccesoDenegadoComponent
  },
  {
    path: '**',
    component: NoEncontradoComponent
  }
];
