export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombrecompleto: string;
  roles: string[];
  permisos: string[];
}

export interface SesionUsuario {
  token: string;
  username: string;
  nombrecompleto: string;
  roles: string[];
  permisos: string[];
  expiraEn: number; // timestamp en milisegundos
}

export interface UsuarioPerfil {
  id: number;
  username: string;
  nombrecompleto: string;
  activo: boolean;
  roles: string[];
  permisos: string[];
}
