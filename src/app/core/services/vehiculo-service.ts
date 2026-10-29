import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehiculo, VehiculoRequest } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/vehiculos`;

  listar(clienteId?: number): Observable<Vehiculo[]> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    return this.http.get<Vehiculo[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.url}/${id}`);
  }

  crear(dto: VehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.url, dto);
  }

  actualizar(id: number, dto: VehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
