import api from "../api";

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status?: string;
  work_date?: string;
}

export interface NewManager {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  work_date: string;
  role: string;
}

// Managerlarni olish
export const fetchManagers = async (): Promise<Manager[]> => {
  try {
    const response = await api.get("/api/staff/all-managers");
    const data = response.data?.data || response.data || [];
    
    return Array.isArray(data) ? data.map((manager: any) => ({
      id: manager.id || manager._id || manager.staff_id,
      first_name: manager.first_name,
      last_name: manager.last_name,
      email: manager.email,
      role: manager.role,
      status: manager.status || 'faol',
      work_date: manager.work_date
    })) : [];
  } catch (error: any) {
    // 404 bo'lsa, bo'sh array qaytarish (endpoint mavjud emas)
    if (error.response?.status === 404) {
      console.warn("Manager endpoint topilmadi, bo'sh array qaytarilmoqda");
      return [];
    }
    throw error;
  }
};

// Manager qo'shish
export const createManager = async (managerData: NewManager) => {
  const response = await api.post("/api/staff/create-manager", managerData);
  return response.data;
};

// Manager tahrirlash
export const updateManager = async (managerData: any) => {
  const response = await api.post("/api/staff/edited-manager", {
    id: managerData.id,
    first_name: managerData.first_name,
    last_name: managerData.last_name,
    email: managerData.email,
    role: managerData.role
  });
  return response.data;
};

// Manager o'chirish
export const deleteManager = async (id: string) => {
  const response = await api.delete(`/api/staff/delete/${id}`);
  return response.data;
};
