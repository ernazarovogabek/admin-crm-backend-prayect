import api from "../api";

export interface DashboardStats {
    totalStudents?: number;
    totalTeachers?: number;
    totalGroups?: number;
    totalCourses?: number;
    activeStudents?: number;
    onLeaveStudents?: number;
    completedStudents?: number;
    totalPayments?: number;
    monthlyRevenue?: number;
    totalDebtors?: number;
}

// Dashboard statistikasini olish
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Barcha API chaqiruvlarni parallel qilish (tezroq)
        const [
            studentsResponse,
            teachersResponse,
            groupsResponse,
            coursesResponse,
            paymentsResponse,
            debtorsResponse
        ] = await Promise.allSettled([
            api.get("/api/student/get-all-students"),
            api.get("/api/teacher/get-all-teachers"),
            api.get("/api/group/get-all-group"),
            api.get("/api/course/get-courses"),
            api.get("/api/payment/payment-student"),
            api.get(`/api/payment/get-debtors-student?month=${currentMonth}`)
        ]);

        // Students
        const students = studentsResponse.status === 'fulfilled'
            ? (studentsResponse.value.data?.data || studentsResponse.value.data || [])
            : [];
        const totalStudents = Array.isArray(students) ? students.length : 0;
        const activeStudents = Array.isArray(students) ? students.filter((s: any) => s.status === 'faol').length : 0;
        const onLeaveStudents = Array.isArray(students) ? students.filter((s: any) => s.status === "ta'tilda").length : 0;
        const completedStudents = Array.isArray(students) ? students.filter((s: any) => s.status === 'yakunlandi').length : 0;

        // Teachers
        const teachers = teachersResponse.status === 'fulfilled'
            ? (teachersResponse.value.data?.data || teachersResponse.value.data || [])
            : [];
        const totalTeachers = Array.isArray(teachers) ? teachers.length : 0;

        // Groups
        const groups = groupsResponse.status === 'fulfilled'
            ? (groupsResponse.value.data?.data || groupsResponse.value.data || [])
            : [];
        const totalGroups = Array.isArray(groups) ? groups.length : 0;

        // Courses
        const courses = coursesResponse.status === 'fulfilled'
            ? (coursesResponse.value.data?.data || coursesResponse.value.data || [])
            : [];
        const totalCourses = Array.isArray(courses) ? courses.length : 0;

        // Payments
        const payments = paymentsResponse.status === 'fulfilled'
            ? (paymentsResponse.value.data?.data || paymentsResponse.value.data || [])
            : [];
        const totalPayments = Array.isArray(payments) ? payments.length : 0;
        const monthlyRevenue = Array.isArray(payments)
            ? payments
                .filter((p: any) => p.month?.startsWith(currentMonth))
                .reduce((sum: number, p: any) => sum + (p.payment_price || 0), 0)
            : 0;

        // Debtors
        const debtors = debtorsResponse.status === 'fulfilled'
            ? (debtorsResponse.value.data?.data || debtorsResponse.value.data || [])
            : [];
        const totalDebtors = Array.isArray(debtors) ? debtors.length : 0;

        return {
            totalStudents,
            totalTeachers,
            totalGroups,
            totalCourses,
            activeStudents,
            onLeaveStudents,
            completedStudents,
            totalPayments,
            monthlyRevenue,
            totalDebtors,
        };
    } catch (error: any) {
        console.warn("Dashboard stats topilmadi:", error);
        return {};
    }
};

// Oxirgi to'lovlarni olish
export const fetchRecentPayments = async () => {
    try {
        const response = await api.get("/api/payment/payment-student");
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
        return [];
    }
};

// Oxirgi talabalarni olish
export const fetchRecentStudents = async () => {
    try {
        const response = await api.get("/api/student/get-all-students");
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
        return [];
    }
};
