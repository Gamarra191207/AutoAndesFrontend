import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';

@Directive({
  selector: '[appSiPermiso]',
  standalone: true
})
export class SiPermisoDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private permisoRequerido: string | null = null;
  private vistaCreada = false;

  constructor() {
    effect(() => {
      // Re-evaluar automaticamente cada vez que cambien los permisos del authService
      this.actualizarVista();
    });
  }

  @Input()
  set appSiPermiso(permiso: string) {
    this.permisoRequerido = permiso;
    this.actualizarVista();
  }

  private actualizarVista(): void {
    if (!this.permisoRequerido) {
      if (!this.vistaCreada) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.vistaCreada = true;
      }
      return;
    }

    const tienePermiso = this.authService.tienePermiso(this.permisoRequerido);

    if (tienePermiso && !this.vistaCreada) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.vistaCreada = true;
    } else if (!tienePermiso && this.vistaCreada) {
      this.viewContainer.clear();
      this.vistaCreada = false;
    }
  }
}
