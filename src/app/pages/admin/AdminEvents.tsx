import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  MapPin,
  CalendarDays,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  description: "",
  date: "",
  location: "",
  capacity: 100,
  image: "",
};

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (ev: any) => {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      description: ev.description,
      date: ev.date,
      location: ev.location,
      capacity: ev.capacity,
      image: ev.image,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.date.trim()) return;
    if (editingId) {
      setEvents((evs) =>
        evs.map((e) => (e.id === editingId ? { ...e, ...form } : e)),
      );
    } else {
      setEvents((evs) => [
        ...evs,
        { id: "ev" + Date.now(), registeredUsers: 0, ...form },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setEvents((evs) => evs.filter((e) => e.id !== id));
    setDeleteId(null);
  };

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Sự kiện
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {events.length} sự kiện đã tạo
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Tạo sự kiện
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((ev) => {
          const pct = Math.min(
            100,
            Math.round((ev.registeredUsers / ev.capacity) * 100),
          );
          const isFull = pct >= 100;
          const isAlmostFull = pct >= 80 && !isFull;
          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {ev.image && (
                <div className="h-36 overflow-hidden bg-gray-100">
                  <img
                    src={ev.image}
                    alt={ev.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {ev.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(ev.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {ev.description}
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays
                      size={12}
                      className="flex-shrink-0"
                      style={{ color: "#cc323f" }}
                    />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin
                      size={12}
                      className="flex-shrink-0"
                      style={{ color: "#cc323f" }}
                    />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users
                      size={12}
                      className="flex-shrink-0"
                      style={{ color: "#cc323f" }}
                    />
                    <span>
                      {ev.registeredUsers}/{ev.capacity} đã đăng ký
                    </span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: isFull
                          ? "#dc2626"
                          : isAlmostFull
                            ? "#d97706"
                            : "#cc323f",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {pct}% capacity
                    </span>
                    {isFull && (
                      <span className="text-xs font-medium text-red-500">
                        Đã đầy
                      </span>
                    )}
                    {isAlmostFull && (
                      <span className="text-xs font-medium text-amber-500">
                        Gần đầy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
            <p>Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                {editingId ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tên sự kiện *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Ví dụ: Lễ Vu Lan Báo Hiếu 2026"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mô tả sự kiện
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Giới thiệu về sự kiện..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Ngày diễn ra *
                  </label>
                  <input
                    value={form.date}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Sức chứa
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, capacity: +e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Địa điểm
                </label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Tên địa điểm, địa chỉ..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  URL hình ảnh sự kiện
                </label>
                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, image: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #cc323f, #902131)",
                }}
              >
                {editingId ? "Lưu thay đổi" : "Tạo sự kiện"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3
              className="font-semibold text-gray-900 mb-1"
              style={{ fontFamily: "Lora, serif" }}
            >
              Xóa sự kiện?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Dữ liệu sự kiện sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "#cc323f" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
