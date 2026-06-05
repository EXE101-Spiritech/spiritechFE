import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, FolderTree } from "lucide-react";
import { adminApi, Category } from "@/features/admin/api";

const EMPTY_FORM = {
  Name: "",
  Slug: "",
  NameEN: "",
  Description: "",
  SortOrder: 1,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listCategories()
      .then((r) => setCategories(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = categories.filter(
    (c) =>
      c.Name.toLowerCase().includes(search.toLowerCase()) ||
      c.Slug.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.ID);
    setForm({
      Name: c.Name,
      Slug: c.Slug,
      NameEN: c.NameEN || "",
      Description: c.Description || "",
      SortOrder: c.SortOrder || 1,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.Name.trim()) return;
    const slug =
      form.Slug ||
      form.Name.toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const data = { name: form.Name, slug };
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, data);
      } else {
        await adminApi.createCategory(data);
      }
      load();
    } catch {
      /* ignore */
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteCategory(id);
    } catch {
      /* ignore */
    }
    setCategories((p) => p.filter((c) => c.ID !== id));
    setDeleteId(null);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Danh mục
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length} danh mục
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "#faf9f8" }}
                className="border-b border-gray-100"
              >
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">
                  Danh mục
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Tên EN
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden lg:table-cell">
                  Thứ tự
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr
                  key={c.ID}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(204,50,63,0.08)" }}
                      >
                        <FolderTree size={16} style={{ color: "#cc323f" }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {c.Name}
                        </p>
                        {c.Description && (
                          <p className="text-gray-400 text-xs mt-0.5">
                            {c.Description.slice(0, 60)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-400 font-mono text-xs">
                      {c.Slug}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-gray-500 text-sm">
                      {c.NameEN || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                    <span className="text-gray-600">{c.SortOrder || 1}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.ID)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Chưa có danh mục nào.
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tên danh mục *
                </label>
                <input
                  value={form.Name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, Name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="VD: Bàn Thờ & Tủ Thờ"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Slug</label>
                <input
                  value={form.Slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, Slug: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Tự động từ tên"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tên tiếng Anh
                  </label>
                  <input
                    value={form.NameEN}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, NameEN: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={form.SortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, SortOrder: +e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.Description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, Description: e.target.value }))
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả ngắn..."
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
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #cc323f, #902131)",
                }}
              >
                {editingId ? "Lưu" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              Xóa danh mục?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Danh mục sẽ bị xóa vĩnh viễn.
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
