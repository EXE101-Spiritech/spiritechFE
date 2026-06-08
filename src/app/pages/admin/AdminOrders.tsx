import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Truck,
  X,
  CheckCircle,
  Package,
  MapPin,
} from "lucide-react";
import { adminApi } from "@/features/admin/api";
import { formatCurrency } from "../../data/index";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending_payment", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "fulfilling", label: "Đang chuẩn bị" },
  { value: "shipped", label: "Đã giao vận chuyển" },
  { value: "delivered", label: "Đã nhận hàng" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refunded", label: "Đã hoàn tiền" },
  { value: "failed", label: "Thanh toán thất bại" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "#d97706",
  paid: "#2563eb",
  confirmed: "#16a34a",
  fulfilling: "#7c3aed",
  shipped: "#cc323f",
  delivered: "#16a34a",
  cancelled: "#6b7280",
  refunded: "#6b7280",
  failed: "#dc2626",
};
const STATUS_BG: Record<string, string> = {
  pending_payment: "#fffbeb",
  paid: "#eff6ff",
  confirmed: "#f0fdf4",
  fulfilling: "#f5f3ff",
  shipped: "#fef2f2",
  delivered: "#f0fdf4",
  cancelled: "#f9fafb",
  refunded: "#f9fafb",
  failed: "#fef2f2",
};

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.filter((s) => s.value).map((s) => [s.value, s.label]),
);

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shippingTracking, setShippingTracking] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());

  const togglePhone = (id: string) => {
    setRevealedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskPhone = (phone: string | undefined): string => {
    if (!phone || phone.length < 4) return phone || "";
    return phone.slice(0, 3) + "*".repeat(phone.length - 3);
  };

  const load = (p = page) => {
    setLoading(true);
    adminApi
      .listOrders({ status: filterStatus || undefined, page: p, size: 20 })
      .then((r: any) => {
        setOrders(Array.isArray(r) ? r : r.data || []);
        setTotal(r.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    setPage(1);
  }, [filterStatus]);

  const filtered = orders.filter(
    (o: any) =>
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase()),
  );

  const openOrder = (o: any) => {
    setSelectedOrder(o);
    setNewStatus(o.status);
    setShippingCarrier(o.carrier || "");
    setShippingTracking(o.tracking || "");
    setUpdateMsg("");
  };

  const updateStatus = async () => {
    if (!newStatus || newStatus === selectedOrder.status) return;
    setUpdating(true);
    setUpdateMsg("");
    try {
      const res = await adminApi.updateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder((prev: any) => ({ ...prev, status: res.status }));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: res.status } : o,
        ),
      );
      setUpdateMsg("Cập nhật trạng thái thành công!");
    } catch (err: any) {
      setUpdateMsg(err?.response?.data?.message || "Cập nhật thất bại");
    }
    setUpdating(false);
  };

  const updateShipping = async () => {
    if (!shippingCarrier || !shippingTracking) return;
    setUpdating(true);
    setUpdateMsg("");
    try {
      const res = await adminApi.setShipping(selectedOrder.id, {
        carrier: shippingCarrier,
        tracking: shippingTracking,
      });
      setSelectedOrder((prev: any) => ({
        ...prev,
        carrier: res.carrier,
        tracking: res.tracking,
      }));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, carrier: res.carrier, tracking: res.tracking }
            : o,
        ),
      );
      setUpdateMsg("Cập nhật vận chuyển thành công!");
    } catch (err: any) {
      setUpdateMsg(err?.response?.data?.message || "Cập nhật thất bại");
    }
    setUpdating(false);
  };

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
          <p className="text-sm text-gray-500 mt-0.5">{total} đơn hàng</p>
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
            placeholder="Tìm mã đơn hàng..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => load()}
          className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Làm mới
        </button>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
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
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Vận chuyển
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o: any) => (
                <tr
                  key={o.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p
                      className="font-mono text-sm font-medium"
                      style={{ color: "#902131" }}
                    >
                      #{o.order_number}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {o.id.slice(0, 8)}...
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-800">
                      {o.shipping_address?.name || "—"}
                    </p>
                    <button
                      onClick={() => togglePhone(o.id)}
                      className="text-xs text-gray-400 hover:text-[#cc323f] transition-colors text-left"
                      title={revealedPhones.has(o.id) ? "Ẩn số" : "Hiện số"}
                    >
                      {revealedPhones.has(o.id)
                        ? o.shipping_address?.phone || ""
                        : maskPhone(o.shipping_address?.phone)}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden sm:table-cell">
                    {o.placed_at
                      ? new Date(o.placed_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td
                    className="px-5 py-3.5 text-right font-semibold"
                    style={{ color: "#cc323f" }}
                  >
                    {formatCurrency(o.total_vnd)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        color: STATUS_COLORS[o.status] || "#6b7280",
                        background: STATUS_BG[o.status] || "#f9fafb",
                      }}
                    >
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                    <span
                      className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{
                        color:
                          o.payment_method === "payos" ? "#7c3aed" : "#16a34a",
                        background:
                          o.payment_method === "payos" ? "#ede9fe" : "#f0fdf4",
                      }}
                    >
                      {o.payment_method === "payos"
                        ? "PayOS"
                        : o.payment_method === "cod"
                          ? "COD"
                          : o.payment_method || ""}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-gray-500">
                    {o.carrier ? `${o.carrier} · ${o.tracking || ""}` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => openOrder(o)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Quản lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy đơn hàng.
            </div>
          )}
          {loading && (
            <div className="text-center py-12">
              <span className="inline-block w-5 h-5 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
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
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(
              (p) => (
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
              ),
            )}
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => load(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-30"
              style={{
                borderColor: "#e2e8f0",
                color: page >= Math.ceil(total / 20) ? "#94a3b8" : "#334155",
              }}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3
                  className="font-semibold text-gray-900"
                  style={{ fontFamily: "Lora, serif" }}
                >
                  Đơn hàng #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setUpdateMsg("");
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {updateMsg && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${updateMsg.includes("thành công") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}
                >
                  {updateMsg}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOrder.subtotal_vnd)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(selectedOrder.discount_vnd)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VAT</span>
                  <span>{formatCurrency(selectedOrder.vat_vnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí ship</span>
                  <span>{formatCurrency(selectedOrder.shipping_vnd)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="font-bold" style={{ color: "#cc323f" }}>
                    {formatCurrency(selectedOrder.total_vnd)}
                  </span>
                </div>
              </div>

              {selectedOrder.placed_at && (
                <p className="text-xs text-gray-400">
                  Đặt lúc:{" "}
                  {new Date(selectedOrder.placed_at).toLocaleString("vi-VN")}
                </p>
              )}

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    Địa chỉ giao hàng
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                    <p className="font-medium text-gray-900">
                      {selectedOrder.shipping_address.name}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.shipping_address.phone}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.shipping_address.line1}
                      {selectedOrder.shipping_address.city
                        ? `, ${selectedOrder.shipping_address.city}`
                        : ""}
                    </p>
                    {selectedOrder.shipping_address.email && (
                      <p className="text-gray-400 text-xs">
                        {selectedOrder.shipping_address.email}
                      </p>
                    )}
                    {selectedOrder.notes && (
                      <p className="text-gray-400 text-xs mt-1 italic">
                        Ghi chú: {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Cập nhật trạng thái
                </p>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
                  >
                    {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                      <option
                        key={s.value}
                        value={s.value}
                        disabled={s.value === selectedOrder.status}
                      >
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={updateStatus}
                    disabled={updating || newStatus === selectedOrder.status}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                    style={{ background: "#cc323f" }}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>

              {/* Update Shipping */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  <Truck size={14} className="inline mr-1" />
                  Thông tin vận chuyển
                </p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    placeholder="Hãng vận chuyển"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                  <input
                    value={shippingTracking}
                    onChange={(e) => setShippingTracking(e.target.value)}
                    placeholder="Mã vận đơn"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <button
                  onClick={updateShipping}
                  disabled={updating || !shippingCarrier || !shippingTracking}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ background: "#2563eb" }}
                >
                  Cập nhật vận chuyển
                </button>
              </div>

              {updating && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block w-4 h-4 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
