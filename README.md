# AutoAndes Frontend (SPA)

Aplicación web Single Page Application (SPA) para la gestión operativa y comercial del taller mecánico especializado **AutoAndes**. Desarrollada con **Angular 22** bajo arquitectura Standalone, programación reactiva con **Angular Signals** y tipado estricto con **TypeScript**.

---

## 🛠️ Stack Tecnológico

- **Framework:** Angular 22.2.0 (Standalone Components, sin `NgModule`)
- **Lenguaje:** TypeScript 5.6+ / 6.0 (Strict mode, ES2022)
- **Estado y Reactividad:** Angular Signals (`signal()`, `computed()`) y RxJS (`Observable`, `catchError`, `tap`)
- **Formularios:** `ReactiveFormsModule` con `NonNullableFormBuilder` y validadores síncronos
- **Estilos:** CSS3 modular, variables semánticas, Responsive Design y reglas `@media print`
- **Navegación:** Angular Router con Lazy Loading (`loadChildren`, `loadComponent`), Guards de ruta e inyección con `withComponentInputBinding()`
- **Seguridad:** Interceptor HTTP para JWT Bearer, Interceptor de Errores centralizado y directiva estructural `*appSiPermiso`

---

## 📁 Estructura del Proyecto

```
autoandes-frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Núcleo de la aplicación (Singleton)
│   │   │   ├── auth/                  # AuthService, modelos de autenticación
│   │   │   ├── config/                # Menú de navegación mapeado por permisos
│   │   │   ├── guards/                # authGuard, invitadoGuard, permisoGuard
│   │   │   ├── interceptors/          # authInterceptor (JWT), errorInterceptor (401/403/409/500)
│   │   │   ├── models/                # Interfaces TypeScript tipadas (Cliente, Servicio, Vehículo, Orden, Reporte)
│   │   │   └── services/              # Clientes HTTP hacia el backend REST
│   │   ├── features/                  # Módulos funcionales de negocio (Lazy Loaded)
│   │   │   ├── auth/login/            # Pantalla de inicio de sesión con countdown de sesión
│   │   │   ├── servicios/             # Catálogo de servicios (listado, creación y edición)
│   │   │   ├── vehiculos/             # Flota de vehículos asociados a clientes
│   │   │   ├── ordenes/               # Registro dinámico y gestión de órdenes mecánicas
│   │   │   └── reportes/              # Reporte de ingresos por servicio y gráficos relativos
│   │   ├── layout/                    # Componentes estructurales
│   │   │   ├── header/                # Barra superior con datos de usuario y logout
│   │   │   ├── sidebar/               # Menú reactivo filtrado por permisos con Signals
│   │   │   └── main-layout/           # Plantilla contenedora con router-outlet
│   │   ├── shared/                    # Recursos transversales
│   │   │   ├── directives/            # Directiva estructural *appSiPermiso
│   │   │   └── pages/                 # Páginas 403 (Acceso Denegado) y 404 (No Encontrado)
│   │   ├── app.component.ts           # Componente raíz
│   │   ├── app.config.ts              # Configuración global de providers (Router, HttpClient)
│   │   └── app.routes.ts              # Mapeo general de rutas con lazy loading
│   ├── environments/                  # Variables de entorno (URL del backend: http://localhost:8080/api)
│   ├── styles.css                     # Estilos globales, utilitarios, modales y reglas de impresión
│   └── main.ts                        # Punto de arranque de la aplicación
├── angular.json                       # Configuración de compilación Angular
├── package.json                       # Dependencias y scripts NPM
└── tsconfig.json                      # Configuración del compilador TypeScript
```

---

## 🔐 Credenciales de Prueba

