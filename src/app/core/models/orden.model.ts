export interface DetalleOrden {
  id?: number;
  servicioId: number;
  servicioCodigo?: string;
  servicioNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface DetalleOrdenRequest {
  servicioId: number;
  cantidad: number;
}

export interface OrdenServicioRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleOrdenRequest[];
}

export interface OrdenServicio {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  vehiculoPlaca: string;
  vehiculoModelo?: string;
  clienteId?: number;
  clienteNombre?: string;
  kilometraje: number;
  estado: string;
  total: number;
  usuarioRegistro: string;
  motivoAnulacion?: string;
  detalles: DetalleOrden[];
}

export interface AnularOrdenRequest {
  motivo: string;
}
