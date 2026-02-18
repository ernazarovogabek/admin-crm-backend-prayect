import React, { useState, ChangeEvent, FormEvent } from "react";

interface AddAdminModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAdminModal({ onClose, onSuccess }: AddAdminModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Admin",
    status: "faol",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // API call qilish kerak
      console.log("Admin qo'shildi:", form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Admin qo'shishda xato:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded w-96 text-white"
      >
        <h3 className="text-lg mb-4">Admin qo'shish</h3>

        <input
          name="firstName"
          placeholder="Ism"
          className="w-full mb-3 p-2 rounded bg-gray-800"
          onChange={handleChange}
        />
        <input
          name="lastName"
          placeholder="Familiya"
          className="w-full mb-3 p-2 rounded bg-gray-800"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-800"
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Bekor
          </button>
          <button className="bg-white text-black px-4 py-2 rounded">
            Saqlash
          </button>
        </div>
      </form>
    </div>
  );
}
