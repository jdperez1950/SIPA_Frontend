export interface User {
  id: string;
  name: string;
  role: 'ASESOR' | 'USUARIO' | 'SISTEMA' | 'ADMIN';
  email?: string;
}
