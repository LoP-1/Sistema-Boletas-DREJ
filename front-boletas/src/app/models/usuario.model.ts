export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  dni: string;
  telefono: string;
  rol: string;
  estadoCuenta?: boolean;
  contrasena?: string;
}