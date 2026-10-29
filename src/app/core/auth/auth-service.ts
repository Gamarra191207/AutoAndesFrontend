import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, SesionUsuario, UsuarioPerfil } from './auth.model';

const CLAVE_SESION = 'autoandes_sesion';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private sesionSignal = signal<SesionUsuario | null>(this.leerSesionGuardada());

  readonly autenticado = computed(() => this.sesionSignal() !== null);
  readonly usuario = computed(() => this.sesionSignal()?.nombrecompleto || this.sesionSignal()?.username || '');
  readonly username = computed(() => this.sesionSignal()?.username || '');
  readonly roles = computed(() => this.sesionSignal()?.roles || []);
  readonly permisos = computed(() => this.sesionSignal()?.permisos || []);
  readonly token = computed(() => this.sesionSignal()?.token || null);

  readonly segundosRestantes = signal<number>(0);
  private temporizadorContador: any = null;
  private temporizadorExpiracion: any = null;

  constructor() {
    this.iniciarTemporizadoresSiHaySesion();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap(res => {
        const expiraEn = Date.now() + (res.expiraEnSegundos * 1000);
        const sesion: SesionUsuario = {
          token: res.token,
          username: res.username,
          nombrecompleto: res.nombrecompleto,
          roles: res.roles,
          permisos: res.permisos,
          expiraEn
        };

        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        this.sesionSignal.set(sesion);
        this.iniciarTemporizadores(expiraEn);
      })
    );
  }

  obtenerPerfil(): Observable<UsuarioPerfil> {
    return this.http.get<UsuarioPerfil>(`${environment.apiUrl}/auth/me`);
  }

  cerrarSesion(): void {
    this.limpiarTemporizadores();
    sessionStorage.removeItem(CLAVE_SESION);
    this.sesionSignal.set(null);
    this.router.navigate(['/login']);
  }

  tienePermiso(permiso: string): boolean {
    const lista = this.permisos();
    return lista.includes(permiso);
  }

  tieneCualquierPermiso(permisos: string[]): boolean {
    return permisos.some(p => this.tienePermiso(p));
  }

  private leerSesionGuardada(): SesionUsuario | null {
    try {
      const item = sessionStorage.getItem(CLAVE_SESION);
      if (!item) return null;

      const sesion: SesionUsuario = JSON.parse(item);
      if (!sesion || !sesion.token || !sesion.expiraEn) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }

      if (Date.now() >= sesion.expiraEn) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }

      return sesion;
    } catch {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }

  private iniciarTemporizadoresSiHaySesion(): void {
    const sesion = this.sesionSignal();
    if (sesion && sesion.expiraEn) {
      this.iniciarTemporizadores(sesion.expiraEn);
    }
  }

  private iniciarTemporizadores(expiraEn: number): void {
    this.limpiarTemporizadores();

    const actualizarSegundos = () => {
      const restantes = Math.max(0, Math.floor((expiraEn - Date.now()) / 1000));
      this.segundosRestantes.set(restantes);

      if (restantes <= 0) {
        this.cerrarSesion();
      }
    };

    actualizarSegundos();
    this.temporizadorContador = setInterval(actualizarSegundos, 1000);

    const msHastaVencer = Math.max(0, expiraEn - Date.now());
    this.temporizadorExpiracion = setTimeout(() => {
      this.cerrarSesion();
    }, msHastaVencer);
  }

  private limpiarTemporizadores(): void {
    if (this.temporizadorContador) {
      clearInterval(this.temporizadorContador);
      this.temporizadorContador = null;
    }
    if (this.temporizadorExpiracion) {
      clearTimeout(this.temporizadorExpiracion);
      this.temporizadorExpiracion = null;
    }
    this.segundosRestantes.set(0);
  }
}
