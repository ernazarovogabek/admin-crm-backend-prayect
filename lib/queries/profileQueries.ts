import api from "../api";

export interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    createdAt?: string;
    image?: string;
}

export interface UpdateProfileData {
    first_name: string;
    last_name: string;
    email: string;
}

export interface ChangePasswordData {
    old_password: string;
    new_password: string;
}

// Profil ma'lumotlarini olish (localStorage dan)
export const fetchProfile = async (): Promise<UserProfile> => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        throw new Error("User ma'lumotlari topilmadi");
    }

    const userData = JSON.parse(storedUser);
    return {
        first_name: userData.first_name || userData.firstName || "",
        last_name: userData.last_name || userData.lastName || "",
        email: userData.email || "",
        role: userData.role || userData.user_role || "USER",
        createdAt: userData.createdAt || userData.created_at || userData.createddate || "",
        image: userData.image || userData.profile_img || userData.avatar || "",
    };
};

// Profil ma'lumotlarini yangilash
export const updateProfile = async (data: UpdateProfileData) => {
    const response = await api.post("/api/auth/edit-profile", data);
    return response.data;
};

// Profil rasmini yangilash
export const updateProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/api/auth/edit-profile-img", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

// Parolni o'zgartirish
export const changePassword = async (data: ChangePasswordData) => {
    const response = await api.post("/api/auth/edit-password", data);
    return response.data;
};
