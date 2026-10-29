import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align: center; padding: 60px 20px;">
      <h1 style="font-size: 72px; color: #b42318; margin: 0;">403</h1>
      <h2 style="color: #0f2e5c; margin: 10px 0 20px;">Acceso denegado</h2>
      <p style="color: #64748b; max-width: 500px; margin: 0 auto 30px; font-size: 16px;">
        No cuenta con los permisos necesarios para acceder al recurso o funcionalidad solicitada.
      </p>
      <a routerLink="/servicios" class="btn btn-primary" style="padding: 10px 24px; font-size: 15px;">
        Volver al inicio
      </a>
    </div>
  `
})
export class AccesoDenegadoComponent {}
