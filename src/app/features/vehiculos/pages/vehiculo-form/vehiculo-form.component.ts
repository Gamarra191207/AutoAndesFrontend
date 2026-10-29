import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { ClienteService } from '../../../../core/services/cliente-service';
import { Cliente } from '../../../../core/models/cliente.model';
import { VehiculoRequest } from '../../../../core/models/vehiculo.model';
import { ErrorResponse } from '../../../../core/models/error-response';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2>{{ esEdicion() ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h2>
        <p style="color: #64748b; margin: 4px 0 0;">
          {{ esEdicion() ? 'Modifique la información del vehículo' : 'Registre un nuevo vehículo asociándolo a un cliente' }}
        </p>
      </div>
      <div>
        <a routerLink="/vehiculos" class="btn btn-secundario">← Volver al listado</a>
      </div>
    </div>

    @if (errorGeneral()) {
      <div class="alerta">{{ errorGeneral() }}</div>
    }

    <div class="card" style="max-width: 700px;">
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="grid-2">
          <div class="form-group">
            <label for="placa">Placa del Vehículo *</label>
            <input
              id="placa"
              type="text"
              class="input"
              formControlName="placa"
              placeholder="Ej. ABC-123"
              (input)="onPlacaInput($event)"
              [class.input-error]="tieneError('placa')"
            />
            @if (tieneError('placa')) {
              <span class="campo-error">
                {{ obtenerMensajeError('placa', 'Formato requerido: ABC-123 (6 caracteres alfanuméricos con guion)') }}
              </span>
            }
          </div>

          <div class="form-group">
            <label for="clienteId">Propietario (Cliente) *</label>
            <select
              id="clienteId"
              class="select"
              formControlName="clienteId"
              [class.input-error]="tieneError('clienteId')"
            >
              <option [value]="0" disabled>Seleccione un cliente...</option>
              @for (c of clientes(); track c.id) {
                <option [value]="c.id">{{ c.nombres }} (Doc: {{ c.documento }})</option>
              }
            </select>
            @if (tieneError('clienteId')) {
              <span class="campo-error">
                {{ obtenerMensajeError('clienteId', 'Debe seleccionar un cliente propietario') }}
              </span>
            }
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label for="marca">Marca *</label>
            <input
              id="marca"
              type="text"
              class="input"
              formControlName="marca"
              placeholder="Ej. Toyota"
              [class.input-error]="tieneError('marca')"
            />
            @if (tieneError('marca')) {
              <span class="campo-error">
                {{ obtenerMensajeError('marca', 'Marca requerida (entre 2 y 50 caracteres)') }}
              </span>
            }
          </div>

          <div class="form-group">
            <label for="modelo">Modelo *</label>
            <input
              id="modelo"
              type="text"
              class="input"
              formControlName="modelo"
              placeholder="Ej. Hilux"
              [class.input-error]="tieneError('modelo')"
            />
            @if (tieneError('modelo')) {
              <span class="campo-error">
                {{ obtenerMensajeError('modelo', 'Modelo requerido (entre 2 y 50 caracteres)') }}
              </span>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="anio">Año de Fabricación *</label>
          <input
            id="anio"
            type="number"
            class="input"
            formControlName="anio"
            placeholder="1990 - 2027"
            [class.input-error]="tieneError('anio')"
          />
          @if (tieneError('anio')) {
            <span class="campo-error">
              {{ obtenerMensajeError('anio', 'El año debe estar comprendido entre 1990 y 2027') }}
            </span>
          }
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <a routerLink="/vehiculos" class="btn btn-secundario">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : (esEdicion() ? 'Actualizar Vehículo' : 'Guardar Vehículo') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class VehiculoFormComponent implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vehiculoId: number | null = null;
  esEdicion = signal<boolean>(false);
  guardando = signal<boolean>(false);
  errorGeneral = signal<string | null>(null);
  erroresServidor = signal<Record<string, string>>({});
  clientes = signal<Cliente[]>([]);

  form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{3}-[A-Za-z0-9]{3}$/)]],
    marca: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    modelo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    anio: [2020, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.clienteService.listar().subscribe({
      next: (cls) => this.clientes.set(cls),
      error: () => this.errorGeneral.set('Error al cargar la lista de clientes.')
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.vehiculoId = +idParam;
      this.esEdicion.set(true);
      this.cargarVehiculo(this.vehiculoId);
    }
  }

  cargarVehiculo(id: number): void {
    this.vehiculoService.buscarPorId(id).subscribe({
      next: (v) => {
        this.form.patchValue({
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          anio: v.anio,
          clienteId: v.clienteId
        });
      },
      error: (err) => {
        this.errorGeneral.set(err.error?.mensaje || 'No se pudo cargar el vehículo.');
      }
    });
  }

  onPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const val = input.value.toUpperCase();
      this.form.get('placa')?.setValue(val, { emitEvent: false });
    }
  }

  tieneError(campo: string): boolean {
    const control = this.form.get(campo);
    const hayErrorForm = !!(control && control.invalid && (control.dirty || control.touched));
    const hayErrorServidor = !!this.erroresServidor()[campo];
    return hayErrorForm || hayErrorServidor;
  }

  obtenerMensajeError(campo: string, defaultMsg: string): string {
    if (this.erroresServidor()[campo]) {
      return this.erroresServidor()[campo];
    }
    return defaultMsg;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGeneral.set(null);
    this.erroresServidor.set({});

    const raw = this.form.getRawValue();
    const dto: VehiculoRequest = {
      placa: raw.placa.toUpperCase(),
      marca: raw.marca,
      modelo: raw.modelo,
      anio: raw.anio,
      clienteId: raw.clienteId
    };

    const request$ = this.esEdicion() && this.vehiculoId
      ? this.vehiculoService.actualizar(this.vehiculoId, dto)
      : this.vehiculoService.crear(dto);

    request$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/vehiculos']);
      },
      error: (err) => {
        this.guardando.set(false);
        const errBody: ErrorResponse = err.error;
        if (errBody?.campos) {
          this.erroresServidor.set(errBody.campos);
        }
        this.errorGeneral.set(errBody?.mensaje || 'Error al guardar el vehículo.');
      }
    });
  }
}
