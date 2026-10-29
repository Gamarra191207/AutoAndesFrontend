import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { OrdenService } from '../../../../core/services/orden-service';
import { VehiculoService } from '../../../../core/services/vehiculo-service';
import { ServicioService } from '../../../../core/services/servicio-service';
import { Vehiculo } from '../../../../core/models/vehiculo.model';
import { Servicio } from '../../../../core/models/servicio.model';
import { OrdenServicioRequest } from '../../../../core/models/orden.model';
import { ErrorResponse } from '../../../../core/models/error-response';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-header">
      <div>
        <h2>Nueva Orden de Servicio</h2>
        <p style="color: #64748b; margin: 4px 0 0;">
          Registre una nueva orden de atención mecánica en el taller AutoAndes
        </p>
      </div>
      <div>
        <a routerLink="/ordenes" class="btn btn-secundario">← Volver a órdenes</a>
      </div>
    </div>

    @if (errorGeneral()) {
      <div class="alerta">{{ errorGeneral() }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <!-- Cabecera de la Orden -->
      <div class="card">
        <h3 style="margin-bottom: 16px; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          1. Datos de Ingreso del Vehículo
        </h3>

        <div class="grid-2">
          <div class="form-group">
            <label for="vehiculoId">Vehículo (Placa / Propietario) *</label>
            <select
              id="vehiculoId"
              class="select"
              formControlName="vehiculoId"
              [class.input-error]="tieneError('vehiculoId')"
            >
              <option [value]="0" disabled>Seleccione un vehículo registrado...</option>
              @for (v of vehiculos(); track v.id) {
                <option [value]="v.id">
                  {{ v.placa }} - {{ v.marca }} {{ v.modelo }} (Cliente: {{ v.clienteNombre }})
                </option>
              }
            </select>
            @if (tieneError('vehiculoId')) {
              <span class="campo-error">Debe seleccionar un vehículo para la orden</span>
            }
          </div>

          <div class="form-group">
            <label for="kilometraje">Kilometraje Actual (km) *</label>
            <input
              id="kilometraje"
              type="number"
              class="input"
              formControlName="kilometraje"
              placeholder="Ej. 45000"
              [class.input-error]="tieneError('kilometraje')"
            />
            @if (tieneError('kilometraje')) {
              <span class="campo-error">El kilometraje debe ser un entero positivo mayor a 0</span>
            }
          </div>
        </div>
      </div>

      <!-- Detalle de Servicios (Líneas) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px;">
            2. Servicios Requeridos (Mínimo 1, Máximo 5 unidades por servicio)
          </h3>
          <button type="button" (click)="agregarDetalle()" class="btn btn-secundario" style="font-size: 13px;">
            + Agregar Servicio
          </button>
        </div>

        <div formArrayName="detalles">
          <div class="tabla-container">
            <table class="tabla">
              <thead>
                <tr>
                  <th style="width: 45%;">Servicio del Catálogo *</th>
                  <th style="width: 15%; text-align: center;">Cantidad (1-5) *</th>
                  <th style="width: 15%; text-align: right;">Precio Base</th>
                  <th style="width: 15%; text-align: right;">Subtotal Est.</th>
                  <th style="width: 10%; text-align: center;">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (d of detallesFormArray.controls; track $index) {
                  <tr [formGroupName]="$index">
                    <td>
                      <select
                        class="select"
                        formControlName="servicioId"
                        (change)="onServicioChange($index)"
                        style="padding: 6px 10px; font-size: 13px;"
                      >
                        <option [value]="0" disabled>Seleccione servicio...</option>
                        @for (s of servicios(); track s.id) {
                          <option [value]="s.id">{{ s.codigo }} - {{ s.nombre }}</option>
                        }
                      </select>
                    </td>
                    <td style="text-align: center;">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        class="input"
                        formControlName="cantidad"
                        (input)="recalcular()"
                        style="width: 80px; text-align: center; margin: 0 auto;"
                      />
                    </td>
                    <td style="text-align: right; font-weight: 500;">
                      {{ obtenerPrecioUnitario($index) | currency:'PEN':'symbol':'1.2-2' }}
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #0f2e5c;">
                      {{ calcularSubtotalFila($index) | currency:'PEN':'symbol':'1.2-2' }}
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        (click)="quitarDetalle($index)"
                        class="btn btn-peligro"
                        style="padding: 4px 10px; font-size: 12px;"
                        [disabled]="detallesFormArray.length <= 1"
                        title="Quitar ítem"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; font-size: 15px;">TOTAL ESTIMADO:</td>
                  <td style="text-align: right; font-weight: bold; font-size: 16px; color: #0f2e5c;">
                    {{ totalEstimado() | currency:'PEN':'symbol':'1.2-2' }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
          * Los precios oficiales y el importe total final serán liquidados y validados por el servidor al confirmar el registro.
        </p>
      </div>

      <!-- Acciones Finales -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 40px;">
        <a routerLink="/ordenes" class="btn btn-secundario">Cancelar</a>
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="form.invalid || guardando() || detallesFormArray.length === 0"
        >
          {{ guardando() ? 'Generando Orden...' : 'Registrar Orden de Servicio' }}
        </button>
      </div>
    </form>
  `
})
export class OrdenFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordenService = inject(OrdenService);
  private vehiculoService = inject(VehiculoService);
  private servicioService = inject(ServicioService);
  private router = inject(Router);

  vehiculos = signal<Vehiculo[]>([]);
  servicios = signal<Servicio[]>([]);
  guardando = signal<boolean>(false);
  errorGeneral = signal<string | null>(null);

  totalEstimado = signal<number>(0);

  form = this.fb.group({
    vehiculoId: [0, [Validators.required, Validators.min(1)]],
    kilometraje: [null as number | null, [Validators.required, Validators.min(1)]],
    detalles: this.fb.array([])
  });

  get detallesFormArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.agregarDetalle();
  }

  cargarDatosIniciales(): void {
    this.vehiculoService.listar().subscribe({
      next: (vs) => this.vehiculos.set(vs),
      error: () => this.errorGeneral.set('Error al cargar la lista de vehículos.')
    });

    this.servicioService.listar(true).subscribe({
      next: (ss) => this.servicios.set(ss),
      error: () => this.errorGeneral.set('Error al cargar los servicios activos.')
    });
  }

  crearDetalleGroup(): FormGroup {
    return this.fb.group({
      servicioId: [0, [Validators.required, Validators.min(1)]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      precioUnitario: [0]
    });
  }

  agregarDetalle(): void {
    this.detallesFormArray.push(this.crearDetalleGroup());
  }

  quitarDetalle(index: number): void {
    if (this.detallesFormArray.length > 1) {
      this.detallesFormArray.removeAt(index);
      this.recalcular();
    }
  }

  onServicioChange(index: number): void {
    const row = this.detallesFormArray.at(index);
    const servicioId = +row.get('servicioId')?.value;
    const serv = this.servicios().find(s => s.id === servicioId);
    if (serv) {
      row.patchValue({ precioUnitario: serv.precio });
    }
    this.recalcular();
  }

  obtenerPrecioUnitario(index: number): number {
    return this.detallesFormArray.at(index)?.get('precioUnitario')?.value || 0;
  }

  calcularSubtotalFila(index: number): number {
    const row = this.detallesFormArray.at(index);
    const cant = +row?.get('cantidad')?.value || 0;
    const precio = +row?.get('precioUnitario')?.value || 0;
    return cant * precio;
  }

  recalcular(): void {
    let tot = 0;
    for (let i = 0; i < this.detallesFormArray.length; i++) {
      tot += this.calcularSubtotalFila(i);
    }
    this.totalEstimado.set(tot);
  }

  tieneError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  guardar(): void {
    if (this.form.invalid || this.detallesFormArray.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGeneral.set(null);

    const raw = this.form.getRawValue();
    const dto: OrdenServicioRequest = {
      vehiculoId: raw.vehiculoId!,
      kilometraje: raw.kilometraje!,
      detalles: raw.detalles.map((d: any) => ({
        servicioId: +d.servicioId,
        cantidad: +d.cantidad
      }))
    };

    this.ordenService.crear(dto).subscribe({
      next: (creada) => {
        this.guardando.set(false);
        alert(`¡Orden de Servicio ${creada.numero} registrada exitosamente!`);
        this.router.navigate(['/ordenes']);
      },
      error: (err) => {
        this.guardando.set(false);
        const errBody: ErrorResponse = err.error;
        this.errorGeneral.set(errBody?.mensaje || 'Error al procesar el registro de la orden.');
      }
    });
  }
}
