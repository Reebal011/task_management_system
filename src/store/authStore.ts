// store/authStore.ts
import { create } from "zustand";
import { User } from "@/types/user";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    Cookies.set("token", token);
    Cookies.set("user", JSON.stringify(user));

    set({
      token,
      user,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
    Cookies.remove("user");

    set({ user: null, token: null });
  },
}));
