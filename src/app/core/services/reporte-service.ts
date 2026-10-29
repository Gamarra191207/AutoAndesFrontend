import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IngresoPorServicio } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/reportes/ingresos-por-servicio`;

  ingresosPorServicio(desde?: string, hasta?: string): Observable<IngresoPorServicio[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<IngresoPorServicio[]>(this.url, { params });
  }
}
