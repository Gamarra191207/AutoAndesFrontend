import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../../core/services/reporte-service';
import { IngresoPorServicio } from '../../../../core/models/reporte.model';

@Component({
  selector: 'app-reporte-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page-header no-imprimir">
      <div>
        <h2>Reporte de Ingresos por Servicio</h2>
        <p style="color: #64748b; margin: 4px 0 0;">
          Análisis consolidado de servicios realizados e ingresos brutos generados
        </p>
      </div>
      <div>
        <button (click)="imprimir()" class="btn btn-secundario">🖨️ Imprimir Reporte</button>
      </div>
    </div>

    <div class="solo-impresion" style="margin-bottom: 24px;">
      <h1 style="color: #0f2e5c; margin: 0;">AutoAndes - Taller Mecánico Especializado</h1>
      <h3 style="margin: 4px 0 12px; color: #334155;">Reporte de Ingresos Consolidados por Servicio</h3>
      <p style="font-size: 13px; color: #64748b; margin: 0;">
        Período consultado: {{ desde || 'Histórico Completo' }} hasta {{ hasta || 'Hoy' }}
      </p>
      <hr style="margin-top: 12px; border: 0; border-top: 1px solid #cbd5e1;">
    </div>

    <div class="card no-imprimir" style="padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px;">
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Fecha Desde</label>
          <input type="date" class="input" [(ngModel)]="desde" />
        </div>
        <div style="flex: 1; min-width: 180px;">
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Fecha Hasta</label>
          <input type="date" class="input" [(ngModel)]="hasta" />
        </div>
        <div style="display: flex; gap: 8px;">
          <button (click)="consultar()" class="btn btn-primary">Consultar</button>
          <button (click)="limpiar()" class="btn btn-secundario">Restablecer</button>
        </div>
      </div>
    </div>

    @if (error()) {
      <div class="alerta">{{ error() }}</div>
    }

    <div class="grid-2" style="margin-bottom: 20px;">
      <div class="card" style="margin-bottom: 0; background: #f0fdf4; border: 1px solid #bbf7d0;">
        <div style="font-size: 13px; font-weight: 600; color: #166534; text-transform: uppercase;">
          Ingresos Totales en el Período
        </div>
        <div style="font-size: 28px; font-weight: bold; color: #15803d; margin-top: 8px;">
          {{ totalIngresos() | currency:'PEN':'symbol':'1.2-2' }}
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; background: #eff6ff; border: 1px solid #bfdbfe;">
        <div style="font-size: 13px; font-weight: 600; color: #1e40af; text-transform: uppercase;">
          Servicios Efectuados
        </div>
        <div style="font-size: 28px; font-weight: bold; color: #1d4ed8; margin-top: 8px;">
          {{ totalCantidad() }} servicios
        </div>
      </div>
    </div>

    @if (cargando()) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        Generando reporte consolidado...
      </div>
    } @else if (datos().length === 0) {
      <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
        No se registran servicios facturados en el rango de fechas seleccionado.
      </div>
    } @else {
      <div class="tabla-container card" style="padding: 0;">
        <table class="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Servicio</th>
              <th style="text-align: center;">Cantidad Realizada</th>
              <th style="text-align: right;">Ingresos Totales (PEN)</th>
              <th style="width: 25%;">Distribución de Ingresos</th>
            </tr>
          </thead>
          <tbody>
            @for (item of datos(); track item.codigo) {
              <tr>
                <td><strong>{{ item.codigo }}</strong></td>
                <td>{{ item.servicio }}</td>
                <td style="text-align: center; font-weight: 600;">{{ item.cantidadTotal }}</td>
                <td style="text-align: right; font-weight: 600; color: #0f2e5c;">
                  {{ item.importeTotal | currency:'PEN':'symbol':'1.2-2' }}
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div
                        style="background: #0f2e5c; height: 100%;"
                        [style.width.%]="calcularPorcentaje(item.importeTotal)"
                      ></div>
                    </div>
                    <span style="font-size: 12px; color: #64748b; min-width: 44px; text-align: right;">
                      {{ calcularPorcentaje(item.importeTotal) | number:'1.1-1' }}%
                    </span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc;">
              <td colspan="2" style="font-weight: bold; font-size: 14px;">TOTAL GENERAL:</td>
              <td style="text-align: center; font-weight: bold; font-size: 14px;">{{ totalCantidad() }}</td>
              <td style="text-align: right; font-weight: bold; font-size: 15px; color: #0f2e5c;">
                {{ totalIngresos() | currency:'PEN':'symbol':'1.2-2' }}
              </td>
              <td style="font-size: 13px; font-weight: 600; color: #64748b;">100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    }
  `
})
export class ReporteIngresosComponent implements OnInit {
  private reporteService = inject(ReporteService);

  datos = signal<IngresoPorServicio[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  desde: string = '';
  hasta: string = '';

  totalIngresos = computed(() => {
    return this.datos().reduce((sum, item) => sum + (item.importeTotal || 0), 0);
  });

  totalCantidad = computed(() => {
    return this.datos().reduce((sum, item) => sum + (item.cantidadTotal || 0), 0);
  });

  ngOnInit(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.desde = firstDay.toISOString().substring(0, 10);
    this.hasta = now.toISOString().substring(0, 10);
    this.consultar();
  }

  consultar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const fDesde = this.desde ? `${this.desde}T00:00:00` : undefined;
    const fHasta = this.hasta ? `${this.hasta}T23:59:59` : undefined;

    this.reporteService.ingresosPorServicio(fDesde, fHasta).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al obtener el reporte de ingresos.');
        this.cargando.set(false);
      }
    });
  }

  limpiar(): void {
    this.desde = '';
    this.hasta = '';
    this.consultar();
  }

  calcularPorcentaje(monto: number): number {
    const tot = this.totalIngresos();
    if (!tot || tot === 0) return 0;
    return (monto / tot) * 100;
  }

  imprimir(): void {
    window.print();
  }
}
