import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-header />
      <div class="layout-body">
        <app-sidebar />
        <main class="main-content">
          @if (ui.mensajeAlerta()) {
            <div class="alerta">
              ⚠️ {{ ui.mensajeAlerta() }}
            </div>
          }

          @if (ui.mensajeExito()) {
            <div class="alerta-exito">
              ✅ {{ ui.mensajeExito() }}
            </div>
          }

          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .layout-body { display: flex; flex: 1; }
    .main-content {
      flex: 1;
      padding: 28px 32px;
      overflow-y: auto;
      background: #f8fafc;
    }
    @media print {
      .main-content { padding: 0; background: #fff; }
    }
  `]
})
export class MainLayoutComponent {
  ui = inject(UiService);
}
