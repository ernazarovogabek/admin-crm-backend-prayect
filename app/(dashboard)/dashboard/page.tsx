'use client'

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchRecentPayments, fetchRecentStudents } from "@/lib/queries/dashboardQueries";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const { data: recentPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["recentPayments"],
    queryFn: fetchRecentPayments,
  });

  const { data: recentStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["recentStudents"],
    queryFn: fetchRecentStudents,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  const StatCard = ({ title, value, icon, color, loading }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${color}`}>
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-3xl font-bold mt-2 dark:text-white">{value || 0}</p>
            </div>
            <div className="text-4xl">{icon}</div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('dashboard')}</h1>

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('totalStudents')}
          value={stats.totalStudents}
          icon="👨‍🎓"
          color="border-blue-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('totalTeachers')}
          value={stats.totalTeachers}
          icon="👨‍🏫"
          color="border-green-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('totalGroups')}
          value={stats.totalGroups}
          icon="👥"
          color="border-purple-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('totalCourses')}
          value={stats.totalCourses}
          icon="📚"
          color="border-orange-500"
          loading={statsLoading}
        />
      </div>

      {/* Talabalar holati */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('activeStudents')}
          value={stats.activeStudents}
          icon="✅"
          color="border-green-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('onLeave')}
          value={stats.onLeaveStudents}
          icon="🏖️"
          color="border-yellow-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('completed')}
          value={stats.completedStudents}
          icon="🎓"
          color="border-gray-500"
          loading={statsLoading}
        />
      </div>

      {/* Moliyaviy ma'lumotlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
          {statsLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('monthlyRevenue')}</p>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {stats.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : "0 so'm"}
              </p>
            </>
          )}
        </div>
        <StatCard
          title={t('totalPayments')}
          value={stats.totalPayments}
          icon="💰"
          color="border-blue-500"
          loading={statsLoading}
        />
        <StatCard
          title={t('debtors')}
          value={stats.totalDebtors}
          icon="⚠️"
          color="border-red-500"
          loading={statsLoading}
        />
      </div>

      {/* Oxirgi to'lovlar va talabalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oxirgi to'lovlar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Oxirgi to'lovlar</h2>
            <Link href="/payment" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Barchasi →
            </Link>
          </div>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">To'lovlar yo'q</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment: any) => (
                <div key={payment._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium dark:text-white">
                      {payment.student_id?.first_name} {payment.student_id?.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{payment.group_id?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(payment.payment_price)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{payment.month}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Oxirgi talabalar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Yangi talabalar</h2>
            <Link href="/studentlar" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Barchasi →
            </Link>
          </div>
          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : recentStudents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Talabalar yo'q</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((student: any) => (
                <div key={student._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium dark:text-white">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.phone}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${student.status === 'faol' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    student.status === "ta'tilda" ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                    {student.status || 'faol'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