| Usuario | Contraseña | Rol | Permisos Principales |
|---|---|---|---|
| `admin` | `Auto2026*` | **ADMIN** | Acceso total a todas las operaciones del taller |
| `asesor` | `Auto2026*` | **ASESOR** | Gestión de clientes, vehículos, servicios y creación de órdenes |
| `jefe` | `Auto2026*` | **JEFE_TALLER** | Anulación de órdenes, consulta de reportes consolidados y lectura |
| `inactivo` | `Auto2026*` | **ASESOR** | Cuenta desactivada (prueba respuesta 401 del servidor) |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js:** v20.x o superior
- **NPM:** v10.x o superior
- **Backend AutoAndes:** Ejecutándose en `http://localhost:8080`

### Ejecución
```bash
# Navegar a la carpeta del frontend
cd autoandes-frontend

# Iniciar el servidor de desarrollo
npm start
# o
npx ng serve --port 4200
```
La aplicación estará disponible en: [http://localhost:4200](http://localhost:4200)

### Compilación para Producción
```bash
npx ng build
```
Los archivos de distribución optimizados se generarán en la carpeta `dist/autoandes-frontend`.

---

## 🧭 Mapa de Rutas y Control de Acceso

| Ruta | Componente | Guard / Permiso Requerido | Descripción |
|---|---|---|---|
| `/login` | `LoginComponent` | `invitadoGuard` | Autenticación con credenciales |
| `/servicios` | `ServicioListComponent` | `authGuard`, `permisoGuard` (`SERVICIO_LEER`) | Catálogo de servicios |
| `/servicios/nuevo` | `ServicioFormComponent` | `authGuard`, `permisoGuard` (`SERVICIO_ESCRIBIR`) | Alta de servicio |
| `/servicios/:id/editar` | `ServicioFormComponent` | `authGuard`, `permisoGuard` (`SERVICIO_ESCRIBIR`) | Modificación de servicio |
| `/vehiculos` | `VehiculoListComponent` | `authGuard`, `permisoGuard` (`VEHICULO_LEER`) | Listado de vehículos |
| `/vehiculos/nuevo` | `VehiculoFormComponent` | `authGuard`, `permisoGuard` (`VEHICULO_ESCRIBIR`) | Alta de vehículo |
| `/vehiculos/:id/editar` | `VehiculoFormComponent` | `authGuard`, `permisoGuard` (`VEHICULO_ESCRIBIR`) | Edición de vehículo |
| `/ordenes` | `OrdenListComponent` | `authGuard`, `permisoGuard` (`ORDEN_LEER`) | Historial y anulación de órdenes |
| `/ordenes/nuevo` | `OrdenFormComponent` | `authGuard`, `permisoGuard` (`ORDEN_CREAR`) | Creación reactiva de orden |
| `/reportes` | `ReporteIngresosComponent` | `authGuard`, `permisoGuard` (`REPORTE_INGRESOS`) | Consolidado de ingresos |
| `/acceso-denegado` | `AccesoDenegadoComponent` | Público | Pantalla informativa 403 |
| `**` | `NoEncontradoComponent` | Público | Pantalla 404 |

---

## 💡 Aspectos Técnicos Destacados

1. **Gestión Reactiva con Signals:**
   - La barra lateral calcula dinámicamente qué opciones de menú mostrar en base a los permisos del usuario conectado con `computed()`.
   - Búsquedas y filtros en tiempo real sin recargar página.
   - Cálculo en vivo del subtotal y total estimado en el registro de órdenes.

2. **Directiva `*appSiPermiso`:**
   - Renderiza u oculta elementos del DOM (botones como "+ Nueva Orden", "Anular", "Eliminar") según los permisos efectivos en el token JWT.

3. **Mapeo de Errores de Validación de Backend (RFC 7807 / Problem Details):**
   - Cuando el backend retorna error `400 Bad Request` con mapa `campos`, el formulario resalta los controles exactos y muestra el mensaje devuelto por el servidor.
   - En caso de conflicto de negocio (`409 Conflict`), se muestra una alerta superior sin borrar los campos ni las líneas ingresadas.

4. **Soporte de Impresión:**
   - Hojas de estilo `@media print` para imprimir órdenes de servicio y reportes de ingresos en formato A4 limpio omitiendo elementos de navegación.
