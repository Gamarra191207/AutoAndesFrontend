import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { MENU_ITEMS } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar no-imprimir">
      <nav class="nav-menu">
        @for (item of menuFiltrado(); track item.ruta) {
          <a
            [routerLink]="item.ruta"
            routerLinkActive="activo"
            class="nav-item"
          >
            <span class="icono">{{ item.icono }}</span>
            <span class="etiqueta">{{ item.etiqueta }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      min-height: calc(100vh - 64px);
      padding: 20px 0;
    }
    .nav-menu { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: #475569;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }
    .nav-item:hover { background: #f1f5f9; color: #0f2e5c; }
    .nav-item.activo {
      background: #eff6ff;
      color: #0f2e5c;
      font-weight: 600;
      border-left: 4px solid #0f2e5c;
    }
    .icono { font-size: 18px; }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  // Signal computado: se recalcula reactivamente al cambiar de usuario o permisos
  menuFiltrado = computed(() => {
    return MENU_ITEMS.filter(item => {
      if (!item.permiso) return true;
      return this.authService.tienePermiso(item.permiso);
    });
  });
}
