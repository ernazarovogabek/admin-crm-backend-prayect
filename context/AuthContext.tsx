'use client'

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  fullName: string;
  role: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || null;
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/sign-in`,
        { email, password }
      );

      const userData = res.data.data.user;
      const tokenData = res.data.data.token;

      setUser(userData);
      setToken(tokenData);

      // LocalStorage va Cookie ga saqlash
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", tokenData);
      setCookie("token", tokenData, 7);

      return true;
    } catch (err: any) {
      console.error("Login xatosi:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      deleteCookie("token");
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
