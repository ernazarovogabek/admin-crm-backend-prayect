'use client'

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  status: string;
  groups_count?: number;
}

export default function StudentlarPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, [search, status]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Turli endpoint nomlarini sinab ko'ramiz
      let response;
      try {
        response = await axios.get("/api/group/get-all-groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            response = await axios.get("/api/group/all-groups", {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err2: any) {
            if (err2.response?.status === 404) {
              try {
                response = await axios.get("/api/group/get-all-group", {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch (err3: any) {
                if (err3.response?.status === 404) {
                  try {
                    response = await axios.get("/api/group/groups", {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  } catch (err4: any) {
                    if (err4.response?.status === 404) {
                      response = await axios.get("/api/group/list", {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    } else {
                      throw err4;
                    }
                  }
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

      const data = response.data?.data || response.data || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Guruhlarni olishda xato:", err);
      setGroups([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);

      const params: any = {};
      if (search) params.search = search;
      if (status !== "all") params.status = status;

      const response = await axios.get("/api/student/get-all-students", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Studentlar:", response.data);
      setStudents(response.data.data || response.data || []);
    } catch (err) {
      const error = err as AxiosError;
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Studentlarni olishda xato:", error);
        setError("Studentlar ma'lumotlarini olishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReturnFromLeave = async (studentId: string) => {
    if (!window.confirm("Studentni ta'tildan qaytarishni xohlaysizmi?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "/api/student/return-leave-student",
        { student_id: studentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student muvaffaqiyatli ta'tildan qaytarildi");
      fetchStudents();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!window.confirm("Studentni o'chirmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");

      console.log("O'chirilayotgan student ID:", studentId);

      // Turli ID formatlarini sinab ko'ramiz
      const idFormats = [
        { _id: studentId },
        { id: studentId },
        { student_id: studentId }
      ];

      let success = false;

      for (const idFormat of idFormats) {
        try {
          console.log("Sinab ko'rilmoqda:", idFormat);
          await axios.delete(`/api/student/delete-student`, {
            data: idFormat,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Muvaffaqiyatli o'chirildi!");
          success = true;
          break;
        } catch (err: any) {
          console.log(`${JSON.stringify(idFormat)} ishlamadi:`, err.response?.status, err.response?.data?.message);
          if (err.response?.status !== 400) {
            // 400 dan boshqa xatolik bo'lsa, to'xtatamiz
            throw err;
          }
        }
      }

      if (!success) {
        throw new Error("Student o'chirishda xatolik yuz berdi");
      }

      alert("Student muvaffaqiyatli o'chirildi");
      fetchStudents();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleChangeStatus = async (studentId: string, newStatus: string) => {
    if (!window.confirm(`Student holatini "${newStatus}" ga o'zgartirmoqchimisiz?`)) return;

    try {
      const token = localStorage.getItem("token");
      const body: any = { _id: studentId };

      console.log("Yuborilayotgan ma'lumot:", { newStatus, body });

      let success = false;
      let endpoints: string[] = [];

      // Statusga qarab endpoint nomlarini belgilaymiz
      if (newStatus === "faol") {
        endpoints = [
          "/api/student/return-leave-student",
          "/api/student/return-student",
          "/api/student/activate-student",
          "/api/student/active-student"
        ];
      } else if (newStatus === "tatilda") {
        endpoints = [
          "/api/student/leave-student",
          "/api/student/set-leave",
          "/api/student/vacation-student"
        ];
      } else if (newStatus === "yakunlandi") {
        endpoints = [
          "/api/student/finish-student",
          "/api/student/complete-student",
          "/api/student/end-student"
        ];
      }

      // Har bir endpointni sinab ko'ramiz
      for (const endpoint of endpoints) {
        try {
          console.log(`Sinab ko'rilmoqda: ${endpoint}`);
          await axios.put(endpoint, body, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(`${endpoint} ishladi!`);
          success = true;
          break;
        } catch (err: any) {
          console.log(`${endpoint} ishlamadi:`, err.response?.status);
          if (err.response?.status !== 404) {
            // 404 dan boshqa xatolik bo'lsa, to'xtatamiz
            throw err;
          }
        }
      }

      if (!success) {
        throw new Error(`"${newStatus}" uchun ishlaydigan endpoint topilmadi`);
      }

      alert(`Student holati "${newStatus}" ga o'zgartirildi`);
      fetchStudents();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data || error.message);
      alert(`Xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    setLoadingStudent(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`/api/student/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Student ma'lumotlari:", response.data);
      const studentData = response.data?.data || response.data;
      setSelectedStudent(studentData);
      setShowInfoModal(true);
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Student ma'lumotlarini olishda xatolik: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedStudent || !selectedGroupId) {
      alert("Iltimos guruh tanlang");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const requestData = {
        student_id: selectedStudent._id,
        group_id: selectedGroupId,
        joinedAt: new Date().toISOString(),
      };

      console.log("Guruhga qo'shish uchun yuborilayotgan ma'lumot:", requestData);

      await axios.post(
        "/api/student/added-new-group-student",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student guruhga muvaffaqiyatli qo'shildi");
      setShowAddToGroupModal(false);
      setSelectedStudent(null);
      setSelectedGroupId("");
      fetchStudents();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const studentData = {
        ...newStudent,
        group: null, // yoki "" yoki undefined
        groups: [] // Bo'sh array
      };

      console.log("Yuborilayotgan ma'lumot:", studentData);

      await axios.post(
        "/api/student/create-student",
        studentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student muvaffaqiyatli qo'shildi");
      setShowAddModal(false);
      setNewStudent({
        first_name: "",
        last_name: "",
        phone: "",
      });
      fetchStudents();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Studentlar ro'yxati</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Student qo'shish
          </button>
          <input
            type="text"
            placeholder="Ism bo'yicha qidirish"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Barchasi</option>
            <option value="faol">Faol</option>
            <option value="tatilda">Ta'tilda</option>
            <option value="yakunlandi">Yakunlandi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 dark:text-white">Yuklanmoqda...</div>
      ) : students.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha student yo'q.</p>
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
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Guruhlar soni
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
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.first_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {student.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {student.groups_count || 0} ta
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'faol' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : student.status === 'tatilda'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'view') {
                          fetchStudentDetails(student._id);
                        } else if (action === 'addToGroup') {
                          setSelectedStudent(student);
                          setShowAddToGroupModal(true);
                        } else if (action === 'delete') {
                          handleDelete(student._id);
                        } else if (action) {
                          handleChangeStatus(student._id, action);
                        }
                        e.target.value = ''; // Reset select
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">...</option>
                      <option value="view">Ko'rish</option>
                      <option value="addToGroup">Guruhga qo'shish</option>
                      {student.status !== 'faol' && <option value="faol">Faol qilish</option>}
                      {student.status !== 'tatilda' && <option value="tatilda">Ta'tilga yuborish</option>}
                      {student.status !== 'yakunlandi' && <option value="yakunlandi">Yakunlash</option>}
                      <option value="delete">O'chirish</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student ma'lumotlari Modal */}
      {showInfoModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Student ma'lumotlari</h2>

            {loadingStudent ? (
              <div className="py-6 text-center dark:text-white">Yuklanmoqda...</div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Ism:</span> {selectedStudent.first_name}
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Familya:</span> {selectedStudent.last_name}
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Telefon:</span> {selectedStudent.phone}
                </p>
                {selectedStudent.email && (
                  <p className="dark:text-gray-300">
                    <span className="font-semibold">Email:</span> {selectedStudent.email}
                  </p>
                )}
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Guruhlar soni:</span> {selectedStudent.groups_count || 0} ta
                </p>
                <p className="dark:text-gray-300">
                  <span className="font-semibold">Holat:</span> {selectedStudent.status}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setSelectedStudent(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student qo'shish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Student qo'shish</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ism
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
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
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  required
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="+998901234567"
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

      {/* Guruhga qo'shish Modal */}
      {showAddToGroupModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Guruhga qo'shish</h2>

            <div className="mb-4">
              <p className="dark:text-gray-300 mb-4">
                <span className="font-semibold">Student:</span> {selectedStudent.first_name} {selectedStudent.last_name}
              </p>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guruhni tanlang
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Guruh tanlang</option>
                {groups.map((group) => (
                  <option key={group._id || group.id} value={group._id || group.id}>
                    {typeof group.name === 'string' ? group.name : group.name?.name || 'Noma\'lum guruh'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToGroup}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Qo'shish
              </button>
              <button
                onClick={() => {
                  setShowAddToGroupModal(false);
                  setSelectedStudent(null);
                  setSelectedGroupId("");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
