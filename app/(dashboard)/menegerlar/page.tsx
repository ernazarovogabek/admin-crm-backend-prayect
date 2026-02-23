"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status?: string;
  work_date?: string;
}

interface NewManager {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  work_date: string;
  role: string;
}

const ManagersPage: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [newManager, setNewManager] = useState<NewManager>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    work_date: new Date().toISOString().split('T')[0],
    role: "manager",
  });
  const router = useRouter();

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Turli endpoint nomlarini sinab ko'ramiz
      let response;
      try {
        response = await axios.get("/api/staff/all-managers", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            response = await axios.get("/api/staff/managers", {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err2: any) {
            if (err2.response?.status === 404) {
              response = await axios.get("/api/staff/get-all-managers", {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }

      const data = response.data?.data || response.data || [];
      
      // Backend dan kelgan ma'lumotlarni formatlash
      const formattedData = Array.isArray(data) ? data.map((manager: any) => {
        console.log("Manager obyekti:", manager);
        return {
          id: manager.id || manager._id || manager.staff_id,
          first_name: manager.first_name,
          last_name: manager.last_name,
          email: manager.email,
          role: manager.role,
          status: manager.status || 'faol',
          work_date: manager.work_date
        };
      }) : [];
      
      console.log("Formatted managers:", formattedData);
      setManagers(formattedData);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Xatolik:", error);
        setError("Manager ma'lumotlarini olishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [router]);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    const { first_name, last_name, email, password, work_date } = newManager;
    if (!first_name || !last_name || !email || !password || !work_date) {
      alert("Iltimos barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setAdding(true);
      const token = localStorage.getItem("token");

      console.log("Yuborilayotgan ma'lumot:", newManager);

      // Turli endpoint nomlarini sinab ko'ramiz
      let response;
      let success = false;
      const endpoints = [
        "/api/staff/create-manager",
        "/api/staff/add-manager", 
        "/api/staff/manager",
        "/api/staff/create-admin" // Manager ham admin kabi yaratilishi mumkin
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Sinab ko'rilmoqda: ${endpoint}`);
          response = await axios.post(endpoint, newManager, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`${endpoint} ishladi!`, response.data);
          success = true;
          break;
        } catch (err: any) {
          console.log(`${endpoint} ishlamadi:`, err.response?.status, err.response?.data?.message);
          // 404 va 403 xatoliklarda keyingi endpointni sinab ko'ramiz
          if (err.response?.status !== 404 && err.response?.status !== 403) {
            // Boshqa xatolik bo'lsa, to'xtatamiz
            throw err;
          }
        }
      }

      if (!success) {
        throw new Error("Manager qo'shish uchun ruxsat yo'q yoki endpoint topilmadi. Backend administratorga murojaat qiling.");
      }

      fetchManagers();
      setNewManager({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        work_date: new Date().toISOString().split('T')[0],
        role: "manager",
      });
      setShowModal(false);
      alert("Manager muvaffaqiyatli qo'shildi");
    } catch (error) {
      const err = error as AxiosError<any>;
      console.error("Xatolik:", err.response?.data);
      console.error("Status:", err.response?.status);
      
      let errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status === 403) {
        errorMessage = "Ruxsat yo'q: Sizning hisobingiz manager qo'shishga ruxsat bermaydi. Backend administratorga murojaat qiling.";
      }
      
      alert(`Manager qo'shishda xato: ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Managerni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/staff/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers((prev) => prev.filter((m) => m.id !== id));
      alert("Manager muvaffaqiyatli o'chirildi");
    } catch (error: any) {
      console.error("Faqat rahbarga manager o'chirishga ruxsat beriladi", error);
      
      if (error.response?.status === 403) {
        alert("Faqat rahbarga manager o'chirishga ruxsat beriladi");
      } else {
        alert("Faqat rahbarga manager o'chirishga ruxsat beriladi");
      }
    }
  };

  const handleEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;

    try {
      const token = localStorage.getItem("token");
      
      const managerData = {
        id: editingManager.id,
        first_name: editingManager.first_name,
        last_name: editingManager.last_name,
        email: editingManager.email,
        role: editingManager.role
      };
      
      console.log("Yuborilayotgan ma'lumot:", managerData);
      
      await axios.post("/api/staff/edited-manager", managerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditModal(false);
      setEditingManager(null);
      fetchManagers();
      alert("Manager muvaffaqiyatli tahrirlandi!");
    } catch (err: any) {
      console.error("Xatolik:", err.response?.data);
      
      if (err.response?.status === 403) {
        alert("Faqat rahbarga manager tahrirlashga ruxsat beriladi");
      } else {
        alert(`Manager tahrirlashda xatolik: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) return (
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
  if (error) return <div className="p-6"><p className="text-red-600 dark:text-red-400">{error}</p></div>;

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ism
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Familya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {managers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {manager.first_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {manager.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {manager.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {manager.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      manager.status === 'faol'
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
                        e.target.value = ''; // Reset select
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  value={newManager.first_name}
                  onChange={(e) => setNewManager({...newManager, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Familya
                </label>
                <input
                  type="text"
                  required
                  value={newManager.last_name}
                  onChange={(e) => setNewManager({...newManager, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newManager.email}
                  onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parol
                </label>
                <input
                  type="password"
                  required
                  value={newManager.password}
                  onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ish boshlagan sana
                </label>
                <input
                  type="date"
                  required
                  value={newManager.work_date}
                  onChange={(e) => setNewManager({...newManager, work_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {adding ? "Qo'shilmoqda..." : "Qo'shish"}
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
              <p className="dark:text-gray-300">
                <span className="font-semibold">Ism:</span> {selectedManager.first_name}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-semibold">Familya:</span> {selectedManager.last_name}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-semibold">Email:</span> {selectedManager.email}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-semibold">Rol:</span> {selectedManager.role}
              </p>
              {selectedManager.work_date && (
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Ish boshlanish sanasi:</span> {selectedManager.work_date}
                </p>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  value={editingManager.first_name}
                  onChange={(e) => setEditingManager({...editingManager, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Familya
                </label>
                <input
                  type="text"
                  required
                  value={editingManager.last_name}
                  onChange={(e) => setEditingManager({...editingManager, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editingManager.email}
                  onChange={(e) => setEditingManager({...editingManager, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol
                </label>
                <select
                  value={editingManager.role}
                  onChange={(e) => setEditingManager({...editingManager, role: e.target.value})}
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
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Saqlash
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
};

export default ManagersPage;
