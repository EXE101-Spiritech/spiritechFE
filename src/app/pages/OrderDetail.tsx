import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router";
import { ArrowLeft, Truck, Banknote, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data";
import { orderApi } from "@/features/orders/api";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  confirmed: "Đã xác nhận",
  fulfilling: "Đang chuẩn bị",
  shipped: "Đã giao vận chuyển",
  delivered: "Đã nhận hàng",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
  failed: "Thất bại",
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      orderApi
        .get(id)
        .then(setOrder)
        .catch(() => setOrder(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (!isLoggedIn)
    return <Navigate to="/login?redirect=/account/orders" replace />;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!order)
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center"
      >
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy đơn hàng</p>
        <Link
          to="/account/orders"
          className="underline"
          style={{ color: "#cc323f" }}
        >
          ← Quay lại đơn hàng
        </Link>
      </div>
    );

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link to="/account" className="hover:text-white">
              Tài khoản
            </Link>
            <span className="mx-2">/</span>
            <Link to="/account/orders" className="hover:text-white">
              Đơn hàng
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">#{order.order_number}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
          style={{ color: "#cc323f" }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                Đơn hàng #{order.order_number}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.placed_at
                  ? new Date(order.placed_at).toLocaleString("vi-VN")
                  : ""}
              </p>
            </div>
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                color:
                  order.status === "pending_payment"
                    ? "#d97706"
                    : order.status === "delivered"
                      ? "#16a34a"
                      : "#6b7280",
                background:
                  order.status === "pending_payment"
                    ? "#fffbeb"
                    : order.status === "delivered"
                      ? "#f0fdf4"
                      : "#f9fafb",
              }}
            >
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium">
                  {formatCurrency(order.subtotal_vnd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giảm giá</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(order.discount_vnd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VAT</span>
                <span>{formatCurrency(order.vat_vnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí ship</span>
                <span>{formatCurrency(order.shipping_vnd)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="font-bold" style={{ color: "#cc323f" }}>
                  {formatCurrency(order.total_vnd)}
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {order.placed_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Đặt hàng</p>
                  <p className="font-medium">
                    {new Date(order.placed_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
              {order.paid_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Thanh toán</p>
                  <p className="font-medium">
                    {new Date(order.paid_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
              {order.shipped_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Giao hàng</p>
                  <p className="font-medium">
                    {new Date(order.shipped_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
              {order.delivered_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Nhận hàng</p>
                  <p className="font-medium">
                    {new Date(order.delivered_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping info */}
            {order.carrier && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} style={{ color: "#2563eb" }} />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Vận chuyển
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {order.carrier}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {order.tracking || "—"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
