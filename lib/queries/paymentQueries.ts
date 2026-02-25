import api from "../api";

export interface Payment {
  _id: string;
  student_id: {
    first_name: string;
    last_name: string;
  };
  group_id: {
    name: string;
  };
  payment_price: number;
  month: string;
  method: string;
  paidAt: string;
}

export interface Debtor {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  debt_amount?: number;
}

export interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// To'lovlarni olish
export const fetchPayments = async (): Promise<Payment[]> => {
  const response = await api.get("/api/payment/payment-student");
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};

// Qarzdorlarni olish
export const fetchDebtors = async (month: string): Promise<Debtor[]> => {
  const response = await api.get(`/api/payment/get-debtors-student?month=${month}`);
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};

// Talaba qidirish
export const searchStudent = async (name: string): Promise<Student[]> => {
  if (!name.trim()) return [];

  const response = await api.get(`/api/payment/search-student?name=${name}`);
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};
