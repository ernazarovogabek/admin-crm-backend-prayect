import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function KursCard({ kurs, onEdit, onDelete, onFreeze }) {
  return (
    <div className="border border-gray-700 rounded-lg p-4 flex flex-col gap-3 bg-gray-900">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">{kurs.name}</h2>
          <p className="text-gray-400">{kurs.desc}</p>
        </div>
        <span className="bg-gray-800 px-2 py-1 rounded text-sm">{kurs.price}</span>
      </div>

      <div className="flex gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <span>🕒</span>
          {kurs.duration}
        </div>
        <div className="flex items-center gap-1">
          <span>👥</span>
          {kurs.students} students
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={() => onEdit(kurs)} className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-700">
          <FiEdit /> Edit
        </button>
        <button onClick={() => onDelete(kurs)} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          <FiTrash2 /> O'chirish
        </button>
        {kurs.freeze !== undefined && (
          <button onClick={() => onFreeze(kurs)} className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            {kurs.freeze ? "Aktivlashtir" : "Muzlatish"}
          </button>
        )}
      </div>
    </div>
  );
}