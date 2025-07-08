export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    authenticated: boolean;
    role: number;
  } | null;
}

export interface LogoutResponse {
  code: number;
  message: string;
  data: null;
}


export interface UpdatePasswordRequest {
  password: string;
  oldPassword: string;
}