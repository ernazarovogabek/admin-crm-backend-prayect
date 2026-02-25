'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  sendAdminOnLeave,
  returnAdminFromLeave,
  returnAdminToWork,
  fetchAdminInfo,
  type Admin
} from "@/lib/queries/adminQueries";

interface NewAdmin {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  workDate: string;
}

export default function AdminlarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [leaveData, setLeaveData] = useState({ start_date: "", end_date: "", reason: "" });
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    firstName: "", lastName: "", email: "", password: "", role: "admin",
    workDate: new Date().toISOString().split('T')[0]
  });

  // Queries
  const { data: admins = [], isLoading, isError } = useQuery({
    queryKey: ['admins', searchValue, selectedStatus],
    queryFn: () => fetchAdmins({ search: searchValue, status: selectedStatus }),
    retry: 1,
  });

  const { data: adminInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['adminInfo', selectedAdminId],
    queryFn: () => fetchAdminInfo(selectedAdminId!.toString()),
    enabled: !!selectedAdminId && showInfoModal,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowModal(false);
      setNewAdmin({ firstName: "", lastName: "", email: "", password: "", role: "admin", workDate: new Date().toISOString().split('T')[0] });
      toast.success("Admin muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowEditModal(false);
      setEditingAdmin(null);
      toast.success("Admin muvaffaqiyatli tahrirlandi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin ishdan bo'shatildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const leaveMutation = useMutation({
    mutationFn: sendAdminOnLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowLeaveModal(false);
      setLeaveData({ start_date: "", end_date: "", reason: "" });
      toast.success("Admin ta'tilga yuborildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const leaveReturnMutation = useMutation({
    mutationFn: returnAdminFromLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin ta'tildan qaytarildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const activateMutation = useMutation({
    mutationFn: returnAdminToWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin qayta ishga tiklandi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  // Handlers
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAdmin);
  };

  const handleEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    updateMutation.mutate(editingAdmin);
  };

  const handleDeleteAdmin = (id: number) => {
    if (!window.confirm("Adminni ishdan bo'shatmoqchimisiz?")) return;
    deleteMutation.mutate(id.toString());
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId) return;
    leaveMutation.mutate({ _id: selectedAdminId.toString(), ...leaveData });
  };

  const handleLeaveReturn = (id: number) => {
    if (!window.confirm("Adminni ta'tildan qaytarmoqchimisiz?")) return;
    leaveReturnMutation.mutate(id.toString());
  };

  const handleActivate = (id: number) => {
    if (!window.confirm("Adminni qayta ishga tiklamoqchimisiz?")) return;
    activateMutation.mutate(id.toString());
  };

  const handleViewInfo = (id: number) => {
    setSelectedAdminId(id);
    setShowInfoModal(true);
  };

  if (isLoading) {
    return (
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
                {['Ism', 'Familya', 'Email', 'Rol', 'Holat', 'Amallar'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  {[24, 24, 40, 20, 16, 16].map((w, idx) => (
                    <td key={idx} className="px-6 py-4"><div className={`h-5 w-${w} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-6 text-red-600 dark:text-red-400">Admin ma'lumotlarini olishda xatolik yuz berdi.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold dark:text-white">Adminlar Ro'yxati</h1>
        <div className="flex gap-3 items-center flex-wrap">
          <input type="text" placeholder="Qidirish..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option value="all">Barchasi</option>
            <option value="faol">Faol</option>
            <option value="ta'tilda">Ta'tilda</option>
            <option value="ishdan bo'shatilgan">Nofaol</option>
          </select>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
            + Admin qo'shish
          </button>
        </div>
      </div>

      {admins.length === 0 ? (
        <p className="dark:text-gray-300">{searchValue || selectedStatus !== "all" ? "Hech narsa topilmadi." : "Hozircha admin yo'q."}</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['Ism', 'Familya', 'Email', 'Rol', 'Holat', 'Amallar'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{admin.firstName}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{admin.lastName}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500 dark:text-gray-300">{admin.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{admin.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.status === 'faol' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      admin.status === "ta'tilda" ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {admin.status === 'faol' ? 'Faol' : admin.status === "ta'tilda" ? "Ta'tilda" : "Ishdan bo'shatilgan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select onChange={(e) => {
                      const action = e.target.value;
                      if (action === 'view') handleViewInfo(admin.id);
                      else if (action === 'edit') { setEditingAdmin(admin); setShowEditModal(true); }
                      else if (action === 'delete') handleDeleteAdmin(admin.id);
                      else if (action === 'activate') handleActivate(admin.id);
                      else if (action === 'leave') { setSelectedAdminId(admin.id); setShowLeaveModal(true); }
                      else if (action === 'leaveReturn') handleLeaveReturn(admin.id);
                      e.target.value = '';
                    }} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input type="text" required value={newAdmin.firstName} onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input type="text" required value={newAdmin.lastName} onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
                <input type="password" required value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ish boshlagan sana</label>
                <input type="date" required value={newAdmin.workDate} onChange={(e) => setNewAdmin({ ...newAdmin, workDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
                  {createMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input type="text" required value={editingAdmin.firstName} onChange={(e) => setEditingAdmin({ ...editingAdmin, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input type="text" required value={editingAdmin.lastName} onChange={(e) => setEditingAdmin({ ...editingAdmin, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={editingAdmin.email} onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
                  {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition">
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
            ) : adminInfo ? (
              <div className="space-y-3 mb-6">
                <p className="dark:text-gray-300"><span className="font-semibold">Ism:</span> {adminInfo.first_name || adminInfo.firstName}</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Familya:</span> {adminInfo.last_name || adminInfo.lastName}</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Email:</span> {adminInfo.email}</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Rol:</span> {adminInfo.role}</p>
                {adminInfo.status && <p className="dark:text-gray-300"><span className="font-semibold">Holat:</span> {adminInfo.status}</p>}
                {adminInfo.work_date && <p className="dark:text-gray-300"><span className="font-semibold">Ish boshlagan sana:</span> {new Date(adminInfo.work_date).toLocaleDateString('uz-UZ')}</p>}
              </div>
            ) : (
              <p className="dark:text-gray-300">Ma'lumot topilmadi</p>
            )}
            <button onClick={() => { setShowInfoModal(false); setSelectedAdminId(null); }}
              className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition">
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Ta'tilga yuborish Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Ta'tilga yuborish</h2>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boshlanish sanasi</label>
                <input type="date" required value={leaveData.start_date} onChange={(e) => setLeaveData({ ...leaveData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tugash sanasi</label>
                <input type="date" required value={leaveData.end_date} onChange={(e) => setLeaveData({ ...leaveData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sababi</label>
                <input type="text" required placeholder="Masalan: Shaxsiy sabab" value={leaveData.reason} onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={leaveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
                  {leaveMutation.isPending ? "Yuborilmoqda..." : "Yuborish"}
                </button>
                <button type="button" onClick={() => { setShowLeaveModal(false); setLeaveData({ start_date: "", end_date: "", reason: "" }); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition">
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
