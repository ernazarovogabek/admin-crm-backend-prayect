'use client'

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Payment {
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

interface Debtor {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  debt_amount?: number;
}

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export default function Payment() {
  const [activeTab, setActiveTab] = useState<'payments' | 'debtors' | 'search'>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [searchName, setSearchName] = useState<string>("");
  const router = useRouter();

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get("/api/payment/payment-student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebtors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(
        `/api/payment/get-debtors-student?month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data || response.data || [];
      setDebtors(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const searchStudent = async () => {
    if (!searchName.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(
        `/api/payment/search-student?name=${searchName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data || response.data || [];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      console.error("Xatolik:", error);
      setError("Ma'lumotlarni olishda xatolik yuz berdi.");
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'debtors') {
      fetchDebtors();
    }
  }, [activeTab, selectedMonth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'search') {
        searchStudent();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName, activeTab]);

  if (loading && activeTab === 'payments' && payments.length === 0) {
    return <div className="p-6"><p className="dark:text-white">Yuklanmoqda...</p></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">To'lovlar</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'payments'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          To'lovlar
        </button>
        <button
          onClick={() => setActiveTab('debtors')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'debtors'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Qarzdorlar
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'search'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Qidiruv
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          {payments.length === 0 ? (
            <p className="dark:text-gray-300">Hozircha to'lov yo'q.</p>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Talaba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Guruh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Oy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Usul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Sana
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.student_id?.first_name} {payment.student_id?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.group_id?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.payment_price?.toLocaleString()} so'm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {payment.month}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {new Date(payment.paidAt).toLocaleDateString('uz-UZ')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Debtors Tab */}
      {activeTab === 'debtors' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Oy tanlang
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading ? (
            <p className="dark:text-white">Yuklanmoqda...</p>
          ) : debtors.length === 0 ? (
            <p className="dark:text-gray-300">Bu oyda qarzdor yo'q.</p>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Ism
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Familya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Qarz
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {debtors.map((debtor) => (
                    <tr key={debtor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {debtor.first_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {debtor.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {debtor.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {debtor.debt_amount ? `${debtor.debt_amount.toLocaleString()} so'm` : 'Qarzdor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Talaba ismi
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Talaba ismini kiriting..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading ? (
            <p className="dark:text-white">Qidirilmoqda...</p>
          ) : searchResults.length === 0 && searchName ? (
            <p className="dark:text-gray-300">Talaba topilmadi.</p>
          ) : searchResults.length > 0 ? (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Ism
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Familya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Telefon
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.first_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {student.phone}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
