import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, PackageCheck } from "lucide-react";
import { productApi } from "@/features/products/api";

interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  price: number;
  status: string;
}

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productApi
      .list({ limit: 100 })
      .then((r) => {
        setItems(
          r.data.map((p: any) => ({
            productId: p.id,
            productName: p.name,
            sku: p.slug,
            category: p.category_name || "",
            price: p.base_price_vnd,
            status: p.status,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      {/* Header */}
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

      {/* Summary Cards */}
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
            <Package size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Đang hoạt động</span>
          </div>
          <p className="text-2xl font-semibold text-green-600">
            {items.filter((i) => i.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500">Đã ẩn</span>
          </div>
          <p className="text-2xl font-semibold text-amber-600">
            {items.filter((i) => i.status !== "active").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
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
                  Slug
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Danh mục
                </th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Giá
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr
                  key={item.productId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 text-sm">
                        {item.productName}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden sm:table-cell">
                    {item.sku}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
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
                    {item.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        Đang bán
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Đã ẩn
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không có mặt hàng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
