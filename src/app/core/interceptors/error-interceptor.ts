import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { UiService } from '../services/ui.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const ui = inject(UiService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.endsWith('/auth/login')) {
        const returnUrl = router.url;
        authService.cerrarSesion();
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      if (error.status === 403) {
        ui.mostrarAlerta(
          error.error?.mensaje || 'No tiene permisos suficientes para realizar esta operación.'
        );
      }

      return throwError(() => error);
    })
  );
};
