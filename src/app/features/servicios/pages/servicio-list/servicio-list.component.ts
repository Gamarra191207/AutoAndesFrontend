import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../../../core/services/servicio-service';
import { Servicio } from '../../../../core/models/servicio.model';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-servicio-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, SiPermisoDirective],
  template: `
    <div class="page-header">
      <div>
        <h2>Catálogo de Servicios</h2>
        <p style="color: #64748b; margin: 4px 0 0;">Gestión de servicios ofrecidos por el taller mecánico AutoAndes</p>
      </div>
      <div>
        <a *appSiPermiso="'SERVICIO_ESCRIBIR'" routerLink="/servicios/nuevo" class="btn btn-primary">
          + Nuevo Servicio
        </a>
      </div>
    </div>

    @if (mensajeExito()) {
      <div class="alerta-exito">{{ mensajeExito() }}</div>
    }
    @if (error()) {
      <div class="alerta">{{ error() }}</div>
    }

    <div class="card" style="padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px;">
          <input
            type="text"
            class="input"
            placeholder="Buscar por código o nombre..."
            [ngModel]="busqueda()"
            (ngModelChange)="busqueda.set($event)"
          />
        </div>
        <div style="width: 200px;">
          <select
            class="select"
            [ngModel]="filtroEstado()"
            (ngModelChange)="filtroEstado.set($event)"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVOS">Solo Activos</option>
            <option value="INACTIVOS">Solo Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    @if (cargando()) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        Cargando servicios...
      </div>
    } @else if (serviciosFiltrados().length === 0) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        No se encontraron servicios registrados con los filtros aplicados.
      </div>
    } @else {
      <div class="tabla-container card" style="padding: 0;">
        <table class="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre del Servicio</th>
              <th style="text-align: right;">Precio Base</th>
              <th style="text-align: center;">Duración</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (s of serviciosFiltrados(); track s.id) {
              <tr>
                <td><strong>{{ s.codigo }}</strong></td>
                <td>{{ s.nombre }}</td>
                <td style="text-align: right; font-weight: 600;">{{ s.precio | currency:'PEN':'symbol':'1.2-2' }}</td>
                <td style="text-align: center;">{{ s.duracionMin }} min</td>
                <td style="text-align: center;">
                  <span class="badge" [class.inactivo]="!s.activo">
                    {{ s.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right; white-space: nowrap;">
                  <a
                    *appSiPermiso="'SERVICIO_ESCRIBIR'"
                    [routerLink]="['/servicios', s.id, 'editar']"
                    class="btn btn-secundario"
                    style="padding: 4px 8px; font-size: 13px; margin-right: 4px;"
                  >
                    Editar
                  </a>
                  <button
                    *appSiPermiso="'SERVICIO_ESCRIBIR'"
                    (click)="confirmarCambioEstado(s)"
                    class="btn btn-secundario"
                    style="padding: 4px 8px; font-size: 13px; margin-right: 4px;"
                  >
                    {{ s.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button
                    *appSiPermiso="'SERVICIO_ELIMINAR'"
                    (click)="confirmarEliminacion(s)"
                    class="btn btn-peligro"
                    style="padding: 4px 8px; font-size: 13px;"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (servicioParaCambioEstado()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Confirmar Cambio de Estado</h3>
          <p>
            ¿Está seguro de que desea <strong>{{ servicioParaCambioEstado()?.activo ? 'desactivar' : 'activar' }}</strong>
            el servicio <em>{{ servicioParaCambioEstado()?.nombre }}</em>?
          </p>
          <div class="modal-acciones">
            <button (click)="servicioParaCambioEstado.set(null)" class="btn btn-secundario">Cancelar</button>
            <button (click)="ejecutarCambioEstado()" class="btn btn-primary">Confirmar</button>
          </div>
        </div>
      </div>
    }

    @if (servicioParaEliminar()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3 style="color: #b42318;">Confirmar Eliminación</h3>
          <p>
            ¿Está seguro de que desea eliminar permanentemente el servicio
            <strong>{{ servicioParaEliminar()?.codigo }} - {{ servicioParaEliminar()?.nombre }}</strong>?
          </p>
          <p style="font-size: 13px; color: #64748b;">
            Nota: Si el servicio ya ha sido utilizado en órdenes de servicio registradas, la operación será rechazada (RN-01).
          </p>
          <div class="modal-acciones">
            <button (click)="servicioParaEliminar.set(null)" class="btn btn-secundario">Cancelar</button>
            <button (click)="ejecutarEliminacion()" class="btn btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ServicioListComponent implements OnInit {
  private servicioService = inject(ServicioService);

  servicios = signal<Servicio[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  busqueda = signal<string>('');
  filtroEstado = signal<string>('TODOS');

  servicioParaCambioEstado = signal<Servicio | null>(null);
  servicioParaEliminar = signal<Servicio | null>(null);

  serviciosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();

    return this.servicios().filter(s => {
      const coincideTexto = !q || s.codigo.toLowerCase().includes(q) || s.nombre.toLowerCase().includes(q);
      const coincideEstado =
        estado === 'TODOS' ||
        (estado === 'ACTIVOS' && s.activo) ||
        (estado === 'INACTIVOS' && !s.activo);
      return coincideTexto && coincideEstado;
    });
  });

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicioService.listar().subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cargar los servicios.');
        this.cargando.set(false);
      }
    });
  }

  confirmarCambioEstado(s: Servicio): void {
    this.servicioParaCambioEstado.set(s);
  }

  ejecutarCambioEstado(): void {
    const s = this.servicioParaCambioEstado();
    if (!s) return;

    this.servicioService.cambiarEstado(s.id).subscribe({
      next: (actualizado) => {
        this.servicios.update(lista => lista.map(item => item.id === actualizado.id ? actualizado : item));
        this.mensajeExito.set(`Servicio "${actualizado.nombre}" ${actualizado.activo ? 'activado' : 'desactivado'} con éxito.`);
        this.servicioParaCambioEstado.set(null);
        setTimeout(() => this.mensajeExito.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cambiar estado del servicio.');
        this.servicioParaCambioEstado.set(null);
      }
    });
  }

  confirmarEliminacion(s: Servicio): void {
    this.servicioParaEliminar.set(s);
  }

  ejecutarEliminacion(): void {
    const s = this.servicioParaEliminar();
    if (!s) return;

    this.servicioService.eliminar(s.id).subscribe({
      next: () => {
        this.servicios.update(lista => lista.filter(item => item.id !== s.id));
        this.mensajeExito.set(`Servicio "${s.nombre}" eliminado correctamente.`);
        this.servicioParaEliminar.set(null);
        setTimeout(() => this.mensajeExito.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudo eliminar el servicio.');
        this.servicioParaEliminar.set(null);
      }
    });
  }
}
