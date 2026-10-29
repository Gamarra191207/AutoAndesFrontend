import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioService } from '../../../../core/services/servicio-service';
import { ServicioRequest } from '../../../../core/models/servicio.model';
import { ErrorResponse } from '../../../../core/models/error-response';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2>{{ esEdicion() ? 'Editar Servicio' : 'Nuevo Servicio' }}</h2>
        <p style="color: #64748b; margin: 4px 0 0;">
          {{ esEdicion() ? 'Modifique los datos del servicio seleccionado' : 'Registre un nuevo servicio para el taller' }}
        </p>
      </div>
      <div>
        <a routerLink="/servicios" class="btn btn-secundario">← Volver al listado</a>
      </div>
    </div>

    @if (errorGeneral()) {
      <div class="alerta">{{ errorGeneral() }}</div>
    }

    <div class="card" style="max-width: 700px;">
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="grid-2">
          <div class="form-group">
            <label for="codigo">Código del Servicio *</label>
            <input
              id="codigo"
              type="text"
              class="input"
              formControlName="codigo"
              placeholder="Ej. SRV-009"
              [class.input-error]="tieneError('codigo')"
            />
            @if (tieneError('codigo')) {
              <span class="campo-error">
                {{ obtenerMensajeError('codigo', 'Formato requerido: SRV-000 (3 dígitos)') }}
              </span>
            }
          </div>

          <div class="form-group">
            <label for="duracionMin">Duración Estimada (minutos) *</label>
            <input
              id="duracionMin"
              type="number"
              class="input"
              formControlName="duracionMin"
              placeholder="15 - 480"
              [class.input-error]="tieneError('duracionMin')"
            />
            @if (tieneError('duracionMin')) {
              <span class="campo-error">
                {{ obtenerMensajeError('duracionMin', 'Debe estar entre 15 y 480 minutos') }}
              </span>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="nombre">Nombre del Servicio *</label>
          <input
            id="nombre"
            type="text"
            class="input"
            formControlName="nombre"
            placeholder="Ej. Cambio de Aceite y Filtro Sintético"
            [class.input-error]="tieneError('nombre')"
          />
          @if (tieneError('nombre')) {
            <span class="campo-error">
              {{ obtenerMensajeError('nombre', 'Nombre obligatorio (entre 3 y 80 caracteres)') }}
            </span>
          }
        </div>

        <div class="form-group">
          <label for="precio">Precio Base (S/ PEN) *</label>
          <input
            id="precio"
            type="number"
            step="0.01"
            class="input"
            formControlName="precio"
            placeholder="0.00"
            [class.input-error]="tieneError('precio')"
          />
          @if (tieneError('precio')) {
            <span class="campo-error">
              {{ obtenerMensajeError('precio', 'El precio debe ser mayor a 0') }}
            </span>
          }
        </div>

        <div class="form-group" style="margin-top: 12px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" formControlName="activo" style="width: 18px; height: 18px;" />
            <span>Servicio disponible y activo para nuevas órdenes</span>
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <a routerLink="/servicios" class="btn btn-secundario">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : (esEdicion() ? 'Actualizar Servicio' : 'Guardar Servicio') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ServicioFormComponent implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private servicioService = inject(ServicioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  servicioId: number | null = null;
  esEdicion = signal<boolean>(false);
  guardando = signal<boolean>(false);
  errorGeneral = signal<string | null>(null);
  erroresServidor = signal<Record<string, string>>({});

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
    activo: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.servicioId = +idParam;
      this.esEdicion.set(true);
      this.cargarServicio(this.servicioId);
    }
  }

  cargarServicio(id: number): void {
    this.servicioService.buscarPorId(id).subscribe({
      next: (s) => {
        this.form.patchValue({
          codigo: s.codigo,
          nombre: s.nombre,
          precio: s.precio,
          duracionMin: s.duracionMin,
          activo: s.activo
        });
      },
      error: (err) => {
        this.errorGeneral.set(err.error?.mensaje || 'No se pudo cargar el servicio solicitado.');
      }
    });
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

    const dto: ServicioRequest = this.form.getRawValue();

    const request$ = this.esEdicion() && this.servicioId
      ? this.servicioService.actualizar(this.servicioId, dto)
      : this.servicioService.crear(dto);

    request$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/servicios']);
      },
      error: (err) => {
        this.guardando.set(false);
        const errBody: ErrorResponse = err.error;
        if (errBody?.campos) {
          this.erroresServidor.set(errBody.campos);
        }
        this.errorGeneral.set(errBody?.mensaje || 'Error al procesar la solicitud.');
      }
    });
  }
}
