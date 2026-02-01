export interface User {
  id: string;
  name: string;
  role: 'ASESOR' | 'USUARIO' | 'SISTEMA' | 'ADMIN' | 'ORGANIZACION';
  email?: string;
}
