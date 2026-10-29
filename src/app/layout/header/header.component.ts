import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header no-imprimir">
      <div class="logo-area">
        <span class="icono">🚗</span>
        <span class="titulo">AutoAndes Web</span>
      </div>

      <div class="user-area">
        <div class="usuario-info">
          <span class="nombre">{{ authService.usuario() }}</span>
          <span class="rol">{{ rolesFormateados() }}</span>
        </div>

        @if (authService.segundosRestantes() > 0) {
          <div class="tiempo-sesion" [class.por-vencer]="authService.segundosRestantes() <= 120">
            ⏱️ {{ tiempoFormateado() }}
          </div>
        }

        <button class="btn btn-logout" (click)="authService.cerrarSesion()" title="Cerrar sesión">
          Salir 🚪
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background: #0f2e5c;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo-area { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; }
    .user-area { display: flex; align-items: center; gap: 18px; }
    .usuario-info { display: flex; flex-direction: column; align-items: flex-end; }
    .nombre { font-size: 14px; font-weight: 600; }
    .rol { font-size: 12px; color: #93c5fd; }
    .tiempo-sesion {
      font-size: 13px;
      padding: 4px 10px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px;
      font-weight: 600;
    }
    .tiempo-sesion.por-vencer {
      background: #b42318;
      color: #fff;
      animation: pulse 1s infinite alternate;
    }
    .btn-logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.4);
      color: #fff;
      font-size: 13px;
      padding: 6px 12px;
    }
    .btn-logout:hover { background: rgba(255,255,255,0.15); }
    @keyframes pulse {
      from { opacity: 0.8; }
      to { opacity: 1; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  rolesFormateados(): string {
    const roles = this.authService.roles();
    return roles.map(r => r.replace('ROLE_', '')).join(', ');
  }

  tiempoFormateado(): string {
    const totalSegundos = this.authService.segundosRestantes();
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }
}
