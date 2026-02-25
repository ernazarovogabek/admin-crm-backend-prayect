'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Language = 'uz' | 'ru' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    uz: {
        'dashboard': 'Dashboard', 'students': 'Talabalar', 'teachers': 'Ustozlar', 'groups': 'Guruhlar',
        'courses': 'Kurslar', 'payments': 'To\'lovlar', 'admins': 'Adminlar', 'managers': 'Menegerlar',
        'settings': 'Sozlamalar', 'profile': 'Profil', 'totalStudents': 'Jami talabalar',
        'totalTeachers': 'Jami ustozlar', 'totalGroups': 'Jami guruhlar', 'totalCourses': 'Jami kurslar',
        'activeStudents': 'Faol talabalar', 'onLeave': 'Ta\'tilda', 'completed': 'Yakunlangan',
        'monthlyRevenue': 'Oylik daromad', 'totalPayments': 'Jami to\'lovlar', 'debtors': 'Qarzdorlar',
        'add': 'Qo\'shish', 'edit': 'Tahrirlash', 'delete': 'O\'chirish', 'save': 'Saqlash',
        'cancel': 'Bekor qilish', 'search': 'Qidirish', 'filter': 'Filter', 'export': 'Export',
        'import': 'Import', 'view': 'Ko\'rish', 'close': 'Yopish', 'name': 'Ism', 'firstName': 'Ism',
        'lastName': 'Familiya', 'email': 'Email', 'phone': 'Telefon', 'status': 'Holat',
        'actions': 'Amallar', 'active': 'Faol', 'inactive': 'Nofaol', 'all': 'Barchasi',
        'loading': 'Yuklanmoqda...', 'noData': 'Ma\'lumot yo\'q', 'price': 'Narx', 'date': 'Sana',
        'description': 'Tavsif', 'recentPayments': 'Oxirgi to\'lovlar', 'paymentsList': 'To\'lovlar',
        'debtorsList': 'Qarzdorlar', 'studentSearch': 'Qidirish', 'amount': 'Summa', 'month': 'Oy',
        'method': 'Usul', 'group': 'Guruh', 'debt': 'Qarz', 'appearance': 'Ko\'rinish', 'theme': 'Tema',
        'light': 'Yorug\'', 'dark': 'Qorong\'i', 'language': 'Til', 'notifications': 'Bildirishnomalar',
        'system': 'Tizim', 'autoBackup': 'Avtomatik zaxira', 'security': 'Xavfsizlik',
        'deleteAllData': 'Barcha ma\'lumotlarni o\'chirish', 'settingsSaved': 'Sozlamalar saqlandi!',
        'addStudent': 'Talaba qo\'shish', 'studentsList': 'Talabalar ro\'yxati', 'newStudent': 'Yangi talaba',
        'addTeacher': 'Ustoz qo\'shish', 'teachersList': 'Ustozlar ro\'yxati', 'addGroup': 'Guruh qo\'shish',
        'groupsList': 'Guruhlar ro\'yxati', 'addCourse': 'Kurs qo\'shish', 'coursesList': 'Kurslar ro\'yxati',
        'category': 'Kategoriya',
    },
    ru: {
        'dashboard': 'Панель', 'students': 'Студенты', 'teachers': 'Преподаватели', 'groups': 'Группы',
        'courses': 'Курсы', 'payments': 'Платежи', 'admins': 'Админы', 'managers': 'Менеджеры',
        'settings': 'Настройки', 'profile': 'Профиль', 'totalStudents': 'Всего студентов',
        'totalTeachers': 'Всего преподавателей', 'totalGroups': 'Всего групп', 'totalCourses': 'Всего курсов',
        'activeStudents': 'Активные', 'onLeave': 'В отпуске', 'completed': 'Завершено',
        'monthlyRevenue': 'Месячный доход', 'totalPayments': 'Всего платежей', 'debtors': 'Должники',
        'add': 'Добавить', 'edit': 'Редактировать', 'delete': 'Удалить', 'save': 'Сохранить',
        'cancel': 'Отмена', 'search': 'Поиск', 'filter': 'Фильтр', 'export': 'Экспорт',
        'import': 'Импорт', 'view': 'Просмотр', 'close': 'Закрыть', 'name': 'Имя', 'firstName': 'Имя',
        'lastName': 'Фамилия', 'email': 'Email', 'phone': 'Телефон', 'status': 'Статус',
        'actions': 'Действия', 'active': 'Активный', 'inactive': 'Неактивный', 'all': 'Все',
        'loading': 'Загрузка...', 'noData': 'Нет данных', 'price': 'Цена', 'date': 'Дата',
        'description': 'Описание', 'recentPayments': 'Последние платежи', 'paymentsList': 'Платежи',
        'debtorsList': 'Должники', 'studentSearch': 'Поиск', 'amount': 'Сумма', 'month': 'Месяц',
        'method': 'Метод', 'group': 'Группа', 'debt': 'Долг', 'appearance': 'Вид', 'theme': 'Тема',
        'light': 'Светлая', 'dark': 'Темная', 'language': 'Язык', 'notifications': 'Уведомления',
        'system': 'Система', 'autoBackup': 'Авто резервное копирование', 'security': 'Безопасность',
        'deleteAllData': 'Удалить все данные', 'settingsSaved': 'Настройки сохранены!',
        'addStudent': 'Добавить студента', 'studentsList': 'Список студентов', 'newStudent': 'Новый студент',
        'addTeacher': 'Добавить преподавателя', 'teachersList': 'Список преподавателей', 'addGroup': 'Добавить группу',
        'groupsList': 'Список групп', 'addCourse': 'Добавить курс', 'coursesList': 'Список курсов',
        'category': 'Категория',
    },
    en: {
        'dashboard': 'Dashboard', 'students': 'Students', 'teachers': 'Teachers', 'groups': 'Groups',
        'courses': 'Courses', 'payments': 'Payments', 'admins': 'Admins', 'managers': 'Managers',
        'settings': 'Settings', 'profile': 'Profile', 'totalStudents': 'Total Students',
        'totalTeachers': 'Total Teachers', 'totalGroups': 'Total Groups', 'totalCourses': 'Total Courses',
        'activeStudents': 'Active Students', 'onLeave': 'On Leave', 'completed': 'Completed',
        'monthlyRevenue': 'Monthly Revenue', 'totalPayments': 'Total Payments', 'debtors': 'Debtors',
        'add': 'Add', 'edit': 'Edit', 'delete': 'Delete', 'save': 'Save',
        'cancel': 'Cancel', 'search': 'Search', 'filter': 'Filter', 'export': 'Export',
        'import': 'Import', 'view': 'View', 'close': 'Close', 'name': 'Name', 'firstName': 'First Name',
        'lastName': 'Last Name', 'email': 'Email', 'phone': 'Phone', 'status': 'Status',
        'actions': 'Actions', 'active': 'Active', 'inactive': 'Inactive', 'all': 'All',
        'loading': 'Loading...', 'noData': 'No data', 'price': 'Price', 'date': 'Date',
        'description': 'Description', 'recentPayments': 'Recent Payments', 'paymentsList': 'Payments',
        'debtorsList': 'Debtors', 'studentSearch': 'Search', 'amount': 'Amount', 'month': 'Month',
        'method': 'Method', 'group': 'Group', 'debt': 'Debt', 'appearance': 'Appearance', 'theme': 'Theme',
        'light': 'Light', 'dark': 'Dark', 'language': 'Language', 'notifications': 'Notifications',
        'system': 'System', 'autoBackup': 'Auto Backup', 'security': 'Security',
        'deleteAllData': 'Delete All Data', 'settingsSaved': 'Settings saved!',
        'addStudent': 'Add Student', 'studentsList': 'Students List', 'newStudent': 'New Student',
        'addTeacher': 'Add Teacher', 'teachersList': 'Teachers List', 'addGroup': 'Add Group',
        'groupsList': 'Groups List', 'addCourse': 'Add Course', 'coursesList': 'Courses List',
        'category': 'Category',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('uz');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && ['uz', 'ru', 'en'].includes(savedLanguage)) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            language: 'uz',
            setLanguage: () => { },
            t: (key: string) => key,
        };
    }
    return context;
}
