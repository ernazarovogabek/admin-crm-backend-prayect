import api from "../api";

export interface Group {
  _id: string;
  name: string;
  teacher?: {
    first_name: string;
    last_name: string;
    _id?: string;
  };
  started_group?: string;
  ended_group?: string;
  students_count?: number;
}

export interface NewGroup {
  course_id: string;
  teacher: string;
  started_group: string;
}

// Guruhlarni olish
export const fetchGroups = async (searchName?: string): Promise<Group[]> => {
  if (searchName?.trim()) {
    // Qidiruv bo'lsa search-group endpointidan foydalanish
    const response = await api.get("/api/student/search-group", {
      params: { name: searchName.trim() }
    });
    return response.data.data || response.data || [];
  }

  // Oddiy ro'yxat olish
  const response = await api.get("/api/group/get-all-group");
  return response.data.data || response.data || [];
};

// Guruh qo'shish
export const createGroup = async (groupData: NewGroup) => {
  const response = await api.post("/api/group/create-group", groupData);
  return response.data;
};

// Guruh tahrirlash
export const updateGroup = async (groupData: any) => {
  const response = await api.put("/api/group/edit-end-group", {
    _id: groupData._id,
    group_name: groupData.group_name,
    teacher: groupData.teacher,
    date: groupData.date,
    ended_group: groupData.ended_group,
  });
  return response.data;
};

// Guruhni tugatish
export const endGroup = async (id: string) => {
  const response = await api.put("/api/group/end-group", { _id: id });
  return response.data;
};

// Ustozlarni olish
export const fetchTeachers = async () => {
  const response = await api.get("/api/teacher/get-all-teachers");
  return response.data.data || response.data || [];
};

// Kurslarni olish (faqat faol guruhlar uchun)
export const fetchCourses = async () => {
  const response = await api.get("/api/course/get-courses");
  return response.data.data || response.data || [];
};

// Faol guruhlarni olish (studentlar uchun)
export const fetchActiveGroups = async () => {
  const response = await api.get("/api/group/get-all-group");
  const allGroups = response.data?.data || response.data || [];

  // Faqat faol guruhlarni qaytaramiz
  return allGroups.filter((group: any) =>
    !group.end_group &&
    !group.ended_group &&
    !group.is_deleted
  );
};
