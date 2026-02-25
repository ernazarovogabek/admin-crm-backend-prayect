import api from "../api";

export interface Teacher {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  work_date?: string;
}

export interface NewTeacher {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  work_date: string;
  course_id: string;
}

// Ustozlarni olish
export const fetchTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get("/api/teacher/get-all-teachers");
  return response.data.data || response.data || [];
};

// Ustoz qo'shish
export const createTeacher = async (teacherData: NewTeacher) => {
  const response = await api.post("/api/teacher/create-teacher", teacherData);
  return response.data;
};

// Ustoz ishdan bo'shatish
export const fireTeacher = async (id: string) => {
  const response = await api.delete("/api/teacher/fire-teacher", {
    data: { _id: id },
  });
  return response.data;
};

// Ustozni ishga qaytarish
export const returnTeacher = async (id: string) => {
  const response = await api.post("/api/teacher/return-teacher", { _id: id });
  return response.data;
};

// Kurslarni olish (ustozlar uchun)
export const fetchCourses = async () => {
  const response = await api.get("/api/course/get-courses");
  return response.data?.data || response.data || [];
};
