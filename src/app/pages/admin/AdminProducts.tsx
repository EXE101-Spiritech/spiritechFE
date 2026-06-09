import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "../../data/index";
import { adminApi, Category } from "@/features/admin/api";

interface AdminProduct {
  id: string;
  productId?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "hidden";
  image: string;
  images?: string[];
  description: string;
}

const toAdminProducts = (): AdminProduct[] => [];

const VIETNAMESE_MAP: Record<string, string> = {
  à: "a",
  á: "a",
  ạ: "a",
  ả: "a",
  ã: "a",
  â: "a",
  ấ: "a",
  ầ: "a",
  ẩ: "a",
  ẫ: "a",
  ậ: "a",
  ă: "a",
  ắ: "a",
  ằ: "a",
  ẳ: "a",
  ẵ: "a",
  ặ: "a",
  è: "e",
  é: "e",
  ẹ: "e",
  ẻ: "e",
  ẽ: "e",
  ê: "e",
  ế: "e",
  ề: "e",
  ể: "e",
  ễ: "e",
  ệ: "e",
  ì: "i",
  í: "i",
  ị: "i",
  ỉ: "i",
  ĩ: "i",
  ò: "o",
  ó: "o",
  ọ: "o",
  ỏ: "o",
  õ: "o",
  ô: "o",
  ố: "o",
  ồ: "o",
  ổ: "o",
  ỗ: "o",
  ộ: "o",
  ơ: "o",
  ớ: "o",
  ờ: "o",
  ở: "o",
  ỡ: "o",
  ợ: "o",
  ù: "u",
  ú: "u",
  ụ: "u",
  ủ: "u",
  ũ: "u",
  ư: "u",
  ứ: "u",
  ừ: "u",
  ử: "u",
  ữ: "u",
  ự: "u",
  ỳ: "y",
  ý: "y",
  ỵ: "y",
  ỷ: "y",
  ỹ: "y",
  đ: "d",
};

