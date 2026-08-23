import api from "./axios";
import type { User } from "../types/auth";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/user/me");

  return response.data;
};