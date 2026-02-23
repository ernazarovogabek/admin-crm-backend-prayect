"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  createdAt?: string;
  image?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function ProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log("LocalStorage dan olingan user:", userData);
            
            const profile: UserProfile = {
              first_name: userData.first_name || userData.firstName || "",
              last_name: userData.last_name || userData.lastName || "",
              email: userData.email || "",
              role: userData.role || userData.user_role || "USER",
              createdAt: userData.createdAt || userData.created_at || userData.createddate || "",
              image: userData.image || userData.profile_img || userData.avatar || "",
            };
            
            console.log("Profile ma'lumotlari:", profile);
            setUser(profile);
            setFirstName(profile.first_name);
            setLastName(profile.last_name);
            setEmail(profile.email);
          } catch (e) {
            console.error("LocalStorage dan ma'lumot o'qishda xatolik:", e);
          }
        }
      } catch (err) {
        console.error("Profil ma'lumotlarini olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const onSave = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.");
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        "/api/auth/edit-profile",
        {
          first_name: firstName,
          last_name: lastName,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.user || res.data?.data || res.data?.result || null;
      if (updated && typeof updated === "object") {
        setUser({ ...user, ...updated } as UserProfile);
        localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
        updateUser({ 
          first_name: updated.first_name || firstName,
          last_name: updated.last_name || lastName,
          email: updated.email || email,
          fullName: `${updated.first_name || firstName} ${updated.last_name || lastName}`
        });
      } else {
        const updatedUser = {
          ...(user || {}),
          first_name: firstName,
          last_name: lastName,
          email,
        };
        setUser(updatedUser as UserProfile);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        updateUser({ 
          first_name: firstName,
          last_name: lastName,
          email,
          fullName: `${firstName} ${lastName}`
        });
      }

      alert("Yangilandi ✅");
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(e.response?.data?.message || "Network xatolik");
      }
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, user, router]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Rasm formatini tekshirish
    if (!file.type.startsWith('image/')) {
      alert("Faqat rasm fayllarini yuklash mumkin!");
      return;
    }

    // Rasm hajmini tekshirish (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan kichik bo'lishi kerak!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.");
      router.push("/login");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "/api/auth/edit-profile-img",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedImage = res.data?.data?.image || res.data?.image || res.data?.data?.profile_img;
      
      if (updatedImage) {
        const updatedUser = { ...user, image: updatedImage };
        setUser(updatedUser as UserProfile);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        updateUser({ image: updatedImage });
        alert("Rasm muvaffaqiyatli yuklandi! ✅");
      }
    } catch (e: any) {
      console.error("Rasm yuklashda xatolik:", e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(e.response?.data?.message || "Rasm yuklashda xatolik");
      }
    } finally {
      setUploadingImage(false);
    }
  }, [user, router]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.");
      router.push("/login");
      return;
    }

    setChangingPassword(true);
    try {
      await axios.post(
        "/api/auth/edit-password",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Parol muvaffaqiyatli o'zgartirildi! ✅");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      console.error("Parol o'zgartirishda xatolik:", e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(e.response?.data?.message || "Parol o'zgartirishda xatolik");
      }
    } finally {
      setChangingPassword(false);
    }
  }, [oldPassword, newPassword, router]);

  const avatarSrc = user?.image || "/avatar.png";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 group cursor-pointer">
            {user?.image ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white rounded-full">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            )}
            
            {/* Upload overlay */}
            <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all cursor-pointer rounded-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingImage ? (
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Qo&apos;shilgan: {formatDate(user?.createdAt)}
            </div>
          </div>
        </div>
        <div className={`px-4 py-1 rounded text-sm font-bold uppercase ${
          user?.role?.toLowerCase() === 'manager' ? 'bg-blue-600' : 
          user?.role?.toLowerCase() === 'admin' ? 'bg-red-600' : 
          'bg-gray-600'
        } text-white`}>
          {user?.role || "MANAGER"}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <h2 className="text-xl font-bold mb-2">Profil ma&apos;lumotlari</h2>
        <p className="text-gray-400 text-sm mb-6">
          O&apos;zgarishlarni kiritib, yangilashingiz mumkin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ism */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ism</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Familiya */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Familiya</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rol</label>
            <input
              type="text"
              value={user?.role || ""}
              disabled
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-2 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-white text-black rounded font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saqlanmoqda..." : "O'zgartirish"}
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 border border-gray-700 text-white rounded font-medium hover:bg-gray-900 transition"
          >
            Parol ni O&apos;zgartirish
          </button>
        </div>
      </div>

      {/* Parol o'zgartirish Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-2xl relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-bold mb-8 text-white">Edit Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-base text-white mb-3 font-medium">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-700 rounded-xl px-5 py-4 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition"
                  placeholder="Current password"
                />
              </div>
              
              <div>
                <label className="block text-base text-white mb-3 font-medium">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-700 rounded-xl px-5 py-4 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition"
                  placeholder="New password"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {changingPassword ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
