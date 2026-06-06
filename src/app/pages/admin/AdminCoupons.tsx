import { useState, useEffect } from "react";
import { Plus, Trash2, X, Search, Tag } from "lucide-react";
import { adminApi } from "@/features/admin/api";

interface CouponItem {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_vnd: number;
  uses: number;
  max_uses: number;
  remaining: number;
  status: string;
  expires_at?: string;
}

const EMPTY_FORM = {
  code: "",
  discount_type: "percent" as const,
  discount_value: 1000,
  min_order_vnd: 0,
  max_uses: 100,
  starts_at: "",
  expires_at: "",
  status: "active",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listCoupons()
      .then((r: any) => setCoupons(Array.isArray(r) ? r : r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const activeCoupons = coupons.filter((c) => c.status === "active");
  const filtered = activeCoupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async () => {
    if (!form.code.trim()) return;
    try {
      await adminApi.createCoupon({
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_vnd: form.min_order_vnd || undefined,
        max_uses: form.max_uses || undefined,
        starts_at: form.starts_at || undefined,
        expires_at: form.expires_at || undefined,
        status: form.status === "active" ? undefined : form.status,
      });
      load();
    } catch {
      /* ignore */
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteCoupon(id);
    } catch {
      /* ignore */
    }
    setCoupons((p) => p.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const activeCount = activeCoupons.length;
  const totalCount = coupons.length;

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
            Mã giảm giá
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {coupons.length} mã đang hoạt động
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Tạo mã mới
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
            placeholder="Tìm mã..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Tổng mã</p>
          <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
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
                  Mã
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Loại
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Giá trị
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Lượt dùng
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Còn lại
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr
                  key={c.code}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 font-mono font-semibold text-sm"
                      style={{ color: "#cc323f" }}
                    >
                      <Tag size={13} /> {c.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      {c.discount_type === "percent"
                        ? `${c.discount_value / 100}%`
                        : `${c.discount_value.toLocaleString()}₫`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span className="text-gray-600 font-medium">
                      {c.discount_type === "percent"
                        ? `${c.discount_value / 100}%`
                        : `${c.discount_value.toLocaleString()}₫`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden md:table-cell">
                    <span className="text-gray-600">{c.uses}</span>
                    {c.max_uses ? (
                      <span className="text-gray-400">/{c.max_uses}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 text-center hidden md:table-cell">
                    <span
                      className="font-medium"
                      style={{ color: c.remaining > 0 ? "#16a34a" : "#dc2626" }}
                    >
                      {c.remaining ?? c.max_uses}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Chưa có mã giảm giá nào.
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
                Tạo mã giảm giá
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
                  Mã code *
                </label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 font-mono uppercase"
                  placeholder="VD: TET2027"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Loại giảm giá
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discount_type: e.target.value as any,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Giá trị cố định (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {form.discount_type === "percent"
                      ? "Giá trị (bps, 1000 = 10%)"
                      : "Giá trị (₫)"}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discount_value: +e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Đơn tối thiểu (₫)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_vnd}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, min_order_vnd: +e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số lần dùng tối đa
                  </label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, max_uses: +e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Hết hạn
                </label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expires_at: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
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
                Tạo mã
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
              Xóa mã?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Mã {coupons.find((c) => c.id === deleteId)?.code || deleteId} sẽ
              bị xóa.
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
