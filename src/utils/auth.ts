import { useAuthStore } from "@/store/authStore";

export const checkRole = (requiredRole: "admin" | "user"): boolean => {
  const user = useAuthStore.getState().user;
  return user?.role === requiredRole;
};

export const isAdmin = (): boolean => {
  return checkRole("admin");
};

export const isUser = (): boolean => {
  return checkRole("user");
};

export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

export const isAuthenticated = (): boolean => {
  const { user, token } = useAuthStore.getState();
  return !!user && !!token;
};
