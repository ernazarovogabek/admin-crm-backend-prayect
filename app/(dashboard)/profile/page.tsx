"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  type UserProfile,
  type UpdateProfileData,
  type ChangePasswordData
} from "@/lib/queries/profileQueries";

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
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Query
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: 1,
  });

  // User ma'lumotlari kelganda state'ni yangilash
  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
    }
  }, [user]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const updated = response?.user || response?.data || response?.result || null;

      if (updated && typeof updated === "object") {
        const updatedUser = { ...user, ...updated };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        queryClient.setQueryData(['profile'], updatedUser);
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
        localStorage.setItem("user", JSON.stringify(updatedUser));
        queryClient.setQueryData(['profile'], updatedUser);
        updateUser({
          first_name: firstName,
          last_name: lastName,
          email,
          fullName: `${firstName} ${lastName}`
        });
      }

      alert("Yangilandi ✅");
    },
    onError: (error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(error.response?.data?.message || "Network xatolik");
      }
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (response) => {
      const updatedImage = response?.data?.image || response?.image || response?.data?.profile_img;

      if (updatedImage) {
        const updatedUser = { ...user, image: updatedImage };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        queryClient.setQueryData(['profile'], updatedUser);
        updateUser({ image: updatedImage });
        alert("Rasm muvaffaqiyatli yuklandi! ✅");
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(error.response?.data?.message || "Rasm yuklashda xatolik");
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      alert("Parol muvaffaqiyatli o'zgartirildi! ✅");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    },
    onError: (error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(error.response?.data?.message || "Parol o'zgartirishda xatolik");
      }
    },
  });

  // Handlers
  const handleSave = () => {
    updateProfileMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Faqat rasm fayllarini yuklash mumkin!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan kichik bo'lishi kerak!");
      return;
    }

    updateImageMutation.mutate(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    changePasswordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword,
    });
  };

  const avatarSrc = user?.image || "/avatar.png";

  if (isLoading) {
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
                disabled={updateImageMutation.isPending}
                className="hidden"
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {updateImageMutation.isPending ? (
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
            <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Qo&apos;shilgan: {formatDate(user?.createdAt)}
            </div>
          </div>
        </div>

        <div className={`px-4 py-1 rounded text-sm font-bold uppercase ${user?.role?.toLowerCase() === 'manager' ? 'bg-blue-600' :
          user?.role?.toLowerCase() === 'admin' ? 'bg-red-600' :
            'bg-gray-600'
          } text-white`}>
          {user?.role || "MANAGER"}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <h2 className="text-xl font-bold mb-2">Profil ma&apos;lumotlari</h2>
        <p className="text-gray-400 text-sm mb-6">O&apos;zgarishlarni kiritib, yangilashingiz mumkin.</p>

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
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="px-6 py-2 bg-white text-black rounded font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? "Saqlanmoqda..." : "O'zgartirish"}
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
                  disabled={changePasswordMutation.isPending}
                  className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {changePasswordMutation.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
