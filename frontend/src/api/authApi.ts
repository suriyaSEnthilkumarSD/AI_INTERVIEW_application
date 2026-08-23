import api from "./axios";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export const registerUser = async (data: RegisterRequest) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const verifyOTP = async (
  data: VerifyOTPRequest
) => {
  const response = await api.post("/auth/verify-otp", data);

  return response.data;
};

export const resendOTP = async (
  data: ResendOTPRequest
) => {
  const response = await api.post("/auth/resend-otp", data);

  return response.data;
};

export const loginUser = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export const refreshAccessToken = async (
  data: RefreshTokenRequest
) => {
  const response = await api.post(
    "/auth/refresh",
    data
  );

  return response.data;
};

export const logoutUser = async (
  data: LogoutRequest
) => {
  const response = await api.post(
    "/auth/logout",
    data
  );

  return response.data;
};