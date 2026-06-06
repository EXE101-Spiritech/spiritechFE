import { useState, useEffect } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  PackageCheck,
  Minus,
  Plus,
} from "lucide-react";
import { adminApi } from "@/features/admin/api";

interface InventoryItem {
  productId: string;
  productName: string;
  slug: string;
  category: string;
  price: number;
  quantity: number;
  status: string;
}

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restockModal, setRestockModal] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  useEffect(() => {
    adminApi
      .listProducts({ size: 100 })
      .then((r) => {
        setItems(
          r.data.map((p: any) => ({
            productId: p.id,
            productName: p.name,
            slug: p.slug,
            category: p.category_name || "",
            price: p.base_price_vnd,
            quantity: p.quantity ?? 0,
            status: p.status,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStock = async (id: string, qty: number) => {
    try {
      await adminApi.updateStock(id, qty);
      setItems((prev) =>
        prev.map((i) => (i.productId === id ? { ...i, quantity: qty } : i)),
      );
    } catch {
      /* ignore */
    }
    setRestockModal(null);
  };

  const adjustStock = (id: string, delta: number) => {
    const item = items.find((i) => i.productId === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    adminApi.updateStock(id, newQty).catch(() => {});
    setItems((prev) =>
      prev.map((i) => (i.productId === id ? { ...i, quantity: newQty } : i)),
    );
  };

  const filtered = items.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.slug.toLowerCase().includes(search.toLowerCase()),
  );
  const lowCount = items.filter((i) => i.quantity < 10).length;

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
            Kho hàng
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} mặt hàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <PackageCheck size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Tổng mặt hàng</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500">Sắp hết hàng</span>
          </div>
          <p
            className="text-2xl font-semibold"
            style={{ color: lowCount > 0 ? "#d97706" : "#16a34a" }}
          >
            {lowCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Đang hoạt động</span>
          </div>
          <p className="text-2xl font-semibold text-green-600">
            {items.filter((i) => i.status === "active").length}
          </p>
        </div>
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
            placeholder="Tìm theo tên..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
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
                  Sản phẩm
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Danh mục
                </th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Giá
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Tồn kho
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Điều chỉnh
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const isLow = item.quantity < 10;
                return (
                  <tr
                    key={item.productId}
                    className={`transition-colors ${isLow ? "bg-amber-50/40" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {isLow && (
                          <AlertTriangle
                            size={14}
                            className="text-amber-500 flex-shrink-0"
                          />
                        )}
                        <p className="font-medium text-gray-800 text-sm">
                          {item.productName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "#fdf8f0", color: "#902131" }}
                      >
                        {item.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden md:table-cell">
                      <span className="font-medium text-gray-900">
                        {item.price.toLocaleString()}₫
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`text-base font-semibold ${item.quantity === 0 ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"}`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => adjustStock(item.productId, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          onClick={() => {
                            setRestockModal(item);
                            setRestockQty(50);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                          style={{ background: "#cc323f" }}
                        >
                          Nhập
                        </button>
                        <button
                          onClick={() => adjustStock(item.productId, 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không có mặt hàng nào.
            </div>
          )}
        </div>
      </div>

      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3
              className="font-semibold text-gray-900 mb-1"
              style={{ fontFamily: "Lora, serif" }}
            >
              Nhập hàng
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {restockModal.productName}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Tồn hiện tại:</span>
              <span className="font-semibold">{restockModal.quantity}</span>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setRestockQty((q) => Math.max(1, q - 10))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <Minus size={14} />
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
                <Plus size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Sau nhập:{" "}
              <span className="font-semibold text-gray-900">
                {restockModal.quantity + restockQty}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestockModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  updateStock(
                    restockModal.productId,
                    restockModal.quantity + restockQty,
                  )
                }
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "#cc323f" }}
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
