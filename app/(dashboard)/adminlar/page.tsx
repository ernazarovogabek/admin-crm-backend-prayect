"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
}

interface NewAdmin {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  workDate: string;
}

const AdminlarPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [leaveData, setLeaveData] = useState({
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
    workDate: new Date().toISOString().split('T')[0]
  });
  const router = useRouter();

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("/api/staff/all-admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || [];
      
      const formattedData = Array.isArray(data) ? data.map((admin: any) => ({
        id: admin.id || admin._id || admin.staff_id,
        firstName: admin.first_name || admin.firstName,
        lastName: admin.last_name || admin.lastName,
        email: admin.email,
        role: admin.role,
        status: admin.status || 'faol'
      })) : [];
      
      setAdmins(formattedData);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Xatolik:", error);
        setError("Admin ma'lumotlarini olishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter va search
  useEffect(() => {
    let filtered = [...admins];

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(admin => admin.status === selectedStatus);
    }

    // Search filter
    if (searchValue.trim() !== "") {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(admin => 
        admin.firstName.toLowerCase().includes(search) ||
        admin.lastName.toLowerCase().includes(search) ||
        admin.email.toLowerCase().includes(search)
      );
    }

    setFilteredAdmins(filtered);
  }, [admins, selectedStatus, searchValue]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const adminData = {
        first_name: newAdmin.firstName,
        last_name: newAdmin.lastName,
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role,
        work_date: newAdmin.workDate
      };
      
      await axios.post("/api/staff/create-admin", adminData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "admin",
        workDate: new Date().toISOString().split('T')[0]
      });
      fetchAdmins();
      alert("Admin muvaffaqiyatli qo'shildi!");
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Admin qo'shishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      const token = localStorage.getItem("token");
      
      const adminData = {
        _id: editingAdmin.id,
        first_name: editingAdmin.firstName,
        last_name: editingAdmin.lastName,
        email: editingAdmin.email,
        status: editingAdmin.status
      };

      console.log("Yuborilayotgan ma'lumot:", adminData);

      await axios.post('/api/staff/edited-admin', adminData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins();
      alert("Admin muvaffaqiyatli tahrirlandi!");
    } catch (err: any) {
      console.error("Xatolik:", err.response?.data);
      alert(`Admin tahrirlashda xatolik: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleViewInfo = async (adminId: number) => {
    setLoadingInfo(true);
    setShowInfoModal(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`/api/staff/info/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Admin ma'lumotlari:", response.data);
      setSelectedAdmin(response.data?.data || response.data);
    } catch (err: any) {
      console.error("Xatolik:", err.response?.data);
      alert(`Admin ma'lumotlarini olishda xatolik: ${err.response?.data?.message || err.message}`);
      setShowInfoModal(false);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!window.confirm("Adminni ishdan bo'shatmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");
      
      const endpoints = [
       
        '/api/staff/deleted-admin',
       
      ];

      const idFormats = [
        { _id: adminId },
        { id: adminId },
        { staff_id: adminId }
      ];

      let success = false;

      for (const endpoint of endpoints) {
        if (endpoint.includes(`/${adminId}`)) {
          try {
            await axios.delete(endpoint, {
              headers: { Authorization: `Bearer ${token}` },
            });
            success = true;
            break;
          } catch (err: any) {
            if (err.response?.status !== 404 && err.response?.status !== 500) {
              throw err;
            }
          }
        } else {
          for (const idFormat of idFormats) {
            try {
              await axios.delete(endpoint, {
                data: idFormat,
                headers: { Authorization: `Bearer ${token}` },
              });
              success = true;
              break;
            } catch (err: any) {
              if (err.response?.status !== 404 && err.response?.status !== 500) {
                throw err;
              }
            }
          }
        }
        if (success) break;
      }

      if (!success) {
        throw new Error("Admin o'chirish uchun ishlaydigan endpoint topilmadi");
      }

      setAdmins((prev) => 
        prev.map((a) => 
          a.id === adminId 
            ? { ...a, status: 'ishdan bo\'shatilgan' } 
            : a
        )
      );
      alert("Admin ishdan bo'shatildi!");
    } catch (err: any) {
      console.error("Xatolik:", err.response?.data);
      alert(`Admin ishdan bo'shatishda xatolik: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleActivateAdmin = async (adminId: number) => {
    if (!window.confirm("Adminni qayta ishga tiklamoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");
      
      await axios.post("/api/staff/return-work-staff", 
        { _id: adminId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAdmins();
      alert("Admin qayta ishga tiklandi!");
    } catch (error: any) {
      console.error("Xatolik:", error.response?.data);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleLeaveAdmin = async (adminId: number) => {
    setSelectedAdmin({ id: adminId });
    setShowLeaveModal(true);
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin?.id) {
      alert("Admin topilmadi");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Token topilmadi. Qayta login qiling.");
        router.push("/login");
        return;
      }

      const payload = {
        _id: selectedAdmin.id,
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        reason: leaveData.reason,
      };
      
      await axios.post("/api/staff/leave-staff", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowLeaveModal(false);
      setLeaveData({ start_date: "", end_date: "", reason: "" });
      fetchAdmins();
      alert("Admin ta'tilga yuborildi!");
    } catch (error: any) {
      console.error("Xatolik:", error.response?.data);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(error.response?.data?.message || "Xatolik yuz berdi");
      }
    }
  };

  const handleLeaveReturn = async (adminId: number) => {
    if (!window.confirm("Adminni ta'tildan qaytarmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");
      
      await axios.post("/api/staff/leave-exit-staff", 
        { _id: adminId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAdmins();
      alert("Admin ta'tildan qaytarildi!");
    } catch (error: any) {
      console.error("Xatolik:", error.response?.data);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  if (loading) return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold dark:text-white">Adminlar Ro'yxati</h1>
        
        <div className="flex gap-3 items-center flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Barchasi</option>
            <option value="faol">Faol</option>
            <option value="ta'tilda">Ta'tilda</option>
            <option value="ishdan bo'shatilgan">Nofaol</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Admin qo'shish
          </button>
        </div>
      </div>

      {filteredAdmins.length === 0 ? (
        <p className="dark:text-gray-300">
          {searchValue || selectedStatus !== "all" 
            ? "Hech narsa topilmadi." 
            : "Hozircha admin yo'q."}
        </p>
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
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.firstName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {admin.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      admin.status === 'faol'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : admin.status === "ta'tilda" || admin.status === 'tatilda'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {admin.status === 'faol' ? 'Faol' : (admin.status === "ta'tilda" || admin.status === 'tatilda') ? "Ta'tilda" : "Ishdan bo'shatilgan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'view') {
                          handleViewInfo(admin.id);
                        } else if (action === 'edit') {
                          handleEditClick(admin);
                        } else if (action === 'delete') {
                          handleDeleteAdmin(admin.id);
                        } else if (action === 'activate') {
                          handleActivateAdmin(admin.id);
                        } else if (action === 'leave') {
                          handleLeaveAdmin(admin.id);
                        } else if (action === 'leaveReturn') {
                          handleLeaveReturn(admin.id);
                        }
                        e.target.value = '';
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">...</option>
                      <option value="view">Ko'rish</option>
                      {admin.status === 'faol' ? (
                        <>
                          <option value="edit">Tahrirlash</option>
                          <option value="leave">Ta'tilga yuborish</option>
                          <option value="delete">Ishdan bo'shatish</option>
                        </>
                      ) : admin.status === "ta'tilda" ? (
                        <>
                          <option value="leaveReturn">Ta'tildan qaytarish</option>
                          <option value="activate">Faol qilish</option>
                        </>
                      ) : (
                        <option value="activate">Faol qilish</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin qo'shish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Admin qo'shish</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.firstName}
                  onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
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
                  value={newAdmin.lastName}
                  onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
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
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
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
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
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
                  value={newAdmin.workDate}
                  onChange={(e) => setNewAdmin({...newAdmin, workDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Qo'shish
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

      {/* Admin tahrirlash Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Admin tahrirlash</h2>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  value={editingAdmin.firstName}
                  onChange={(e) => setEditingAdmin({...editingAdmin, firstName: e.target.value})}
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
                  value={editingAdmin.lastName}
                  onChange={(e) => setEditingAdmin({...editingAdmin, lastName: e.target.value})}
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
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAdmin(null);
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
      
      {/* Admin ma'lumotlari Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Admin ma'lumotlari</h2>

            {loadingInfo ? (
              <div className="py-6 text-center dark:text-white">Yuklanmoqda...</div>
            ) : selectedAdmin ? (
              <div className="space-y-3 mb-6">
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Ism:</span> {selectedAdmin.first_name || selectedAdmin.firstName}
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Familya:</span> {selectedAdmin.last_name || selectedAdmin.lastName}
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Email:</span> {selectedAdmin.email}
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Rol:</span> {selectedAdmin.role}
                </p>
                {selectedAdmin.status && (
                  <p className="dark:text-gray-300">
                    <span className="font-semibold">Holat:</span> {selectedAdmin.status}
                  </p>
                )}
                {selectedAdmin.work_date && (
                  <p className="dark:text-gray-300">
                    <span className="font-semibold">Ish boshlagan sana:</span> {new Date(selectedAdmin.work_date).toLocaleDateString('uz-UZ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="dark:text-gray-300">Ma'lumot topilmadi</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ta'tilga yuborish Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Tatilga yuborish</h2>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  required
                  value={leaveData.start_date}
                  onChange={(e) => setLeaveData({...leaveData, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  required
                  value={leaveData.end_date}
                  onChange={(e) => setLeaveData({...leaveData, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sababi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Shaxsiy sabab"
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Yuborish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveModal(false);
                    setLeaveData({ start_date: "", end_date: "", reason: "" });
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

export default AdminlarPage;


