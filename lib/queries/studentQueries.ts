import api from "../api";

export interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  status: string;
  groups_count?: number;
}

export interface NewStudent {
  first_name: string;
  last_name: string;
  phone: string;
  groups?: Array<{ group: string }>;
}

// Studentlarni olish
export const fetchStudents = async (search?: string, status?: string): Promise<Student[]> => {
  const params: any = {};
  if (search?.trim()) params.search = search.trim();
  if (status && status !== "all") params.status = status;

  const response = await api.get("/api/student/get-all-students", { params });
  return response.data.data || response.data || [];
};

// Student qo'shish
export const createStudent = async (studentData: NewStudent) => {
  // Agar groups bo'sh bo'lsa, uni umuman yubormaymiz
  const payload: any = {
    first_name: studentData.first_name,
    last_name: studentData.last_name,
    phone: studentData.phone,
  };

  // Faqat guruh tanlangan bo'lsa groups maydonini qo'shamiz
  if (studentData.groups && studentData.groups.length > 0) {
    payload.groups = studentData.groups;
  }

  const response = await api.post("/api/student/create-student", payload);
  return response.data;
};

// Student ma'lumotlarini olish
export const fetchStudentDetails = async (id: string) => {
  const response = await api.get(`/api/student/student/${id}`);
  return response.data?.data || response.data;
};

// Student o'chirish
export const deleteStudent = async (id: string) => {
  const response = await api.delete("/api/student/delete-student", {
    data: { _id: id }
  });
  return response.data;
};

// Student holatini o'zgartirish
export const changeStudentStatus = async (id: string, status: string) => {
  // Statusga qarab endpoint nomini belgilaymiz
  if (status === "faol") {
    // Faol qilish uchun POST return-student
    const response = await api.post("/api/student/return-student", { _id: id });
    return response.data;
  } else if (status === "tatilda") {
    // Ta'tilga yuborish uchun POST leave-student
    const response = await api.post("/api/student/leave-student", { _id: id });
    return response.data;
  } else if (status === "yakunlandi") {
    // Yakunlash uchun turli endpointlarni sinab ko'ramiz
    const endpoints = [
      "/api/student/finish-student",
      "/api/student/complete-student",
      "/api/student/end-student"
    ];

    let lastError = null;
    for (const ep of endpoints) {
      try {
        const response = await api.post(ep, { _id: id });
        return response.data;
      } catch (err: any) {
        lastError = err;
        if (err.response?.status !== 404) throw err;
      }
    }
    throw lastError || new Error("Yakunlash uchun endpoint topilmadi");
  }

  throw new Error("Noto'g'ri status");
};

// Studentni guruhga qo'shish
export const addStudentToGroup = async (data: { student_id: string; group_id: string; joinedAt: string }) => {
  const response = await api.post("/api/student/added-new-group-student", data);
  return response.data;
};

// Guruhlarni olish (faqat faol guruhlar)
export const fetchGroups = async () => {
  const response = await api.get("/api/group/get-all-group");
  const allGroups = response.data?.data || response.data || [];

  // Faqat faol guruhlarni qaytaramiz (yakunlanmagan va o'chirilmagan)
  return allGroups.filter((group: any) =>
    !group.end_group &&
    !group.ended_group &&
    !group.is_deleted
  );
};
