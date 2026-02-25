'use client'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  fetchTeachers,
  createTeacher,
  fireTeacher,
  returnTeacher,
  fetchCourses,
  type Teacher,
  type NewTeacher
} from "@/lib/queries/teacherQueries";

export default function UstozlarPage() {
  const queryClient = useQueryClient();

  const [openInfo, setOpenInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState<NewTeacher>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    work_date: new Date().toISOString().split('T')[0],
    course_id: ""
  });

  // Queries
  const { data: teachers = [], isLoading, isError } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
    retry: 1,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    retry: 1,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowAddModal(false);
      setNewTeacher({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        work_date: new Date().toISOString().split('T')[0],
        course_id: ""
      });
      toast.success("Ustoz muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const fireMutation = useMutation({
    mutationFn: fireTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setOpenInfo(false);
      setSelectedTeacher(null);
      toast.success("Ustoz ishdan bo'shatildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const returnMutation = useMutation({
    mutationFn: returnTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success("Ustoz ishga qaytarildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  // Handlers
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTeacher);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Ustozni ishdan bo'shatmoqchimisiz?")) return;
    fireMutation.mutate(id);
  };

  const handleActivateTeacher = (id: string) => {
    if (!window.confirm("Ustozni ishga qaytarmoqchimisiz?")) return;
    returnMutation.mutate(id);
  };

  const getCourseName = (course: any): string => {
    if (typeof course === 'string') return course;
    if (typeof course === 'object' && course?.name) {
      return typeof course.name === 'string' ? course.name : course.name?.name || 'Noma\'lum kurs';
    }
    return 'Noma\'lum kurs';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['Ism', 'Familya', 'Email', 'Telefon', 'Holat', 'Amallar'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[24, 28, 40, 32, 20, 16].map((w, idx) => (
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

  if (isError) return <div className="p-6 text-red-600 dark:text-red-400">Ustozlar ma'lumotlarini olishda xatolik yuz berdi.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Ustozlar ro'yxati</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          + Ustoz qo'shish
        </button>
      </div>

      {teachers.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha ustoz yo'q.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ism</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Familya</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.first_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{teacher.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === 'faol'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : teacher.status === "ta'tilda" || teacher.status === 'tatilda'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {teacher.status === 'faol' ? 'Faol' : (teacher.status === "ta'tilda" || teacher.status === 'tatilda') ? "Ta'tilda" : teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'view') {
                          setSelectedTeacher(teacher);
                          setOpenInfo(true);
                        } else if (action === 'delete') {
                          handleDelete(teacher._id);
                        } else if (action === 'activate') {
                          handleActivateTeacher(teacher._id);
                        }
                        e.target.value = '';
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">...</option>
                      <option value="view">Ko'rish</option>
                      {teacher.status === "ishdan bo'shatilgan" ? (
                        <option value="activate">Ishga qaytarish</option>
                      ) : (
                        <option value="delete">Ishdan bo'shatish</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ustoz ma'lumotlari Modal */}
      {openInfo && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Ustoz ma'lumotlari</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ism</p>
                <p className="text-base font-medium dark:text-white">{selectedTeacher.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Familya</p>
                <p className="text-base font-medium dark:text-white">{selectedTeacher.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-base font-medium dark:text-white">{selectedTeacher.email}</p>
              </div>
              {selectedTeacher.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                  <p className="text-base font-medium dark:text-white">{selectedTeacher.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Holat</p>
                <p className="text-base font-medium dark:text-white capitalize">{selectedTeacher.status}</p>
              </div>
              {selectedTeacher.work_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ish boshlagan sana</p>
                  <p className="text-base font-medium dark:text-white">
                    {new Date(selectedTeacher.work_date).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setOpenInfo(false);
                  setSelectedTeacher(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
              >
                Yopish
              </button>
              <button
                onClick={() => handleDelete(selectedTeacher._id)}
                disabled={fireMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ustoz qo'shish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Ustoz qo'shish</h2>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
                <input
                  type="text"
                  required
                  value={newTeacher.first_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Familya</label>
                <input
                  type="text"
                  required
                  value={newTeacher.last_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol</label>
                <input
                  type="password"
                  required
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  required
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ish boshlagan sana</label>
                <input
                  type="date"
                  required
                  value={newTeacher.work_date}
                  onChange={(e) => setNewTeacher({ ...newTeacher, work_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kurs</label>
                <select
                  required
                  value={newTeacher.course_id}
                  onChange={(e) => setNewTeacher({ ...newTeacher, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Kurs tanlang</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {getCourseName(course)}
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
    </div>
  );
}
