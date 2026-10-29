import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  // Solo agregar token Bearer a las peticiones dirigidas a la API
  if (token && req.url.startsWith(environment.apiUrl)) {
    // Si la peticion es login, no enviar Authorization
    if (req.url.endsWith('/auth/login')) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
