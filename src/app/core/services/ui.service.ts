import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  readonly mensajeAlerta = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  mostrarAlerta(mensaje: string, duracionMs: number = 5000): void {
    this.mensajeAlerta.set(mensaje);
    if (duracionMs > 0) {
      setTimeout(() => {
        if (this.mensajeAlerta() === mensaje) {
          this.mensajeAlerta.set(null);
        }
      }, duracionMs);
    }
  }

  mostrarExito(mensaje: string, duracionMs: number = 4000): void {
    this.mensajeExito.set(mensaje);
    if (duracionMs > 0) {
      setTimeout(() => {
        if (this.mensajeExito() === mensaje) {
          this.mensajeExito.set(null);
        }
      }, duracionMs);
    }
  }

  limpiar(): void {
    this.mensajeAlerta.set(null);
    this.mensajeExito.set(null);
  }
}
