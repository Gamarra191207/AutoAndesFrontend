import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="icono-auto">🚗</div>
          <h1>AutoAndes</h1>
          <p>Sistema Integral de Gestión de Taller Mecánico</p>
        </div>

        @if (errorMensaje()) {
          <div class="alerta">
            ⚠️ {{ errorMensaje() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="ingresar()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input
              id="username"
              type="text"
              class="input"
              formControlName="username"
              placeholder="Ej. admin, asesor, jefe"
              autocomplete="username"
            />
            @if (loginForm.get('username')?.touched && loginForm.get('username')?.invalid) {
              <span class="campo-error">Ingrese su nombre de usuario</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="input"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <span class="campo-error">Ingrese su contraseña</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loginForm.invalid || enviando()"
          >
            @if (enviando()) {
              <span>Ingresando...</span>
            } @else {
              <span>Iniciar Sesión</span>
            }
          </button>
        </form>

        <div class="login-ayuda">
          <strong>Usuarios de prueba (clave: Auto2026*):</strong>
          <ul>
            <li><code>admin</code> : Administrador total</li>
            <li><code>asesor</code> : Asesor de mostrador</li>
            <li><code>jefe</code> : Jefe de taller</li>
            <li><code>inactivo</code> : Cuenta deshabilitada (401)</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f2e5c 0%, #1e3a8a 100%);
      padding: 20px;
    }
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    .login-header { text-align: center; margin-bottom: 24px; }
    .icono-auto { font-size: 42px; margin-bottom: 8px; }
    .login-header h1 { margin: 0; color: #0f2e5c; font-size: 26px; }
    .login-header p { margin: 6px 0 0; color: #64748b; font-size: 13px; }
    .btn-block { width: 100%; padding: 12px; font-size: 15px; margin-top: 8px; }
    .login-ayuda {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .login-ayuda ul { margin: 8px 0 0; padding-left: 18px; }
    .login-ayuda code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; color: #0f2e5c; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  enviando = signal(false);
  errorMensaje = signal<string | null>(null);

  ingresar(): void {
    if (this.loginForm.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const credenciales = this.loginForm.getRawValue();

    this.authService.login(credenciales).subscribe({
      next: () => {
        this.enviando.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/servicios';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorMensaje.set(err.error?.mensaje || 'Credenciales incorrectas o usuario inhabilitado');
        this.loginForm.patchValue({ password: '' });
      }
    });
  }
}
