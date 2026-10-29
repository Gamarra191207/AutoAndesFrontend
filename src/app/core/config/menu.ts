export interface MenuItem {
  etiqueta: string;
  ruta: string;
  icono: string;
  permiso?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    etiqueta: 'Servicios',
    ruta: '/servicios',
    icono: '🔧',
    permiso: 'SERVICIO_LEER'
  },
  {
    etiqueta: 'Vehículos',
    ruta: '/vehiculos',
    icono: '🚗',
    permiso: 'VEHICULO_LEER'
  },
  {
    etiqueta: 'Órdenes de Servicio',
    ruta: '/ordenes',
    icono: '📋',
    permiso: 'ORDEN_LEER'
  },
  {
    etiqueta: 'Reporte de Ingresos',
    ruta: '/reportes',
    icono: '📊',
    permiso: 'REPORTE_VER'
  }
];
