import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { ClienteService } from '../../../../core/services/cliente-service';
import { Vehiculo } from '../../../../core/models/vehiculo.model';
import { Cliente } from '../../../../core/models/cliente.model';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-vehiculo-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SiPermisoDirective],
  template: `
    <div class="page-header">
      <div>
        <h2>Flota de Vehículos</h2>
        <p style="color: #64748b; margin: 4px 0 0;">Gestión de vehículos registrados para atención en el taller</p>
      </div>
      <div>
        <a *appSiPermiso="'VEHICULO_ESCRIBIR'" routerLink="/vehiculos/nuevo" class="btn btn-primary">
          + Nuevo Vehículo
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
            placeholder="Buscar por placa, marca, modelo o cliente..."
            [ngModel]="busqueda()"
            (ngModelChange)="busqueda.set($event)"
          />
        </div>
        <div style="width: 260px;">
          <select
            class="select"
            [ngModel]="filtroClienteId()"
            (ngModelChange)="filtroClienteId.set($event)"
          >
            <option [value]="0">Todos los clientes</option>
            @for (c of clientes(); track c.id) {
              <option [value]="c.id">{{ c.nombres }} (Doc: {{ c.documento }})</option>
            }
          </select>
        </div>
      </div>
    </div>

    @if (cargando()) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        Cargando vehículos...
      </div>
    } @else if (vehiculosFiltrados().length === 0) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        No se encontraron vehículos con los criterios seleccionados.
      </div>
    } @else {
      <div class="tabla-container card" style="padding: 0;">
        <table class="tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Marca y Modelo</th>
              <th style="text-align: center;">Año</th>
              <th>Propietario (Cliente)</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (v of vehiculosFiltrados(); track v.id) {
              <tr>
                <td><strong>{{ v.placa }}</strong></td>
                <td>{{ v.marca }} {{ v.modelo }}</td>
                <td style="text-align: center;">{{ v.anio }}</td>
                <td>{{ v.clienteNombre }}</td>
                <td style="text-align: right; white-space: nowrap;">
                  <a
                    *appSiPermiso="'VEHICULO_ESCRIBIR'"
                    [routerLink]="['/vehiculos', v.id, 'editar']"
                    class="btn btn-secundario"
                    style="padding: 4px 8px; font-size: 13px; margin-right: 4px;"
                  >
                    Editar
                  </a>
                  <button
                    *appSiPermiso="'VEHICULO_ESCRIBIR'"
                    (click)="confirmarEliminacion(v)"
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

    @if (vehiculoParaEliminar()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3 style="color: #b42318;">Confirmar Eliminación de Vehículo</h3>
          <p>
            ¿Está seguro de que desea eliminar el vehículo con placa
            <strong>{{ vehiculoParaEliminar()?.placa }}</strong> ({{ vehiculoParaEliminar()?.marca }} {{ vehiculoParaEliminar()?.modelo }})?
          </p>
          <p style="font-size: 13px; color: #64748b;">
            Nota: Si el vehículo tiene órdenes de servicio asociadas, la eliminación será rechazada por regla de negocio (RN-02).
          </p>
          <div class="modal-acciones">
            <button (click)="vehiculoParaEliminar.set(null)" class="btn btn-secundario">Cancelar</button>
            <button (click)="ejecutarEliminacion()" class="btn btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class VehiculoListComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);

  vehiculos = signal<Vehiculo[]>([]);
  clientes = signal<Cliente[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  busqueda = signal<string>('');
  filtroClienteId = signal<number>(0);

  vehiculoParaEliminar = signal<Vehiculo | null>(null);

  vehiculosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const clienteId = +this.filtroClienteId();

    return this.vehiculos().filter(v => {
      const matchText =
        !q ||
        v.placa.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        (v.clienteNombre && v.clienteNombre.toLowerCase().includes(q));

      const matchCliente = clienteId === 0 || v.clienteId === clienteId;
      return matchText && matchCliente;
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.listar().subscribe({
      next: (cls) => this.clientes.set(cls),
      error: () => {}
    });

    this.vehiculoService.listar().subscribe({
      next: (data) => {
        this.vehiculos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cargar los vehículos.');
        this.cargando.set(false);
      }
    });
  }

  confirmarEliminacion(v: Vehiculo): void {
    this.vehiculoParaEliminar.set(v);
  }

  ejecutarEliminacion(): void {
    const v = this.vehiculoParaEliminar();
    if (!v) return;

    this.vehiculoService.eliminar(v.id).subscribe({
      next: () => {
        this.vehiculos.update(lista => lista.filter(item => item.id !== v.id));
        this.mensajeExito.set(`Vehículo con placa "${v.placa}" eliminado correctamente.`);
        this.vehiculoParaEliminar.set(null);
        setTimeout(() => this.mensajeExito.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudo eliminar el vehículo.');
        this.vehiculoParaEliminar.set(null);
      }
    });
  }
}
