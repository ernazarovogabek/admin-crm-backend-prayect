'use client'

import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// Cookie helper functions
function setCookie(name, value, days = 7) {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
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

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || null;
    }
    return null;
  });

  const login = async (email, password) => {
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
    } catch (err) {
      console.error("Login xatosi:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      deleteCookie("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
