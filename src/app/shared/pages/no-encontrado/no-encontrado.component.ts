import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align: center; padding: 60px 20px;">
      <h1 style="font-size: 72px; color: #0f2e5c; margin: 0;">404</h1>
      <h2 style="color: #334155; margin: 10px 0 20px;">Página no encontrada</h2>
      <p style="color: #64748b; max-width: 500px; margin: 0 auto 30px; font-size: 16px;">
        La ruta a la que intentas acceder no existe o fue movida.
      </p>
      <a routerLink="/servicios" class="btn btn-primary" style="padding: 10px 24px; font-size: 15px;">
        Ir al panel principal
      </a>
    </div>
  `
})
export class NoEncontradoComponent {}
