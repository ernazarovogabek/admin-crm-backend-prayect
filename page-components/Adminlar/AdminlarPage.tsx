
"use client"

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminlarPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get<Admin[]>(
          "http://localhost:7070/api/staff/all-admins"
        );
        setAdmins(response.data);
      } catch (err) {
        const error = err as AxiosError;
        setError(
          error.response?.data
            ? "Serverdan xatolik qaytdi."
            : "Admin ma'lumotlarini olishda xatolik yuz berdi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Adminlar Ro'yxati</h1>
      {admins.length === 0 ? (
        <p>Hozircha admin yo‘q.</p>
      ) : (
        <ul>
          {admins.map((admin) => (
            <li key={admin.id}>
              <strong>
                {admin.firstName} {admin.lastName}
              </strong>
              <br />
              Email: {admin.email}
              <br />
              Rol: {admin.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminlarPage;
