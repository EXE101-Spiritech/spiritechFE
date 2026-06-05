import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { adminOrders } from "../../data/adminData";
import type { AdminOrder } from "../../data/adminData";
import { formatCurrency } from "../../data/index";
import { adminApi } from "@/features/admin/api";

const PAYMENT_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  paid: { label: "Đã thanh toán", color: "#16a34a", bg: "#f0fdf4" },
  pending: { label: "Chờ thanh toán", color: "#d97706", bg: "#fffbeb" },
  failed: { label: "Thất bại", color: "#dc2626", bg: "#fef2f2" },
};

const ORDER_STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Chờ xử lý", color: "#d97706", bg: "#fffbeb" },
  paid: { label: "Đã thanh toán", color: "#2563eb", bg: "#eff6ff" },
  completed: { label: "Hoàn thành", color: "#16a34a", bg: "#f0fdf4" },
};

const Badge = ({
  status,
  map,
}: {
  status: string;
  map: typeof PAYMENT_LABELS;
}) => {
  const s = map[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>(adminOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (
    id: string,
    status: "pending" | "paid" | "completed",
  ) => {
    // Call admin API to advance status
    try { adminApi.advanceOrderStatus(id).catch(() => {}); } catch {}
    setOrders((os) =>
      os.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)),
    );
    if (selectedOrder?.id === id)
      setSelectedOrder((o) => (o ? { ...o, orderStatus: status } : null));
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Đơn hàng
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} đơn • Doanh thu:{" "}
            <span className="font-medium" style={{ color: "#cc323f" }}>
              {formatCurrency(totalRevenue)}
            </span>
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["pending", "paid", "completed"] as const).map((s) => {
          const count = orders.filter((o) => o.orderStatus === s).length;
          const conf = ORDER_STATUS_LABELS[s];
          return (
            <button
              key={s}
              onClick={() =>
                setFilterStatus(s === (filterStatus as any) ? "all" : s)
              }
              className={`bg-white rounded-2xl p-4 shadow-sm border text-left transition-all ${filterStatus === s ? "border-red-300 ring-1 ring-red-200" : "border-gray-100"}`}
            >
              <p
                className="text-2xl font-semibold"
                style={{ color: conf.color }}
              >
                {count}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{conf.label}</p>
            </button>
          );
        })}
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
            placeholder="Tìm mã đơn hoặc khách hàng..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="completed">Hoàn thành</option>
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
                  Mã đơn
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">
                  Khách hàng
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Ngày đặt
                </th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium">
                  Tổng tiền
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Thanh toán
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td
                    className="px-5 py-3.5 font-mono text-sm font-medium"
                    style={{ color: "#902131" }}
                  >
                    #{order.id}
                  </td>
                  <td className="px-5 py-3.5 text-gray-800">
                    {order.customer}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                    {order.date}
                  </td>
                  <td
                    className="px-5 py-3.5 text-right font-semibold"
                    style={{ color: "#cc323f" }}
                  >
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-3.5 text-center hidden md:table-cell">
                    <Badge status={order.paymentStatus} map={PAYMENT_LABELS} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="relative inline-block">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as any)
                        }
                        className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-1 cursor-pointer"
                        style={{
                          color: ORDER_STATUS_LABELS[order.orderStatus]?.color,
                          background:
                            ORDER_STATUS_LABELS[order.orderStatus]?.bg,
                        }}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                      <ChevronDown
                        size={10}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy đơn hàng nào.
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3
                  className="font-semibold text-gray-900"
                  style={{ fontFamily: "Lora, serif" }}
                >
                  Chi tiết đơn hàng
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  #{selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-5">
              {/* Customer & Shipping */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Thông tin giao hàng
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedOrder.shipping.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shipping.phone}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shipping.address}
                </p>
                <p className="text-xs text-gray-400">
                  Vận chuyển:{" "}
                  {selectedOrder.shipping.method === "express"
                    ? "🚀 Hỏa tốc"
                    : "📦 Tiêu chuẩn"}
                </p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Sản phẩm đặt hàng
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          x{item.qty} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#cc323f" }}
                      >
                        {formatCurrency(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span
                      className="text-base font-bold"
                      style={{ color: "#cc323f" }}
                    >
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Thanh toán</p>
                  <Badge
                    status={selectedOrder.paymentStatus}
                    map={PAYMENT_LABELS}
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Trạng thái đơn</p>
                  <Badge
                    status={selectedOrder.orderStatus}
                    map={ORDER_STATUS_LABELS}
                  />
                </div>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Cập nhật trạng thái
                </p>
                <div className="flex gap-2">
                  {(["pending", "paid", "completed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${selectedOrder.orderStatus === s ? "border-red-300" : "border-gray-200 hover:bg-gray-50"}`}
                      style={
                        selectedOrder.orderStatus === s
                          ? {
                              background: "#cc323f",
                              color: "#fff",
                              borderColor: "#cc323f",
                            }
                          : { color: "#6b7280" }
                      }
                    >
                      {ORDER_STATUS_LABELS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