function makeSlug(text: string): string {
  let s = text.toLowerCase();
  for (const [char, ascii] of Object.entries(VIETNAMESE_MAP)) {
    s = s.replaceAll(char, ascii);
  }
  return s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const EMPTY_FORM = {
  name: "",
  price: 0,
  status: "active" as const,
  images: [] as string[],
  description: "",
};

const ADMIN_PROD_PAGE_SIZE = 20;

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = (p: number) => {
    setLoading(true);
    adminApi
      .listProducts({ page: p, size: ADMIN_PROD_PAGE_SIZE })
      .then((r) => {
        const apiProducts = r.data.map((prod: any) => ({
          id: prod.slug,
          productId: prod.id,
          name: prod.name,
          category: prod.category_name || prod.category || "",
          price: prod.base_price_vnd,
          stock: prod.quantity ?? 0,
          status:
            prod.status === "active"
              ? ("active" as const)
              : ("hidden" as const),
          image: prod.images?.[0] || "",
          description: prod.description || "",
        }));
        setProducts(apiProducts);
        setTotal(r.total);
        setPage(p);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    adminApi
      .listCategories()
      .then((cats: any) =>
        setCategories(
          Array.isArray(cats)
            ? cats
            : Array.isArray(cats?.data)
              ? cats.data
              : [],
        ),
      )
      .catch(() => {});
  }, []);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tất cả");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restockModal, setRestockModal] = useState<{
    productId: string;
    name: string;
    currentQty: number;
  } | null>(null);
  const [restockQty, setRestockQty] = useState(10);

  const allCats = ["Tất cả", ...categories.map((c) => c.Name)];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Tất cả" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.productId || p.id || "");
    setForm({
      name: p.name,
      price: p.price,
      status: p.status,
      images: p.images || (p.image ? [p.image] : []),
      description: p.description,
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
      status: form.status,
    };

    try {
      if (editingId) {
        const current = products.find(
          (p) => p.id === editingId || p.productId === editingId,
        );
        await adminApi.updateProduct(editingId, {
          ...data,
          quantity: current?.stock ?? 0,
        });
        setProducts((ps) =>
          ps.map((p) =>
            p.id === editingId || p.productId === editingId
              ? { ...p, ...data, price: data.base_price_vnd }
              : p,
          ),
        );
      } else {
        const res = await adminApi.createProduct(data);
        const newId = res.slug || res.product_id || slug;
        setProducts((ps) => [
          ...ps,
          {
            id: newId,
            productId: res.product_id,
            name: form.name,
            price: form.price,
            status: form.status,
            images: form.images || [],
            image: form.images?.[0] || "",
            description: form.description,
            category: "",
            stock: 0,
          },
        ]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(
        err?.response?.data?.message || "Loi luu san pham. Vui long thu lai.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    const item = products.find((p) => p.id === id);
    try {
      await adminApi.deleteProduct(item?.productId || id || "");
      setProducts((ps) => ps.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xóa sản phẩm thất bại");
    }
  };

  const adjustStock = (productId: string | undefined, delta: number) => {
    if (!productId) return;
    const item = products.find((p) => p.productId === productId);
    if (!item) return;
    const newQty = Math.max(0, item.stock + delta);
    adminApi.updateStock(productId, newQty).catch(() => {});
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, stock: newQty } : p,
      ),
    );
  };

  const toggleStatus = (id: string) => {
    const item = products.find((p) => p.id === id);
    if (!item) return;
    const newStatus = item.status === "active" ? "hidden" : "active";
    adminApi
      .updateProduct(item.productId || id || "", { status: newStatus })
      .catch(() => {});
    setProducts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
  };

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Sản phẩm
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} sản phẩm trong hệ thống
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
        >
          {allCats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "#faf9f8" }}
                className="border-b border-gray-100"
              >
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">
                  Sản phẩm
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Danh mục
                </th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium">
                  Giá
                </th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Tồn kho
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      />
                      <p className="font-medium text-gray-800 line-clamp-2 text-sm">
                        {p.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs"
                      style={{ background: "#fdf8f0", color: "#902131" }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5 text-right font-medium"
                    style={{ color: "#cc323f" }}
                  >
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-600 hidden md:table-cell">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => adjustStock(p.productId, -1)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                      >
                        −
                      </button>
                      <span
                        className={`inline-block w-8 text-center text-sm font-medium ${
                          p.stock === 0
                            ? "text-red-600"
                            : p.stock < 10
                              ? "text-amber-600"
                              : "text-gray-900"
                        }`}
                      >
                        {p.stock}
                      </span>
                      <button
                        onClick={() => adjustStock(p.productId, 1)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          setRestockModal({
                            productId: p.productId || "",
                            name: p.name,
                            currentQty: p.stock,
                          });
                          setRestockQty(10);
                        }}
                        className="ml-1 px-1.5 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: "#16a34a" }}
                      >
                        Nhập
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      style={
                        p.status === "active"
                          ? { background: "#f0fdf4", color: "#16a34a" }
                          : { background: "#f3f4f6", color: "#6b7280" }
                      }
                    >
                      {p.status === "active" ? (
                        <>
                          <Eye size={11} /> Hiển thị
                        </>
                      ) : (
                        <>
                          <EyeOff size={11} /> Ẩn
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
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
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy sản phẩm nào.
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > ADMIN_PROD_PAGE_SIZE && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-30"
              style={{
                borderColor: "#e2e8f0",
                color: page <= 1 ? "#94a3b8" : "#334155",
              }}
            >
              Trước
            </button>
            {Array.from(
              { length: Math.ceil(total / ADMIN_PROD_PAGE_SIZE) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => load(p)}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: p === page ? "#cc323f" : "transparent",
                  color: p === page ? "white" : "#334155",
                }}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= Math.ceil(total / ADMIN_PROD_PAGE_SIZE)}
              onClick={() => load(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-30"
              style={{
                borderColor: "#e2e8f0",
                color:
                  page >= Math.ceil(total / ADMIN_PROD_PAGE_SIZE)
                    ? "#94a3b8"
                    : "#334155",
              }}
            >
              Sau
            </button>
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
                {editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        status: e.target.value as "active" | "hidden",
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                  >
                    <option value="active">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Giá bán (₫) *
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
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(form.images || []).map((url: string, i: number) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setForm((f: any) => ({
                            ...f,
                            images: f.images.filter(
                              (_: any, j: number) => j !== i,
                            ),
                          }))
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs flex-shrink-0 cursor-pointer hover:bg-gray-50 relative">
                    <span>+</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await adminApi.uploadImage(file);
                          setForm((f: any) => ({
                            ...f,
                            images: [...(f.images || []), result.url],
                          }));
                        } catch {
                          alert("Tải ảnh thất bại.");
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex gap-2">
                      <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Hoặc nhập URL..."
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                      <button
                        onClick={() => {
                          if (imageUrl) {
                            setForm((f: any) => ({
                              ...f,
                              images: [...(f.images || []), imageUrl],
                            }));
                            setImageUrl("");
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-white text-sm font-medium"
                        style={{ background: "#cc323f" }}
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả chi tiết sản phẩm..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
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
                {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3
                className="font-semibold text-gray-900 mb-1"
                style={{ fontFamily: "Lora, serif" }}
              >
                Xóa sản phẩm?
              </h3>
              <p className="text-sm text-gray-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
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

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3
              className="font-semibold text-gray-900 mb-1"
              style={{ fontFamily: "Lora, serif" }}
            >
              Nhập kho
            </h3>
            <p className="text-sm text-gray-600 mb-4">{restockModal.name}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Tồn hiện tại:</span>
              <span className="font-semibold">{restockModal.currentQty}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setRestockQty((q) => Math.max(1, q - 10))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                −10
              </button>
              <input
                type="number"
                value={restockQty}
                min={1}
                onChange={(e) => setRestockQty(Math.max(1, +e.target.value))}
                className="flex-1 text-center border border-gray-200 rounded-xl py-2.5 text-lg font-semibold focus:outline-none"
              />
              <button
                onClick={() => setRestockQty((q) => q + 10)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                +10
              </button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Sau khi nhập:</span>
              <span className="font-semibold text-gray-900">
                {restockModal.currentQty + restockQty}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRestockModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    await adminApi.updateStock(
                      restockModal.productId,
                      restockModal.currentQty + restockQty,
                    );
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.productId === restockModal.productId
                          ? {
                              ...p,
                              stock: restockModal.currentQty + restockQty,
                            }
                          : p,
                      ),
                    );
                  } catch {}
                  setRestockModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "#16a34a" }}
              >
                Xác nhận nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
