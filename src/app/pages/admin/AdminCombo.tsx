import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Package,
  Search,
} from "lucide-react";
import { comboApi } from "@/features/combos/api";
import { adminApi } from "@/features/admin/api";
import { productApi } from "@/features/products/api";

interface ComboItem {
  id: string;
  uuid?: string;
  name: string;
  description: string;
  banner_url: string;
  starts_at: string;
  expires_at: string;
  product_count: number;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  banner_url: "",
  starts_at: "",
  expires_at: "",
  products: [] as { sku: string; discount_bps: number }[],
  sort_order: 1,
};

function makeSlug(name: string): string {
  return name
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Product picker for combo products
  const [productSearch, setProductSearch] = useState("");
  const [allProducts, setAllProducts] = useState<
    { sku: string; name: string }[]
  >([]);
  const [discountBps, setDiscountBps] = useState(1000);

  // Load all products once for the picker
  useEffect(() => {
    productApi
      .list({ limit: 200 })
      .then((r) => {
        const items = (r as any).data || r || [];
        const mapped = (Array.isArray(items) ? items : []).map((p: any) => ({
          sku: p.sku || p.slug || "",
          name: p.name || "",
        }));
        setAllProducts(mapped);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()),
  );

  useEffect(() => {
    comboApi
      .list()
      .then((items) =>
        setCombos(
          items.map((i: any) => ({
            id: i.slug,
            name: i.name,
            description: i.description,
            banner_url: i.banner_url || "",
            starts_at: i.starts_at || "",
            expires_at: i.expires_at || "",
            product_count: i.product_count || 0,
          })),
        ),
      )
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
      banner_url: c.banner_url || "",
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      products: [],
      sort_order: 0,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const slug = makeSlug(form.name);
    const data = {
      slug,
      name: form.name,
      description: form.description,
      banner_url: form.banner_url || undefined,
      starts_at: form.starts_at
        ? new Date(form.starts_at).toISOString()
        : new Date().toISOString(),
      expires_at: form.expires_at
        ? new Date(form.expires_at).toISOString()
        : new Date().toISOString(),
      products: form.products,
      sort_order: form.sort_order,
    };

    if (editingId) {
      const item = combos.find((c) => c.id === editingId);
      await adminApi.updateCombo(item?.uuid || editingId, data).catch(() => {});
      setCombos((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                slug,
                name: data.name,
                description: data.description || "",
                banner_url: data.banner_url || "",
                starts_at: data.starts_at,
                expires_at: data.expires_at,
              }
            : c,
        ),
      );
    } else {
      adminApi
        .createCombo(data)
        .then((res: any) => {
          const newId = res.slug || slug;
          setCombos((prev) => [
            ...prev,
            {
              id: newId,
              uuid: res.id,
              name: form.name,
              description: form.description,
              banner_url: form.banner_url,
              starts_at: form.starts_at,
              expires_at: form.expires_at,
              product_count: 0,
            },
          ]);
        })
        .catch(() => {
          setCombos((prev) => [
            ...prev,
            {
              id: slug,
              name: form.name,
              description: form.description,
              banner_url: form.banner_url,
              starts_at: form.starts_at,
              expires_at: form.expires_at,
              product_count: 0,
            },
          ]);
        });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const item = combos.find((c) => c.id === id);
    adminApi.deleteCombo(item?.uuid || id).catch(() => {});
    setCombos((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const addProduct = (sku: string) => {
    if (form.products.some((p) => p.sku === sku)) return;
    setForm((f) => ({
      ...f,
      products: [...f.products, { sku, discount_bps: discountBps }],
    }));
    setProductSearch("");
  };

  const removeProduct = (sku: string) => {
    setForm((f) => ({
      ...f,
      products: f.products.filter((p) => p.sku !== sku),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Combo sự kiện
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {combos.length} combo đã tạo
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Tạo combo
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
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Mô tả
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Sản phẩm
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden lg:table-cell">
                  Hiệu lực
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
                      {c.banner_url ? (
                        <img
                          src={c.banner_url}
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={16} className="text-gray-400" />
                        </div>
                      )}
                      <p className="font-medium text-gray-800 text-sm">
                        {c.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {c.description}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#fdf4f3", color: "#cc323f" }}
                    >
                      <Package size={11} /> {c.product_count}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {c.starts_at?.slice(0, 10) || "—"} →{" "}
                      {c.expires_at?.slice(0, 10) || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                {editingId ? "Chỉnh sửa combo" : "Tạo combo mới"}
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
                  Tên combo *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="VD: Combo Tết Đinh Mùi 2027"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả ngắn về combo..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  URL banner
                </label>
                <input
                  value={form.banner_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, banner_url: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, starts_at: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Kết thúc
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

              {/* Product Picker */}
              <div className="border border-gray-200 rounded-xl p-4">
                <label className="block text-sm text-gray-700 mb-2 font-medium">
                  Sản phẩm trong combo
                </label>

                {form.products.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {form.products.map((p) => {
                      const prod = allProducts.find((ap) => ap.sku === p.sku);
                      return (
                        <div
                          key={p.sku}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Package
                              size={14}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-gray-700 truncate">
                              {prod?.name || p.sku}
                            </span>
                            <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                              ({p.sku})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-xs font-medium"
                              style={{ color: "#cc323f" }}
                            >
                              -{(p.discount_bps / 100).toFixed(0)}%
                            </span>
                            <button
                              onClick={() => removeProduct(p.sku)}
                              className="p-0.5 rounded text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Tìm SKU hoặc tên sản phẩm..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-200"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                        {filteredProducts.slice(0, 8).map((p) => (
                          <button
                            key={p.sku}
                            type="button"
                            onClick={() => addProduct(p.sku)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span className="text-gray-700 truncate">
                              {p.name}
                            </span>
                            <span className="text-gray-400 font-mono flex-shrink-0 ml-2">
                              {p.sku}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      value={discountBps}
                      onChange={(e) =>
                        setDiscountBps(Math.max(0, +e.target.value))
                      }
                      className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-red-200"
                      placeholder="bps"
                    />
                    <span className="text-xs text-gray-400">
                      {(discountBps / 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Giảm giá tính theo bps (1000 = 10%). Nhập SKU và chọn sản
                  phẩm.
                </p>
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
                {editingId ? "Lưu thay đổi" : "Tạo combo"}
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
              Dữ liệu combo sẽ bị xóa vĩnh viễn.
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
