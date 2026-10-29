import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../../../core/services/orden-service';
import { OrdenServicio } from '../../../../core/models/orden.model';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe, SiPermisoDirective],
  template: `
    <div class="page-header no-imprimir">
      <div>
        <h2>Órdenes de Servicio</h2>
        <p style="color: #64748b; margin: 4px 0 0;">Gestión operativa de órdenes de trabajo mecánicas</p>
      </div>
      <div>
        <a *appSiPermiso="'ORDEN_REGISTRAR'" routerLink="/ordenes/nuevo" class="btn btn-primary">
          + Nueva Orden de Servicio
        </a>
      </div>
    </div>

    @if (mensajeExito()) {
      <div class="alerta-exito no-imprimir">{{ mensajeExito() }}</div>
    }
    @if (error()) {
      <div class="alerta no-imprimir">{{ error() }}</div>
    }

    <div class="card no-imprimir" style="padding: 16px; margin-bottom: 16px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: flex-end;">
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Placa</label>
          <input
            type="text"
            class="input"
            placeholder="Ej. ABC-123"
            [(ngModel)]="filtroPlaca"
          />
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Estado</label>
          <select class="select" [(ngModel)]="filtroEstado">
            <option value="">Todos los estados</option>
            <option value="REGISTRADA">REGISTRADA</option>
            <option value="EN_PROCESO">EN_PROCESO</option>
            <option value="COMPLETADA">COMPLETADA</option>
            <option value="FACTURADA">FACTURADA</option>
            <option value="ANULADA">ANULADA</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Fecha Desde</label>
          <input type="date" class="input" [(ngModel)]="filtroDesde" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Fecha Hasta</label>
          <input type="date" class="input" [(ngModel)]="filtroHasta" />
        </div>
        <div style="display: flex; gap: 8px;">
          <button (click)="buscar()" class="btn btn-primary" style="flex: 1;">Buscar</button>
          <button (click)="limpiarFiltros()" class="btn btn-secundario" style="flex: 1;">Limpiar</button>
        </div>
      </div>
    </div>

    @if (cargando()) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        Cargando órdenes de servicio...
      </div>
    } @else if (ordenes().length === 0) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        No se encontraron órdenes de servicio con los filtros aplicados.
      </div>
    } @else {
      <div class="tabla-container card" style="padding: 0;">
        <table class="tabla">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Fecha Ingreso</th>
              <th>Vehículo (Placa)</th>
              <th>Cliente</th>
              <th style="text-align: right;">Kilometraje</th>
              <th style="text-align: right;">Total</th>
              <th style="text-align: center;">Estado</th>
              <th style="text-align: right;" class="no-imprimir">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (o of ordenes(); track o.id) {
              <tr>
                <td><strong>{{ o.numero }}</strong></td>
                <td>{{ o.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <strong>{{ o.vehiculoPlaca }}</strong>
                  <div style="font-size: 12px; color: #64748b;">{{ o.vehiculoModelo }}</div>
                </td>
                <td>{{ o.clienteNombre }}</td>
                <td style="text-align: right;">{{ o.kilometraje | number }} km</td>
                <td style="text-align: right; font-weight: 600; color: #0f2e5c;">
                  {{ o.total | currency:'PEN':'symbol':'1.2-2' }}
                </td>
                <td style="text-align: center;">
                  <span class="badge" [ngClass]="obtenerClaseEstado(o.estado)">
                    {{ o.estado }}
                  </span>
                </td>
                <td style="text-align: right; white-space: nowrap;" class="no-imprimir">
                  <button
                    (click)="abrirDetalle(o)"
                    class="btn btn-secundario"
                    style="padding: 4px 8px; font-size: 13px; margin-right: 4px;"
                    title="Ver detalle completo"
                  >
                    Detalle
                  </button>
                  <button
                    *appSiPermiso="'ORDEN_ANULAR'"
                    [disabled]="o.estado === 'ANULADA'"
                    (click)="prepararAnulacion(o)"
                    class="btn btn-peligro"
                    style="padding: 4px 8px; font-size: 13px;"
                    title="Anular orden"
                  >
                    Anular
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (ordenSeleccionada()) {
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 680px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
            <div>
              <h3 style="margin: 0; color: #0f2e5c;">Orden de Servicio {{ ordenSeleccionada()?.numero }}</h3>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">
                Fecha: {{ ordenSeleccionada()?.fecha | date:'dd/MM/yyyy HH:mm' }} · Usuario: {{ ordenSeleccionada()?.usuarioRegistro }}
              </p>
            </div>
            <span class="badge" [ngClass]="obtenerClaseEstado(ordenSeleccionada()!.estado)">
              {{ ordenSeleccionada()?.estado }}
            </span>
          </div>

          <div class="grid-2" style="margin-bottom: 16px; font-size: 13px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px;">
              <strong>Vehículo:</strong> {{ ordenSeleccionada()?.vehiculoPlaca }} ({{ ordenSeleccionada()?.vehiculoModelo }})<br>
              <strong>Kilometraje:</strong> {{ ordenSeleccionada()?.kilometraje | number }} km
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px;">
              <strong>Cliente:</strong> {{ ordenSeleccionada()?.clienteNombre }}
            </div>
          </div>

          @if (ordenSeleccionada()?.estado === 'ANULADA') {
            <div class="alerta" style="margin-bottom: 16px; font-size: 13px;">
              <strong>Motivo de anulación:</strong> {{ ordenSeleccionada()?.motivoAnulacion }}
            </div>
          }

          <h4 style="margin: 12px 0 8px; font-size: 14px;">Servicios Solicitados</h4>
          <div class="tabla-container" style="margin-bottom: 16px;">
            <table class="tabla" style="font-size: 13px;">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">P. Unit.</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (d of ordenSeleccionada()?.detalles; track d.id || $index) {
                  <tr>
                    <td>
                      <strong>{{ d.servicioCodigo }}</strong> - {{ d.servicioNombre }}
                    </td>
                    <td style="text-align: center;">{{ d.cantidad }}</td>
                    <td style="text-align: right;">{{ d.precioUnitario | currency:'PEN':'symbol':'1.2-2' }}</td>
                    <td style="text-align: right; font-weight: 600;">{{ d.subtotal | currency:'PEN':'symbol':'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; font-size: 15px;">TOTAL GENERAL:</td>
                  <td style="text-align: right; font-weight: bold; font-size: 16px; color: #0f2e5c;">
                    {{ ordenSeleccionada()?.total | currency:'PEN':'symbol':'1.2-2' }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="modal-acciones no-imprimir">
            <button (click)="imprimirOrden()" class="btn btn-secundario">🖨️ Imprimir</button>
            <button (click)="ordenSeleccionada.set(null)" class="btn btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    }

    @if (ordenParaAnular()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3 style="color: #b42318;">Anular Orden de Servicio {{ ordenParaAnular()?.numero }}</h3>
          <p style="font-size: 14px;">
            Por regla de negocio (RN-05), debe ingresar el motivo justificado de la anulación (mínimo 10 caracteres).
          </p>

          <div class="form-group">
            <label for="motivoAnulacion">Motivo de Anulación *</label>
            <textarea
              id="motivoAnulacion"
              class="input"
              rows="3"
              placeholder="Describa el motivo por el cual se anula esta orden..."
              [(ngModel)]="motivoAnulacionTexto"
            ></textarea>
            @if (motivoAnulacionTexto.length > 0 && motivoAnulacionTexto.length < 10) {
              <span class="campo-error">El motivo debe tener al menos 10 caracteres (actual: {{ motivoAnulacionTexto.length }})</span>
            }
          </div>

          <div class="modal-acciones">
            <button (click)="ordenParaAnular.set(null)" class="btn btn-secundario">Cancelar</button>
            <button
              (click)="ejecutarAnulacion()"
              class="btn btn-peligro"
              [disabled]="motivoAnulacionTexto.trim().length < 10 || anulando()"
            >
              {{ anulando() ? 'Anulando...' : 'Confirmar Anulación' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class OrdenListComponent implements OnInit {
  private ordenService = inject(OrdenService);

  ordenes = signal<OrdenServicio[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  filtroPlaca: string = '';
  filtroEstado: string = '';
  filtroDesde: string = '';
  filtroHasta: string = '';

  ordenSeleccionada = signal<OrdenServicio | null>(null);
  ordenParaAnular = signal<OrdenServicio | null>(null);
  motivoAnulacionTexto: string = '';
  anulando = signal<boolean>(false);

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtros = {
      placa: this.filtroPlaca || undefined,
      estado: this.filtroEstado || undefined,
      desde: this.filtroDesde ? `${this.filtroDesde}T00:00:00` : undefined,
      hasta: this.filtroHasta ? `${this.filtroHasta}T23:59:59` : undefined
    };

    this.ordenService.listar(filtros).subscribe({
      next: (data) => {
        this.ordenes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al consultar órdenes de servicio.');
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroPlaca = '';
    this.filtroEstado = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.buscar();
  }

  abrirDetalle(o: OrdenServicio): void {
    this.ordenService.buscarPorId(o.id).subscribe({
      next: (det) => this.ordenSeleccionada.set(det),
      error: () => this.ordenSeleccionada.set(o)
    });
  }

  prepararAnulacion(o: OrdenServicio): void {
    this.ordenParaAnular.set(o);
    this.motivoAnulacionTexto = '';
  }

  ejecutarAnulacion(): void {
    const orden = this.ordenParaAnular();
    if (!orden || this.motivoAnulacionTexto.trim().length < 10) return;

    this.anulando.set(true);
    this.ordenService.anular(orden.id, this.motivoAnulacionTexto.trim()).subscribe({
      next: (anulada) => {
        this.anulando.set(false);
        this.ordenes.update(lista => lista.map(item => item.id === anulada.id ? anulada : item));
        this.mensajeExito.set(`Orden ${anulada.numero} anulada correctamente.`);
        this.ordenParaAnular.set(null);
        setTimeout(() => this.mensajeExito.set(null), 3500);
      },
      error: (err) => {
        this.anulando.set(false);
        this.error.set(err.error?.mensaje || 'No se pudo anular la orden de servicio.');
        this.ordenParaAnular.set(null);
      }
    });
  }

  imprimirOrden(): void {
    window.print();
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'REGISTRADA': return 'registrada';
      case 'ANULADA': return 'anulada';
      default: return 'inactivo';
    }
  }
}
