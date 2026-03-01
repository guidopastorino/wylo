// Tipos de dominio compartidos

export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  name: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}
