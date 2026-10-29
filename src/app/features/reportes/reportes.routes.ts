import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/reporte-ingresos/reporte-ingresos.component').then(m => m.ReporteIngresosComponent)
  }
];
