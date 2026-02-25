'use client'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  freezeCourse,
  unfreezeCourse,
  fetchCategories,
  createCategory,
  type Course,
  type NewCourse,
  type Category
} from "@/lib/queries/courseQueries";

export default function KurslarPage() {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filterFreeze, setFilterFreeze] = useState<string>("all");
  const [newCourse, setNewCourse] = useState<NewCourse>({
    name: "",
    description: "",
    duration: "",
    price: 0,
  });
  const [newCategory, setNewCategory] = useState({ name: "" });

  // Queries
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['courses', filterFreeze],
    queryFn: () => {
      if (filterFreeze === "active") return fetchCourses(false);
      if (filterFreeze === "frozen") return fetchCourses(true);
      return fetchCourses();
    },
    retry: 1,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    retry: 1,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      setNewCourse({ name: "", description: "", duration: "", price: 0 });
      toast.success("Kurs muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowEditModal(false);
      setEditingCourse(null);
      toast.success("Kurs muvaffaqiyatli tahrirlandi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Kurs muvaffaqiyatli o'chirildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const freezeMutation = useMutation({
    mutationFn: freezeCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Kurs muvaffaqiyatli muzlatildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const unfreezeMutation = useMutation({
    mutationFn: unfreezeCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Kurs muvaffaqiyatli davom ettirildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      setNewCategory({ name: "" });
      toast.success("Kategoriya muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
  });

  // Handlers
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCourse);
  };

  const handleEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateMutation.mutate({
      course_id: editingCourse._id,
      duration: editingCourse.duration || "",
      price: editingCourse.price || 0,
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Kursni o'chirmoqchimisiz?")) return;
    deleteMutation.mutate(id);
  };

  const handleFreeze = (id: string) => {
    if (!window.confirm("Kursni muzlatmoqchimisiz?")) return;
    freezeMutation.mutate(id);
  };

  const handleUnfreeze = (id: string) => {
    if (!window.confirm("Kursni davom ettirishni xohlaysizmi?")) return;
    unfreezeMutation.mutate(id);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(newCategory);
  };

  const getCourseName = (name: string | { name: string }): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.name) return name.name;
    return 'Noma\'lum kurs';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-6 text-red-600 dark:text-red-400">Kurslar ma'lumotlarini olishda xatolik yuz berdi.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Kurslar Ro'yxati</h1>
        <div className="flex gap-3">
          <select
            value={filterFreeze}
            onChange={(e) => setFilterFreeze(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Barchasi</option>
            <option value="active">Faol kurslar</option>
            <option value="frozen">Muzlatilgan</option>
          </select>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            + Kategoriya qo'shish
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Kurs qo'shish
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="dark:text-gray-300">Hozircha kurs yo'q.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-bold text-white mb-2">{getCourseName(course.name)}</h3>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-semibold">
                  {course.price ? `${course.price.toLocaleString()} UZS` : 'Narx yo\'q'}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-6">{course.description || 'Tavsif yo\'q'}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">{course.duration || 'Davomiyligi ko\'rsatilmagan'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {course.is_freeze ? (
                  <>
                    <button
                      onClick={() => handleUnfreeze(course._id)}
                      disabled={unfreezeMutation.isPending}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium disabled:opacity-50"
                    >
                      Davom ettirish
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition flex items-center justify-center disabled:opacity-50"
                      title="O'chirish"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingCourse(course); setShowEditModal(true); }}
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition flex items-center justify-center border border-gray-600"
                      title="Tahrirlash"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleFreeze(course._id)}
                      disabled={freezeMutation.isPending}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium disabled:opacity-50"
                    >
                      Muzlatish
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kurs qo'shish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Kurs qo'shish</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kurs nomi</label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
                <textarea
                  required
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Davomiyligi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 3 oy"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narxi (so'm)</label>
                <input
                  type="number"
                  required
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
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

      {/* Kategoriya qo'shish Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Kategoriya qo'shish</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoriya nomi</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {createCategoryMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kurs tahrirlash Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Kursni tahrirlash</h2>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Davomiyligi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1 yil"
                  value={editingCourse.duration || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narxi (UZS)</label>
                <input
                  type="number"
                  required
                  value={editingCourse.price || 0}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCourse(null); }}
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
