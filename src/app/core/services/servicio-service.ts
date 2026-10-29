import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/servicios`;

  listar(soloActivos: boolean = false): Observable<Servicio[]> {
    let params = new HttpParams();
    if (soloActivos) {
      params = params.set('soloActivos', 'true');
    }
    return this.http.get<Servicio[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.url}/${id}`);
  }

  crear(dto: ServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(this.url, dto);
  }

  actualizar(id: number, dto: ServicioRequest): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  cambiarEstado(id: number): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.url}/${id}/estado`, {});
  }
}
