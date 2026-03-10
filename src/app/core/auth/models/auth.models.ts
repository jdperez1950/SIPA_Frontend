import { User } from '../../models/domain.models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: boolean;
}
