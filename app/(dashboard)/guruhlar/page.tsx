'use client'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
    fetchGroups,
    createGroup,
    updateGroup,
    endGroup,
    fetchTeachers,
    fetchCourses,
    type Group,
    type NewGroup
} from "@/lib/queries/groupQueries";

export default function GuruhlarPage() {
    const queryClient = useQueryClient();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [searchName, setSearchName] = useState("");
    const [newGroup, setNewGroup] = useState<NewGroup>({
        course_id: "",
        teacher: "",
        started_group: new Date().toISOString().split('T')[0],
    });
    const [editGroup, setEditGroup] = useState<any>({
        _id: "",
        group_name: "",
        teacher: "",
        date: "",
        ended_group: ""
    });

    // Queries
    const { data: groups = [], isLoading, isError } = useQuery({
        queryKey: ['groups', searchName],
        queryFn: () => fetchGroups(searchName),
        retry: 1,
    });

    const { data: teachers = [] } = useQuery({
        queryKey: ['teachers'],
        queryFn: fetchTeachers,
        retry: 1,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: fetchCourses,
        retry: 1,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setShowAddModal(false);
            setNewGroup({
                course_id: "",
                teacher: "",
                started_group: new Date().toISOString().split('T')[0],
            });
            toast.success("Guruh muvaffaqiyatli qo'shildi!");
        },
        onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
    });

    const updateMutation = useMutation({
        mutationFn: updateGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setShowEditModal(false);
            setSelectedGroup(null);
            toast.success("Guruh muvaffaqiyatli tahrirlandi!");
        },
        onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
    });

    const endMutation = useMutation({
        mutationFn: endGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success("Guruh muvaffaqiyatli tugatildi!");
        },
        onError: (error: any) => toast.error(`Xatolik: ${error.response?.data?.message || error.message}`),
    });

    // Handlers
    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newGroup);
    };

    const handleEditGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        updateMutation.mutate(editGroup);
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Guruhni tugatmoqchimisiz?")) return;
        endMutation.mutate(id);
    };

    const openEditModal = (group: Group) => {
        setSelectedGroup(group);
        setEditGroup({
            _id: group._id,
            group_name: group.name,
            teacher: typeof group.teacher === 'object' ? group.teacher?._id : group.teacher || "",
            date: group.started_group ? new Date(group.started_group).toISOString().split('T')[0] : "",
            ended_group: group.ended_group ? new Date(group.ended_group).toISOString().split('T')[0] : ""
        });
        setShowEditModal(true);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex gap-3">
                        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {['Guruh nomi', 'Ustoz', 'Boshlanish', 'Tugash', 'Talabalar', 'Amallar'].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    {[32, 40, 24, 24, 16, 16].map((w, idx) => (
                                        <td key={idx} className="px-6 py-4"><div className={`h-5 w-${w} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (isError) return <div className="p-6 text-red-600 dark:text-red-400">Guruhlar ma'lumotlarini olishda xatolik yuz berdi.</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Guruhlar ro'yxati</h1>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Guruh nomi bo'yicha qidirish"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        + Guruh qo'shish
                    </button>
                </div>
            </div>

            {groups.length === 0 ? (
                <p className="dark:text-gray-300">Hozircha guruh yo'q.</p>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruh nomi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ustoz</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boshlanish sanasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tugash sanasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Talabalar soni</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {groups.map((group) => (
                                <tr key={group._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                            {group.teacher ? `${group.teacher.first_name} ${group.teacher.last_name}` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                            {group.started_group ? new Date(group.started_group).toLocaleDateString('uz-UZ') : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                            {group.ended_group ? new Date(group.ended_group).toLocaleDateString('uz-UZ') : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {group.students_count || 0} ta
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            onChange={(e) => {
                                                const action = e.target.value;
                                                if (action === 'edit') openEditModal(group);
                                                else if (action === 'delete') handleDelete(group._id);
                                                e.target.value = '';
                                            }}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm cursor-pointer"
                                        >
                                            <option value="">...</option>
                                            <option value="edit">Tahrirlash</option>
                                            <option value="delete">Tugatish</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Guruh qo'shish Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi Guruh qo'shish</h2>
                        <form onSubmit={handleAddGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kurs</label>
                                <select
                                    required
                                    value={newGroup.course_id}
                                    onChange={(e) => setNewGroup({ ...newGroup, course_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Kurs tanlang</option>
                                    {courses.map((course: any) => (
                                        <option key={course._id} value={course._id}>
                                            {typeof course.name === 'object' ? course.name.name : course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ustoz</label>
                                <select
                                    required
                                    value={newGroup.teacher}
                                    onChange={(e) => setNewGroup({ ...newGroup, teacher: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Ustoz tanlang</option>
                                    {teachers.map((teacher: any) => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.first_name} {teacher.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boshlanish sanasi</label>
                                <input
                                    type="date"
                                    required
                                    value={newGroup.started_group}
                                    onChange={(e) => setNewGroup({ ...newGroup, started_group: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {createMutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Guruh tahrirlash Modal */}
            {showEditModal && selectedGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Guruhni tahrirlash</h2>
                        <form onSubmit={handleEditGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guruh nomi</label>
                                <input
                                    type="text"
                                    required
                                    value={editGroup.group_name}
                                    onChange={(e) => setEditGroup({ ...editGroup, group_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ustoz</label>
                                <select
                                    required
                                    value={editGroup.teacher}
                                    onChange={(e) => setEditGroup({ ...editGroup, teacher: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Ustoz tanlang</option>
                                    {teachers.map((teacher: any) => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.first_name} {teacher.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boshlanish sanasi</label>
                                <input
                                    type="date"
                                    required
                                    value={editGroup.date}
                                    onChange={(e) => setEditGroup({ ...editGroup, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tugash sanasi</label>
                                <input
                                    type="date"
                                    value={editGroup.ended_group}
                                    onChange={(e) => setEditGroup({ ...editGroup, ended_group: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
