import api from "../api";

export interface Course {
  _id: string;
  name: string | { name: string };
  description?: string;
  price?: number;
  duration?: string;
  is_freeze?: boolean;
}

export interface NewCourse {
  name: string;
  description: string;
  price: number;
  duration: string;
}

export interface Category {
  _id: string;
  name: string;
}

// Kurslarni olish
export const fetchCourses = async (is_freeze?: boolean): Promise<Course[]> => {
  const params: any = {};
  if (is_freeze !== undefined) {
    params.is_freeze = is_freeze;
  }

  const response = await api.get("/api/course/get-courses", { params });
  return response.data?.data || response.data || [];
};

// Kurs qo'shish
export const createCourse = async (courseData: NewCourse) => {
  const response = await api.post("/api/course/create-course", courseData);
  return response.data;
};

// Kurs tahrirlash
export const updateCourse = async (data: { course_id: string; duration: string; price: number }) => {
  const response = await api.post("/api/course/edit-course", data);
  return response.data;
};

// Kurs o'chirish
export const deleteCourse = async (id: string) => {
  const response = await api.delete("/api/course/delete-course", { data: { course_id: id } });
  return response.data;
};

// Kursni muzlatish
export const freezeCourse = async (id: string) => {
  const response = await api.put("/api/course/freeze-course", { course_id: id });
  return response.data;
};

// Kursni davom ettirish
export const unfreezeCourse = async (id: string) => {
  const response = await api.put("/api/course/unfreeze-course", { course_id: id });
  return response.data;
};

// Kategoriyalarni olish
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/api/course/get-categories");
    return response.data.data || response.data || [];
  } catch (err: any) {
    if (err.response?.status === 404) {
      try {
        // Agar topilmasa, boshqa endpoint sinab ko'ramiz
        const response = await api.get("/api/course/categories");
        return response.data.data || response.data || [];
      } catch (err2: any) {
        console.error("Kategoriyalarni olishda xato:", err2);
        return [];
      }
    }
    console.error("Kategoriyalarni olishda xato:", err);
    return [];
  }
};

// Kategoriya qo'shish
export const createCategory = async (data: { name: string }) => {
  const response = await api.post("/api/course/create-category", data);
  return response.data;
};
