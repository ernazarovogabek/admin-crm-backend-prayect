'use client'

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Group {
  _id: string;
  name: string;
  teacher?: {
    first_name: string;
    last_name: string;
  };
  started_group?: string;
  ended_group?: string;
  students_count?: number;
}

interface NewGroup {
  name: string;
  teacher: string;
  started_group: string;
  ended_group: string;
}

export default function GuruhlarPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchName, setSearchName] = useState("");
  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    teacher: "",
    started_group: new Date().toISOString().split('T')[0],
    ended_group: ""
  });
  const [editGroup, setEditGroup] = useState<NewGroup>({
    name: "",
    teacher: "",
    started_group: "",
    ended_group: ""
  });

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
  }, [searchName]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);

      // Agar qidiruv bo'lsa, search-group endpointidan foydalanish
      if (searchName) {
        try {
          const response = await axios.get("/api/student/search-group", {
            params: { name: searchName },
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Qidiruv natijalari:", response.data);
          setGroups(response.data.data || response.data || []);
          return;
        } catch (err: any) {
          console.error("Qidiruvda xato:", err);
          // Agar search-group ishlamasa, oddiy get-all-groups ishlatamiz
        }
      }

      // Turli endpoint nomlarini sinab ko'ramiz
      let response;
      try {
        response = await axios.get("/api/group/", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            response = await axios.get("/api/group/get-all-groups", {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err2: any) {
            if (err2.response?.status === 404) {
              try {
                response = await axios.get("/api/group/all-groups", {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch (err3: any) {
                if (err3.response?.status === 404) {
                  response = await axios.get("/api/group/get-all-group", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } else {
                  throw err3;
                }
              }
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }

      console.log("Guruhlar:", response.data);
      const groupsData = response.data.data || response.data || [];
      console.log("Guruhlar ma'lumotlari:", groupsData);
      setGroups(groupsData);
    } catch (err) {
      const error = err as AxiosError;
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Guruhlarni olishda xato:", error);
        setError("Guruhlar ma'lumotlarini olishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("/api/teacher/get-all-teachers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeachers(res.data.data || res.data || []);
    } catch (error) {
      console.error("Ustozlarni olishda xato:", error);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Backend kutayotgan maydonlar
      const groupData = {
        group_name: newGroup.name,
        teacher: newGroup.teacher,
        started_group: newGroup.started_group,
        ended_group: newGroup.ended_group
      };

      console.log("Yuborilayotgan ma'lumot:", groupData);

      const response = await axios.post(
        "/api/group/create-group",
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Backend javobi:", response.data);

      setShowAddModal(false);
      setNewGroup({
        name: "",
        teacher: "",
        started_group: new Date().toISOString().split('T')[0],
        ended_group: ""
      });
      fetchGroups();
      alert("Guruh muvaffaqiyatli qo'shildi!");
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Guruh qo'shishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Guruhni tugatmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");

      // end-group endpointidan foydalanish
      await axios.put(
        "/api/group/end-group",
        { _id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroups((prev) => prev.filter((g) => g._id !== id));
      alert("Guruh muvaffaqiyatli tugatildi!");
      fetchGroups(); // Ro'yxatni yangilash
    } catch (error: any) {
      console.error("Guruhni tugatishda xato:", error);
      alert(`Guruhni tugatishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem("token");

      const updateData = {
        _id: selectedGroup._id,
        group_name: editGroup.name,
        teacher: editGroup.teacher,
        date: editGroup.started_group, // Backend 'date' kutmoqda
        ended_group: editGroup.ended_group
      };

      console.log("Yuborilayotgan ma'lumot:", updateData);

      await axios.put(
        "/api/group/edit-end-group",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowEditModal(false);
      setSelectedGroup(null);
      setEditGroup({
        name: "",
        teacher: "",
        started_group: "",
        ended_group: ""
      });
      fetchGroups();
      alert("Guruh muvaffaqiyatli tahrirlandi!");
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Guruh tahrirlashda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setEditGroup({
      name: group.name,
      teacher: typeof group.teacher === 'object' ? (group.teacher as any)._id : (group.teacher as any) || "",
      started_group: group.started_group ? new Date(group.started_group).toISOString().split('T')[0] : "",
      ended_group: group.ended_group ? new Date(group.ended_group).toISOString().split('T')[0] : ""
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="p-6 dark:text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Guruhlar ro'yxati</h1>
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Guruh nomi bo'yicha qidirish"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Guruh qo'shish
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha guruh yo'q.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Guruh nomi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ustoz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Boshlanish sanasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tugash sanasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Talabalar soni
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {groups.map((group) => (
                <tr key={group._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {group.teacher ? `${group.teacher.first_name} ${group.teacher.last_name}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {group.started_group ? new Date(group.started_group).toLocaleDateString('uz-UZ') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {group.ended_group ? new Date(group.ended_group).toLocaleDateString('uz-UZ') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {group.students_count || 0} ta
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'edit') {
                          openEditModal(group);
                        } else if (action === 'delete') {
                          handleDelete(group._id);
                        }
                        e.target.value = '';
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">...</option>
                      <option value="edit">Tahrirlash</option>
                      <option value="delete">Tugatish</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guruh qo'shish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Guruh qo'shish</h2>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guruh nomi
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ustoz
                </label>
                <select
                  required
                  value={newGroup.teacher}
                  onChange={(e) => setNewGroup({...newGroup, teacher: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Ustoz tanlang</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  required
                  value={newGroup.started_group}
                  onChange={(e) => setNewGroup({...newGroup, started_group: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  value={newGroup.ended_group}
                  onChange={(e) => setNewGroup({...newGroup, ended_group: e.target.value})}
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guruh tahrirlash Modal */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Guruhni tahrirlash</h2>
            <form onSubmit={handleEditGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guruh nomi
                </label>
                <input
                  type="text"
                  required
                  value={editGroup.name}
                  onChange={(e) => setEditGroup({...editGroup, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ustoz
                </label>
                <select
                  required
                  value={editGroup.teacher}
                  onChange={(e) => setEditGroup({...editGroup, teacher: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Ustoz tanlang</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  required
                  value={editGroup.started_group}
                  onChange={(e) => setEditGroup({...editGroup, started_group: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  value={editGroup.ended_group}
                  onChange={(e) => setEditGroup({...editGroup, ended_group: e.target.value})}
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
                    setSelectedGroup(null);
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
