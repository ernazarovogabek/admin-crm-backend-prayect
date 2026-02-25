'use client'

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPayments, fetchDebtors, searchStudent } from "@/lib/queries/paymentQueries";
import { useLanguage } from "@/context/LanguageContext";

export default function PaymentPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"payments" | "debtors" | "search">("payments");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // To'lovlar
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
    enabled: activeTab === "payments",
  });

  // Qarzdorlar
  const { data: debtors = [], isLoading: debtorsLoading } = useQuery({
    queryKey: ["debtors", selectedMonth],
    queryFn: () => fetchDebtors(selectedMonth),
    enabled: activeTab === "debtors",
  });

  // Talaba qidirish
  const { data: students = [], isLoading: searchLoading } = useQuery({
    queryKey: ["searchStudent", searchQuery],
    queryFn: () => searchStudent(searchQuery),
    enabled: activeTab === "search" && searchQuery.length > 0,
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("uz-UZ");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">To'lovlar</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "payments"
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          To'lovlar
        </button>
        <button
          onClick={() => setActiveTab("debtors")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "debtors"
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          Qarzdorlar
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "search"
            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
        >
          Qidirish
        </button>
      </div>

      {/* To'lovlar tab */}
      {activeTab === "payments" && (
        <div>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">To'lovlar topilmadi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left dark:text-white">Talaba</th>
                    <th className="p-3 text-left dark:text-white">Guruh</th>
                    <th className="p-3 text-left dark:text-white">Summa</th>
                    <th className="p-3 text-left dark:text-white">Oy</th>
                    <th className="p-3 text-left dark:text-white">Usul</th>
                    <th className="p-3 text-left dark:text-white">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 dark:text-gray-300">
                        {payment.student_id?.first_name} {payment.student_id?.last_name}
                      </td>
                      <td className="p-3 dark:text-gray-300">{payment.group_id?.name}</td>
                      <td className="p-3 dark:text-gray-300">{formatCurrency(payment.payment_price)}</td>
                      <td className="p-3 dark:text-gray-300">{payment.month}</td>
                      <td className="p-3 dark:text-gray-300">{payment.method}</td>
                      <td className="p-3 dark:text-gray-300">{formatDate(payment.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Qarzdorlar tab */}
      {activeTab === "debtors" && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-white">Oy tanlang:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {debtorsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : debtors.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Qarzdorlar topilmadi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left dark:text-white">Ism</th>
                    <th className="p-3 text-left dark:text-white">Familiya</th>
                    <th className="p-3 text-left dark:text-white">Telefon</th>
                    <th className="p-3 text-left dark:text-white">Qarz</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.map((debtor) => (
                    <tr key={debtor._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 dark:text-gray-300">{debtor.first_name}</td>
                      <td className="p-3 dark:text-gray-300">{debtor.last_name}</td>
                      <td className="p-3 dark:text-gray-300">{debtor.phone}</td>
                      <td className="p-3 text-red-600 dark:text-red-400">
                        {debtor.debt_amount ? formatCurrency(debtor.debt_amount) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Qidirish tab */}
      {activeTab === "search" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Talaba ismi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {searchLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : searchQuery.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Qidirish uchun ism kiriting</p>
          ) : students.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Talaba topilmadi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left dark:text-white">Ism</th>
                    <th className="p-3 text-left dark:text-white">Familiya</th>
                    <th className="p-3 text-left dark:text-white">Telefon</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 dark:text-gray-300">{student.first_name}</td>
                      <td className="p-3 dark:text-gray-300">{student.last_name}</td>
                      <td className="p-3 dark:text-gray-300">{student.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
