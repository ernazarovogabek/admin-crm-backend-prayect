import api from "../api";

export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
}

export interface AdminFilters {
  status?: string;
  search?: string;
}

// Adminlarni olish (filter bilan)
export const fetchAdmins = async (filters?: AdminFilters): Promise<Admin[]> => {
  try {
    const response = await api.get("/api/staff/all-admins");
    let data = response.data?.data || response.data || [];

    const admins = Array.isArray(data)
      ? data.map((admin: any) => ({
        id: admin.id || admin._id || admin.staff_id,
        firstName: admin.first_name || admin.firstName,
        lastName: admin.last_name || admin.lastName,
        email: admin.email,
        role: admin.role,
        status: admin.status || "faol",
      }))
      : [];

    // Client-side filtering
    let filtered = admins;

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter(admin => admin.status === filters.status);
    }

    if (filters?.search && filters.search.trim() !== "") {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(admin =>
        admin.firstName.toLowerCase().includes(search) ||
        admin.lastName.toLowerCase().includes(search) ||
        admin.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  } catch (error: any) {
    // 404 bo'lsa, bo'sh array qaytarish (endpoint mavjud emas)
    if (error.response?.status === 404) {
      console.warn("Admin endpoint topilmadi, bo'sh array qaytarilmoqda");
      return [];
    }
    throw error;
  }
};

// Admin qo'shish
export const createAdmin = async (adminData: any) => {
  const response = await api.post("/api/staff/create-admin", {
    first_name: adminData.firstName,
    last_name: adminData.lastName,
    email: adminData.email,
    password: adminData.password,
    role: adminData.role,
    work_date: adminData.workDate,
  });
  return response.data;
};

// Admin tahrirlash
export const updateAdmin = async (adminData: any) => {
  const response = await api.post("/api/staff/edited-admin", {
    _id: adminData.id,
    first_name: adminData.firstName,
    last_name: adminData.lastName,
    email: adminData.email,
  });
  return response.data;
};

// Admin o'chirish
export const deleteAdmin = async (id: string) => {
  const response = await api.post("/api/staff/deleted-admin", { _id: id });
  return response.data;
};

// Ta'tilga yuborish
export const sendAdminOnLeave = async (leaveData: any) => {
  const response = await api.post("/api/staff/leave-staff", {
    _id: leaveData._id,
    start_date: leaveData.start_date,
    end_date: leaveData.end_date,
    reason: leaveData.reason,
  });
  return response.data;
};

// Ta'tildan qaytarish
export const returnAdminFromLeave = async (id: string) => {
  const response = await api.post("/api/staff/leave-exit-staff", { _id: id });
  return response.data;
};

// Ishga qaytarish
export const returnAdminToWork = async (id: string) => {
  const response = await api.post("/api/staff/return-work-staff", { _id: id });
  return response.data;
};

// Admin ma'lumotlarini olish
export const fetchAdminInfo = async (id: string) => {
  const response = await api.get(`/api/staff/info/${id}`);
  return response.data?.data || response.data;
};
