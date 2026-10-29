# AutoAndes Frontend (SPA)

Aplicación web empresarial Single Page Application (SPA) para la administración operativa, comercial y financiera del taller mecánico especializado **AutoAndes**. Desarrollada bajo arquitectura moderna con **Angular 22 Standalone**, programación reactiva basada en **Angular Signals**, tipado estricto con **TypeScript**, y control de acceso basado en permisos granulares (RBAC).

---

## 🏛️ Arquitectura del Sistema Frontend

La aplicación implementa una arquitectura modular por capas desacopladas, asegurando alta cohesión, bajo acoplamiento y carga diferida (*Lazy Loading*) en todos los módulos de negocio:

```
src/app/
├── core/                               # Módulos transversales singleton
│   ├── auth/                           # AuthService con Signals y almacenamiento seguro en sessionStorage
│   ├── config/                         # Definición de navegación y menú dinámico mapeado por permisos
│   ├── guards/                         # authGuard, invitadoGuard, permisoGuard
│   ├── interceptors/                   # authInterceptor (JWT Bearer) y errorInterceptor (Manejo global de errores)
│   ├── models/                         # Interfaces TypeScript fuertemente tipadas (Cliente, Servicio, Vehículo, Orden, Reporte)
│   └── services/                       # Servicios HTTP para el consumo de la API REST
├── features/                           # Módulos funcionales de negocio (Lazy Loading independiente)
│   ├── auth/login/                     # Vista de autenticación con temporizador de expiración de sesión
│   ├── servicios/                      # Gestión de catálogo de servicios (listado, búsqueda, creación y edición)
│   ├── vehiculos/                      # Flota de vehículos vinculados a clientes con validaciones de placa
│   ├── ordenes/                        # Apertura reactiva y gestión de órdenes mecánicas con anulación justificada
│   └── reportes/                       # Consolidado de ingresos por servicio, barras relativas y soporte de impresión
├── layout/                             # Componentes de estructura visual
│   ├── header/                         # Barra superior con datos del usuario, cuenta regresiva y cierre de sesión
│   ├── sidebar/                        # Menú de navegación reactivo computado según permisos del usuario conectado
│   └── main-layout/                    # Contenedor estructural con <router-outlet />
└── shared/                             # Componentes y utilitarios reutilizables
    ├── directives/                     # Directiva estructural *appSiPermiso para renderizado condicional en DOM
    └── pages/                          # Vistas de estado HTTP 403 (Acceso Denegado) y 404 (Página No Encontrada)
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Framework Web** | Angular | 22.2.0 | Framework SPA con Standalone Components (sin `NgModule`) |
| **Lenguaje** | TypeScript | 5.6+ / 6.0 | Tipado estático estricto y características modernas ES2022 |
| **Gestión de Estado** | Angular Signals | 22.x | Reactividad fina mediante `signal()`, `computed()` y `effect()` |
| **Flujos Asíncronos** | RxJS | 7.8.x | Manejo de peticiones HTTP, cancelación y transformaciones |
| **Formularios** | ReactiveFormsModule | 22.x | Formularios reactivos con `NonNullableFormBuilder` y validaciones síncronas |
| **Navegación** | Angular Router | 22.x | Enrutamiento con Lazy Loading y enlace con `withComponentInputBinding()` |
| **Cliente HTTP** | HttpClient | 22.x | Interceptores funcionales para inyección de token JWT y control de errores |
| **Estilos** | CSS3 Modular | Estándar | Diseño responsivo, componentes visuales propios y reglas `@media print` |

---

## 🔐 Matriz de Seguridad y Roles de Usuario

La interfaz de usuario adapta reactivamente su presentación y opciones de navegación de acuerdo con los permisos devueltos en el token JWT del usuario conectado:

| Usuario | Contraseña | Rol Asignado | Estado | Capacidades en la Interfaz |
|---|---|---|---|---|
| **`admin`** | `Auto2026*` | `ROLE_ADMIN` | Activo | Acceso integral a todos los módulos: servicios, vehículos, órdenes, anulación y reportes |
| **`asesor`** | `Auto2026*` | `ROLE_ASESOR` | Activo | Registro de vehículos, consulta de servicios, creación de órdenes de trabajo mecánicas |
| **`jefe`** | `Auto2026*` | `ROLE_JEFE_TALLER` | Activo | Administración del catálogo de servicios, anulación justificada de órdenes y consulta de reportes |
| **`inactivo`**| `Auto2026*` | `ROLE_ASESOR` | Inactivo | Bloqueado por el servidor (Muestra error 401 en login sin exponer detalles internos) |

---

## 🧭 Mapa de Enrutamiento y Protección con Guards

| Ruta | Componente | Estrategia de Carga | Guard / Permiso Requerido |
|---|---|---|---|
| `/login` | `LoginComponent` | Eager | `invitadoGuard` |
| `/servicios` | `ServicioListComponent` | Lazy (`loadChildren`) | `authGuard`, `permisoGuard` (`SERVICIO_LEER`) |
| `/servicios/nuevo` | `ServicioFormComponent` | Lazy (`loadComponent`) | `authGuard`, `permisoGuard` (`SERVICIO_ESCRIBIR`) |
| `/servicios/:id/editar` | `ServicioFormComponent` | Lazy (`loadComponent`) | `authGuard`, `permisoGuard` (`SERVICIO_ESCRIBIR`) |
| `/vehiculos` | `VehiculoListComponent` | Lazy (`loadChildren`) | `authGuard`, `permisoGuard` (`VEHICULO_LEER`) |
| `/vehiculos/nuevo` | `VehiculoFormComponent` | Lazy (`loadComponent`) | `authGuard`, `permisoGuard` (`VEHICULO_ESCRIBIR`) |
| `/vehiculos/:id/editar` | `VehiculoFormComponent` | Lazy (`loadComponent`) | `authGuard`, `permisoGuard` (`VEHICULO_ESCRIBIR`) |
| `/ordenes` | `OrdenListComponent` | Lazy (`loadChildren`) | `authGuard`, `permisoGuard` (`ORDEN_LEER`) |
| `/ordenes/nuevo` | `OrdenFormComponent` | Lazy (`loadComponent`) | `authGuard`, `permisoGuard` (`ORDEN_REGISTRAR`) |
| `/reportes` | `ReporteIngresosComponent` | Lazy (`loadChildren`) | `authGuard`, `permisoGuard` (`REPORTE_VER`) |
| `/acceso-denegado` | `AccesoDenegadoComponent` | Standalone | Público |
| `**` | `NoEncontradoComponent` | Standalone | Público |

---

## 💡 Aspectos Técnicos Destacados

### 1. Menú Dinámico Reactivo con Signals
El componente `SidebarComponent` utiliza `computed()` para proyectar en tiempo real los ítems de navegación autorizados a partir de los permisos contenidos en la sesión actual (`AuthService.permisos`). Al cambiar de usuario o cerrar sesión, la barra lateral se redibuja sin recargar la página.

### 2. Directiva Estructural `*appSiPermiso`
Oculta o muestra elementos clave en la vista (por ejemplo, botones "+ Nueva Orden", "Anular" o "Eliminar") garantizando que el DOM solo exponga acciones permitidas para el perfil en sesión.

### 3. Registro Dinámico de Órdenes y Validación Oficial en Servidor
- La pantalla de apertura de órdenes (`OrdenFormComponent`) implementa un `FormArray` reactivo que permite añadir entre 1 y 10 líneas de detalle con cantidades de 1 a 5 unidades.
- Calcula estimaciones locales instantáneas para experiencia de usuario.
- Cumple la prohibición estricta de no liquidar importes finales en el cliente: el backend es la autoridad exclusiva que valida precios activos, coherencia de kilometraje (RN-04) y calcula los subtotales y totales.
- Si el servidor rechaza la transacción (`400` o `409 Conflict`), la interfaz conserva intactos todos los datos ingresados por el usuario para su corrección.

### 4. Manejo Centralizado de Errores y RFC 7807
El interceptor `errorInterceptor` captura respuestas con código `401 Unauthorized` redirigiendo al login, maneja respuestas `403 Forbidden` redirigiendo a `/acceso-denegado`, y los formularios mapean el diccionario `campos` de los errores `400 Bad Request` directamente bajo cada control de entrada afectado.

### 5. Salida para Impresión Limpia
Tanto las órdenes de servicio como el reporte consolidado de ingresos incorporan reglas CSS `@media print` para generar comprobantes en formato A4 limpio omitiendo cabeceras web, barras laterales y botones de acción.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js:** v20.x o superior
- **NPM:** v10.x o superior
- **Backend AutoAndes:** Ejecutándose en `http://localhost:8080`

### Instrucciones de Ejecución
```bash
# 1. Navegar a la carpeta del frontend
cd autoandes-frontend

# 2. Iniciar el servidor de desarrollo en el puerto 4200
npm start
# o alternativamente:
npx ng serve --port 4200
```

Abrir el navegador en: [http://localhost:4200](http://localhost:4200)

### Compilación para Producción
```bash
npx ng build
```
Los artefactos compilados y minificados se generarán en `dist/autoandes-frontend`.

---

## 🌿 Estrategia de Versionamiento (Git Flow)

El proyecto frontend sigue el modelo Git Flow con commits semánticos:
- `main`: Rama de despliegue y producción etiquetada con `v1.0-examen-u2`.
- `develop`: Rama de integración continua.
- `examen-a-gamarra`: Rama de implementación de características y vistas.
