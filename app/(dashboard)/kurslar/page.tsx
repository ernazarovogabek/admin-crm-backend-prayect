"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  name: string | { name: string };
  description?: string;
  duration?: string;
  price?: number;
  is_freeze?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface NewCourse {
  name: string;
  description: string;
  duration: string;
  price: string;
  category_id: string;
}

interface NewCategory {
  name: string;
}

const KurslarPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<NewCourse>({
    name: "",
    description: "",
    duration: "",
    price: "",
    category_id: "",
  });
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
  });
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Turli endpoint nomlarini sinab ko'ramiz
      let response;
      try {
        response = await axios.get("/api/course/get-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            response = await axios.get("/api/course/all-courses", {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err2: any) {
            if (err2.response?.status === 404) {
              try {
                response = await axios.get("/api/course/", {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch (err3: any) {
                if (err3.response?.status === 404) {
                  // search-course endpointidan foydalanish
                  response = await axios.get("/api/group/search-course", {
                    params: { search: "" },
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

      const data = response.data?.data || response.data || [];
      console.log("Barcha kurslar:", data);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Xatolik:", error);
        setError("Kurslar ma'lumotlarini olishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Kategoriyalarni olishda xato:", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post("/api/course/create-category", newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCategoryModal(false);
      setNewCategory({ name: "" });
      fetchCategories();
      alert("Kategoriya muvaffaqiyatli qo'shildi!");
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Kategoriya qo'shishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const token = localStorage.getItem("token");

      const courseData = {
        course_id: editingCourse._id,
        duration: editingCourse.duration || "",
        price: editingCourse.price || 0,
      };

      console.log("Tahrirlash uchun yuborilayotgan ma'lumot:", courseData);

      await axios.post("/api/course/edit-course", courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
      alert("Kurs muvaffaqiyatli tahrirlandi!");
    } catch (err: any) {
      console.error("Tahrirlash xatolik:", err.response?.data);
      alert(`Kurs tahrirlashda xatolik: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Avval kategoriya yaratamiz
      try {
        const categoryResponse = await axios.post(
          "/api/course/create-category",
          { name: newCourse.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Kategoriya yaratildi:", categoryResponse.data);
      } catch (err: any) {
        console.error("Kategoriya yaratishda xato:", err.response?.data);
        alert(`Kategoriya yaratishda xatolik: ${err.response?.data?.message || err.message}`);
        return;
      }

      // Keyin kurs yaratamiz
      const courseData = {
        name: newCourse.name,
        description: newCourse.description,
        duration: newCourse.duration,
        price: parseFloat(newCourse.price),
      };

      console.log("Yuborilayotgan ma'lumot:", courseData);

      await axios.post("/api/course/create-course", courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setNewCourse({
        name: "",
        description: "",
        duration: "",
        price: "",
        category_id: "",
      });
      fetchCourses();
      fetchCategories();
      alert("Kurs muvaffaqiyatli qo'shildi!");
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Xatolik:", error.response?.data);
      alert(`Kurs qo'shishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Kursni o'chirmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/api/course/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { course_id: id },
      });

      setCourses((prev) => prev.filter((c) => c._id !== id));
      alert("Kurs muvaffaqiyatli o'chirildi!");
    } catch (error: any) {
      console.error("O'chirishda xato:", error.response?.data);
      alert(`Kursni o'chirishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFreeze = async (id: string) => {
    if (!window.confirm("Kursni muzlatmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put("/api/course/freeze-course", 
        { course_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Kursning is_freeze holatini o'zgartirish
      setCourses((prev) =>
        prev.map((course) =>
          course._id === id ? { ...course, is_freeze: true } : course
        )
      );
      alert("Kurs muvaffaqiyatli muzlatildi!");
    } catch (error: any) {
      console.error("Muzlatishda xato:", error.response?.data);
      alert(`Kursni muzlatishda xatolik: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUnfreeze = async (id: string) => {
    if (!window.confirm("Kursni davom ettirishni xohlaysizmi?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token topilmadi. Qayta login qiling.");
        router.push("/login");
        return;
      }

      await axios.put("/api/course/unfreeze-course", 
        { course_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Kursning is_freeze holatini o'zgartirish
      setCourses((prev) =>
        prev.map((course) =>
          course._id === id ? { ...course, is_freeze: false } : course
        )
      );
      alert("Kurs muvaffaqiyatli davom ettirildi!");
    } catch (error: any) {
      console.error("Davom ettirish xato:", error.response?.data);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert("Token muddati tugagan. Qayta login qiling.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        alert(`Kursni davom ettirishda xatolik: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const getCourseName = (name: string | { name: string }): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.name) return name.name;
    return 'Noma\'lum kurs';
  };

  if (loading) {
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
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) return <div className="p-6"><p className="text-red-600 dark:text-red-400">{error}</p></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Kurslar Ro'yxati</h1>
        <div className="flex gap-3">
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
                <h3 className="text-3xl font-bold text-white mb-2">
                  {getCourseName(course.name)}
                </h3>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-semibold">
                  {course.price ? `${course.price.toLocaleString()} UZS` : 'Narx yo\'q'}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                {course.description || 'Tavsif yo\'q'}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">{course.duration || 'Davomiyligi ko\'rsatilmagan'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-white font-medium">15 students</span>
                </div>
              </div>

              <div className="flex gap-2">
                {course.is_freeze ? (
                  <>
                    <button
                      onClick={() => handleUnfreeze(course._id)}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium"
                    >
                      Davom ettirish
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition flex items-center justify-center"
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
                      onClick={() => handleEdit(course)}
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition flex items-center justify-center border border-gray-600"
                      title="Tahrirlash"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      
                    </button>
                    <button
                      onClick={() => handleFreeze(course._id)}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kurs nomi
                </label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tavsif
                </label>
                <textarea
                  required
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Davomiyligi
                </label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Narxi (so'm)
                </label>
                <input
                  type="number"
                  required
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
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

      {/* Kategoriya qo'shish Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Kategoriya qo'shish</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategoriya nomi
                </label>
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
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Qo'shish
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
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Davomiyligi
                </label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Narxi (UZS)
                </label>
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCourse(null);
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

export default KurslarPage;
