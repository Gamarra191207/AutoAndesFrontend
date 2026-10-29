import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdenServicio, OrdenServicioRequest } from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/ordenes`;

  listar(filtros?: { placa?: string; estado?: string; desde?: string; hasta?: string }): Observable<OrdenServicio[]> {
    let params = new HttpParams();
    if (filtros?.placa) params = params.set('placa', filtros.placa.trim());
    if (filtros?.estado) params = params.set('estado', filtros.estado.trim());
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);

    return this.http.get<OrdenServicio[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<OrdenServicio> {
    return this.http.get<OrdenServicio>(`${this.url}/${id}`);
  }

  crear(dto: OrdenServicioRequest): Observable<OrdenServicio> {
    return this.http.post<OrdenServicio>(this.url, dto);
  }

  anular(id: number, motivo: string): Observable<OrdenServicio> {
    return this.http.patch<OrdenServicio>(`${this.url}/${id}/anular`, { motivo });
  }
}
