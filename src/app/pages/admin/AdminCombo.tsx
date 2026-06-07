import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Package, Search } from "lucide-react";
import { adminApi } from "@/features/admin/api";

interface ComboItem {
  id: string;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  status: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  images: [] as string[],
  price: 0,
  originalPrice: 0,
  status: "active" as const,
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function AdminCombo() {
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listProducts({ size: 100 })
      .then((r) => {
        setCombos(
          r.data
            .filter((p: any) => p.is_combo)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              image: p.images?.[0] || "",
              price: p.base_price_vnd,
              originalPrice: p.combo_original_price_vnd,
              status: p.status,
            })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: ComboItem) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      images: c.images || (c.image ? [c.image] : []),
      price: c.price,
      originalPrice: c.originalPrice || 0,
      status: c.status as any,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    const slug = makeSlug(form.name);
    const data = {
      slug,
      name: form.name,
      description: form.description || undefined,
      base_price_vnd: form.price,
      images: form.images || [],
      is_combo: true,
      combo_original_price_vnd:
        form.originalPrice > 0 ? form.originalPrice : undefined,
      status: form.status,
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, data);
        setCombos((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  name: data.name,
                  description: data.description || "",
                  images: data.images || [],
                  image: data.images?.[0] || "",
                  price: data.base_price_vnd,
                  originalPrice: data.combo_original_price_vnd,
                  status: data.status!,
                }
              : c,
          ),
        );
      } else {
        const res = await adminApi.createProduct(data);
        const newId = res.product_id || slug;
        setCombos((prev) => [
          ...prev,
          {
            id: newId,
            name: form.name,
            description: form.description,
            images: form.images || [],
            image: form.images?.[0] || "",
            price: form.price,
            originalPrice: form.originalPrice || undefined,
            status: form.status,
          },
        ]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Loi tao combo. Vui long thu lai.");
    }
  };

  const handleDelete = (id: string) => {
    adminApi.deleteProduct(id).catch(() => {});
    setCombos((prev) => prev.filter((c) => c.id !== id));
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
            Combo
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{combos.length} combo</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Thêm combo
        </button>
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
                  Combo
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Giá gốc
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Giá combo
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Trạng thái
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {combos.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 overflow-hidden">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={16} style={{ color: "#cc323f" }} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {c.name}
                        </p>
                        {c.description && (
                          <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    {c.originalPrice ? (
                      <span className="text-gray-400 line-through">
                        {c.originalPrice.toLocaleString()}₫
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span
                      className="font-semibold"
                      style={{ color: "#cc323f" }}
                    >
                      {c.price.toLocaleString()}₫
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden md:table-cell">
                    {c.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        Đang bán
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Đã ẩn
                      </span>
                    )}
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
                        onClick={() => setDeleteId(c.id)}
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
          {combos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Chưa có combo nào.
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
                {editingId ? "Chỉnh sửa combo" : "Thêm combo mới"}
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
                  Tên combo *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="VD: Combo Tết 2027"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Giá combo (₫) *
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, price: +e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Giá gốc (₫)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        originalPrice: +e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Hình ảnh
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(form.images || []).map((url: string, i: number) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm((f: any) => ({ ...f, images: f.images.filter((_: any, j: number) => j !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">X</button>
                    </div>
                  ))}
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs flex-shrink-0 cursor-pointer hover:bg-gray-50 relative">
                    <span>+</span>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await adminApi.uploadImage(file);
                          setForm((f: any) => ({ ...f, images: [...(f.images || []), result.url] }));
                        } catch { alert("Tải ảnh thất bại."); }
                        e.target.value = "";
                      }} />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex gap-2">
                      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Hoặc nhập URL..."
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
                      <button onClick={() => { if (imageUrl) { setForm((f: any) => ({ ...f, images: [...(f.images || []), imageUrl] })); setImageUrl(""); } }}
                        className="px-3 py-2 rounded-xl text-white text-sm font-medium" style={{ background: "#cc323f" }}>Thêm</button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả combo..."
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
              Xóa combo?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Combo sẽ bị xóa vĩnh viễn.
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
