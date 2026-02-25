'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { fetchManagers, createManager, updateManager, deleteManager, type Manager, type NewManager } from "@/lib/queries/managerQueries";

export default function MenegerlarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [newManager, setNewManager] = useState<NewManager>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    work_date: new Date().toISOString().split('T')[0],
    role: "manager",
  });

  // Menegerlarni olish
  const { data: managers = [], isLoading, isError } = useQuery({
    queryKey: ['managers'],
    queryFn: fetchManagers,
    retry: 1,
  });

  // Meneger qo'shish
  const createMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      setShowModal(false);
      setNewManager({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        work_date: new Date().toISOString().split('T')[0],
        role: "manager",
      });
      toast.success("Manager muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => {
      let errorMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 403) {
        errorMessage = "Ruxsat yo'q: Sizning hisobingiz manager qo'shishga ruxsat bermaydi.";
      }
      toast.error(`Manager qo'shishda xato: ${errorMessage}`);
    },
  });

  // Meneger tahrirlash
  const updateMutation = useMutation({
    mutationFn: updateManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      setShowEditModal(false);
      setEditingManager(null);
      toast.success("Manager muvaffaqiyatli tahrirlandi!");
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("Faqat rahbarga manager tahrirlashga ruxsat beriladi");
      } else {
        toast.error(`Manager tahrirlashda xatolik: ${error.response?.data?.message || error.message}`);
      }
    },
  });

  // Meneger o'chirish
  const deleteMutation = useMutation({
    mutationFn: deleteManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      toast.success("Manager muvaffaqiyatli o'chirildi!");
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("Faqat rahbarga manager o'chirishga ruxsat beriladi");
      } else {
        toast.error("Faqat rahbarga manager o'chirishga ruxsat beriladi");
      }
    },
  });

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    const { first_name, last_name, email, password, work_date } = newManager;
    if (!first_name || !last_name || !email || !password || !work_date) {
      alert("Iltimos barcha maydonlarni to'ldiring");
      return;
    }
    createMutation.mutate(newManager);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Managerni o'chirmoqchimisiz?")) return;
    deleteMutation.mutate(id);
  };

  const handleEditManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    updateMutation.mutate(editingManager);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ism</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Familya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-600 dark:text-red-400">Manager ma'lumotlarini olishda xatolik yuz berdi.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Managerlar Ro'yxati</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          + Manager qo'shish
        </button>
      </div>

      {managers.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha manager yo'q.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ism</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Familya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {managers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{manager.first_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{manager.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{manager.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {manager.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.status === 'faol'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : manager.status === "ta'tilda" || manager.status === 'tatilda'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {manager.status === 'faol' ? 'Faol' : (manager.status === "ta'tilda" || manager.status === 'tatilda') ? "Ta'tilda" : "Ishdan bo'shatilgan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'view') {
                          setSelectedManager(manager);
                          setShowInfoModal(true);
                        } else if (action === 'edit') {
                          setEditingManager(manager);
                          setShowEditModal(true);
                        } else if (action === 'delete') {
                          handleDelete(manager.id);
                        }
                        e.target.value = '';
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">...</option>
                      <option value="view">Ko'rish</option>
                      <option value="edit">Tahrirlash</option>
                      <option value="delete">O'chirish</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manager qo'shish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Manager qo'shish</h2>
            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input
                  type="text"
                  required
                  value={newManager.first_name}
                  onChange={(e) => setNewManager({ ...newManager, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input
                  type="text"
                  required
                  value={newManager.last_name}
                  onChange={(e) => setNewManager({ ...newManager, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
                <input
                  type="password"
                  required
                  value={newManager.password}
                  onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ish boshlagan sana</label>
                <input
                  type="date"
                  required
                  value={newManager.work_date}
                  onChange={(e) => setNewManager({ ...newManager, work_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {createMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager ma'lumotlari Modal */}
      {showInfoModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Manager ma'lumotlari</h2>
            <div className="space-y-3 mb-6">
              <p className="dark:text-gray-300"><span className="font-semibold">Ism:</span> {selectedManager.first_name}</p>
              <p className="dark:text-gray-300"><span className="font-semibold">Familya:</span> {selectedManager.last_name}</p>
              <p className="dark:text-gray-300"><span className="font-semibold">Email:</span> {selectedManager.email}</p>
              <p className="dark:text-gray-300"><span className="font-semibold">Rol:</span> {selectedManager.role}</p>
              {selectedManager.work_date && (
                <p className="dark:text-gray-300"><span className="font-semibold">Ish boshlanish sanasi:</span> {selectedManager.work_date}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setSelectedManager(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedManager.id);
                  setShowInfoModal(false);
                  setSelectedManager(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager tahrirlash Modal */}
      {showEditModal && editingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Manager tahrirlash</h2>
            <form onSubmit={handleEditManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input
                  type="text"
                  required
                  value={editingManager.first_name}
                  onChange={(e) => setEditingManager({ ...editingManager, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input
                  type="text"
                  required
                  value={editingManager.last_name}
                  onChange={(e) => setEditingManager({ ...editingManager, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingManager.email}
                  onChange={(e) => setEditingManager({ ...editingManager, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                <select
                  value={editingManager.role}
                  onChange={(e) => setEditingManager({ ...editingManager, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingManager(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
