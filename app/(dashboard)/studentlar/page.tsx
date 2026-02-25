'use client'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  fetchStudents,
  createStudent,
  deleteStudent,
  changeStudentStatus,
  fetchStudentDetails,
  addStudentToGroup,
  fetchGroups,
  type Student,
  type NewStudent
} from "@/lib/queries/studentQueries";

export default function StudentlarPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    first_name: "",
    last_name: "",
    phone: "",
    groups: []
  });
  const [selectedGroupForNew, setSelectedGroupForNew] = useState("");

  // Queries
  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['students', search, status],
    queryFn: () => fetchStudents(search, status),
    retry: 1,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    retry: 1,
  });

  const { data: studentDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['studentDetails', selectedStudent?._id],
    queryFn: () => fetchStudentDetails(selectedStudent!._id),
    enabled: !!selectedStudent && showInfoModal,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowAddModal(false);
      setNewStudent({
        first_name: "",
        last_name: "",
        phone: "",
        groups: []
      });
      setSelectedGroupForNew("");
      toast.success("Student muvaffaqiyatli qo'shildi");
    },
    onError: (error: any) => {
      console.error("Student qo'shishda xato:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Xatolik: ${errorMsg}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Student muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => changeStudentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Student holati "${variables.status}" ga o'zgartirildi`);
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const addToGroupMutation = useMutation({
    mutationFn: addStudentToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowAddToGroupModal(false);
      setSelectedStudent(null);
      setSelectedGroupId("");
      toast.success("Student guruhga muvaffaqiyatli qo'shildi");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  // Handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // Agar guruh tanlangan bo'lsa, groups arrayiga qo'shamiz
    const studentData = {
      ...newStudent,
      groups: selectedGroupForNew ? [{ group: selectedGroupForNew }] : []
    };

    createMutation.mutate(studentData);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Studentni o'chirmoqchimisiz?")) return;
    deleteMutation.mutate(id);
  };

  const handleChangeStatus = (id: string, newStatus: string) => {
    if (!window.confirm(`Student holatini "${newStatus}" ga o'zgartirmoqchimisiz?`)) return;
    statusMutation.mutate({ id, status: newStatus });
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowInfoModal(true);
  };

  const handleAddToGroup = () => {
    if (!selectedStudent || !selectedGroupId) {
      toast.warning("Iltimos guruh tanlang");
      return;
    }

    addToGroupMutation.mutate({
      student_id: selectedStudent._id,
      group_id: selectedGroupId,
      joinedAt: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['Ism', 'Familya', 'Telefon', 'Email', 'Guruhlar', 'Holat', 'Amallar'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[24, 28, 32, 40, 16, 20, 16].map((w, idx) => (
                    <td key={idx} className="px-6 py-4"><div className={`h-4 w-${w} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-6 text-red-600 dark:text-red-400">Studentlar ma'lumotlarini olishda xatolik yuz berdi.</div>;

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

      {students.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha student yo'q.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ism</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Familya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruhlar soni</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.first_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{student.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {student.groups_count || 0} ta
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'faol'
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
                        if (action === 'view') handleViewStudent(student);
                        else if (action === 'addToGroup') {
                          setSelectedStudent(student);
                          setShowAddToGroupModal(true);
                        }
                        else if (action === 'delete') handleDelete(student._id);
                        else if (action) handleChangeStatus(student._id, action);
                        e.target.value = '';
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
            {loadingDetails ? (
              <div className="py-6 text-center dark:text-white">Yuklanmoqda...</div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="dark:text-gray-300"><span className="font-semibold">Ism:</span> {studentDetails?.first_name || selectedStudent.first_name}</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Familya:</span> {studentDetails?.last_name || selectedStudent.last_name}</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Telefon:</span> {studentDetails?.phone || selectedStudent.phone}</p>
                {(studentDetails?.email || selectedStudent.email) && (
                  <p className="dark:text-gray-300"><span className="font-semibold">Email:</span> {studentDetails?.email || selectedStudent.email}</p>
                )}
                <p className="dark:text-gray-300"><span className="font-semibold">Guruhlar soni:</span> {studentDetails?.groups_count || selectedStudent.groups_count || 0} ta</p>
                <p className="dark:text-gray-300"><span className="font-semibold">Holat:</span> {studentDetails?.status || selectedStudent.status}</p>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input
                  type="text"
                  required
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input
                  type="text"
                  required
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  required
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="+998901234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guruh (ixtiyoriy)</label>
                <select
                  value={selectedGroupForNew}
                  onChange={(e) => setSelectedGroupForNew(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Guruh tanlanmagan</option>
                  {groups.map((group: any) => (
                    <option key={group._id || group.id} value={group._id || group.id}>
                      {typeof group.name === 'string' ? group.name : group.name?.name || 'Noma\'lum guruh'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {createMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guruhni tanlang</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Guruh tanlang</option>
                {groups.map((group: any) => (
                  <option key={group._id || group.id} value={group._id || group.id}>
                    {typeof group.name === 'string' ? group.name : group.name?.name || 'Noma\'lum guruh'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddToGroup}
                disabled={addToGroupMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {addToGroupMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
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
