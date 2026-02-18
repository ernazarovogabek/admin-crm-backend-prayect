'use client'

import React, { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { MdLightMode, MdDarkMode } from 'react-icons/md';

// Cookie helper function
function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "/api/auth/sign-in",
        { email, password }
      );

      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      // LocalStorage va Cookie ga saqlash
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCookie("token", token, 7);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email yoki parol xato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <MdLightMode className="text-2xl text-yellow-400" />
        ) : (
          <MdDarkMode className="text-2xl text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-sm h-[420px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm p-6">
        <h1 className="text-xl items-center justify-center font-semibold flex text-gray-800 dark:text-gray-100 mb-5">
          Xush kelibsiz 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
          Hisobingizga kirish uchun email va parolni kiriting
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="usern88@mail.ru"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full h-[50px] mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Parol</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full h-[50px] px-3 mb-5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;