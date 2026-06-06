import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router";
import { ChevronRight, Package, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getStatusLabel, getStatusColor, Order } from "../data";
import { adminApi } from "@/features/admin/api";

export default function OrderHistory() {
  const { isLoggedIn } = useAuth();
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listOrders({ size: 50 })
      .then((r: any) => setApiOrders(Array.isArray(r) ? r : r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!isLoggedIn)
    return <Navigate to="/login?redirect=/account/orders" replace />;

  const sorted = [...apiOrders].sort(
    (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime(),
  );

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/account" className="hover:text-white">
              Tài khoản
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Đơn hàng của tôi</span>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/account"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-white/20 flex-shrink-0"
              style={{ color: "white", fontWeight: 600 }}
            >
              <ArrowLeft className="w-5 h-5" /> Quay lại
            </Link>
            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "white",
                fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
              }}
            >
              Đơn Hàng Của Tôi
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Chưa có đơn hàng nào</p>
            <Link
              to="/combo"
              className="text-sm hover:underline"
              style={{ color: "#cc323f" }}
            >
              Mua ngay →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((order: any, idx: number) => {
              const isNew = idx === 0 && order.status === "pending_payment";
              return (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.id}`}
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5"
                  style={
                    isNew
                      ? { border: "2px solid rgba(204,50,63,0.25)" }
                      : undefined
                  }
                >
                  {isNew && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "#fdf4f3",
                          color: "#cc323f",
                          fontWeight: 700,
                        }}
                      >
                        ✦ Đơn hàng mới
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">
                        Mã đơn hàng
                      </p>
                      <p style={{ color: "#cc323f", fontWeight: 700 }}>
                        #{order.order_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-0.5">Ngày đặt</p>
                      <p className="text-sm text-gray-700">
                        {order.placed_at
                          ? new Date(order.placed_at).toLocaleDateString(
                              "vi-VN",
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">
                        {order.total_vnd?.toLocaleString()}₫
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium`}
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
                      {order.status === "pending_payment"
                        ? "Chờ thanh toán"
                        : order.status === "paid"
                          ? "Đã thanh toán"
                          : order.status === "confirmed"
                            ? "Đã xác nhận"
                            : order.status === "shipped"
                              ? "Đã giao"
                              : order.status === "delivered"
                                ? "Đã nhận hàng"
                                : order.status === "cancelled"
                                  ? "Đã hủy"
                                  : order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
