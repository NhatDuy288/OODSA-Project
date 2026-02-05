import { AuthService } from "../services/auth.service";
import axiosInstance from "./axiosInstance";

export const register = (data) => {
  return axiosInstance.post("/auth/register", data);
};
export const login = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  AuthService.setToken(res.accessToken);
  AuthService.setUser(res.user);
  return res;
};
export const logout = () => {
  AuthService.logout();
};
