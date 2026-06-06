import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router";
import { ArrowLeft, Truck, Banknote, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getStatusLabel, getStatusColor, Order } from "../data";
import { orderApi } from "@/features/orders/api";

function loadUserOrders(): Order[] {
  try {
    const raw = localStorage.getItem("userOrders");
    if (!raw) return [];
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn)
    return <Navigate to="/login?redirect=/account/orders" replace />;

  const userOrders = loadUserOrders();
  const order = [...userOrders].find((o) => o.id === id);

  if (!order) {
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center"
      >
        <Package className="w-16 h-16 text-gray-200 mb-4" />
        <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link
          to="/account/orders"
          className="hover:underline"
          style={{ color: "#cc323f" }}
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const steps = ["pending", "processing", "shipping", "delivered"];
  const stepLabels = ["Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã giao"];
  const currentStep = steps.indexOf(
    order.status === "cancelled" ? "pending" : order.status,
  );

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/account" className="hover:text-white">
              Tài khoản
            </Link>
            <span className="mx-2">/</span>
            <Link to="/account/orders" className="hover:text-white">
              Đơn hàng
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">#{order.id}</span>
          </nav>
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "white",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
          >
            Chi Tiết Đơn Hàng
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#cc323f] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-gray-500 text-sm">Mã đơn hàng</p>
            <p
              className="text-2xl"
              style={{ color: "#cc323f", fontWeight: 700 }}
            >
              #{order.id}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Ngày đặt hàng</p>
            <p className="text-gray-800" style={{ fontWeight: 600 }}>
              {order.date}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm ${getStatusColor(order.status)}`}
            style={{ fontWeight: 600 }}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Progress */}
        {order.status !== "cancelled" &&
          (() => {
            const progressLabels = [
              "Đặt hàng",
              "Xác nhận",
              "Đang xử lý",
              "Đang giao",
              "Đã giao",
            ];
            const progressSubs = [
              "Vừa đặt",
              "Trong 30 phút",
              "Chuẩn bị hàng",
              "Shipper nhận",
              "Hoàn thành",
            ];
            // Map order.status → active step index (0–4)
            const statusToStep: Record<string, number> = {
              pending: 0,
              processing: 2,
              shipping: 3,
              delivered: 4,
            };
            const cur = statusToStep[order.status] ?? 0;
            return (
              <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
                <p
                  className="text-gray-700 text-sm mb-5"
                  style={{ fontWeight: 600 }}
                >
                  Tiến trình đơn hàng
                </p>
                <div className="flex items-start">
                  {progressLabels.map((label, i) => (
                    <div
                      key={label}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="flex items-center w-full">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all"
                          style={{
                            backgroundColor:
                              i < cur ||
                              (i === cur && i === progressLabels.length - 1)
                                ? "#22c55e"
                                : i === cur
                                  ? "#cc323f"
                                  : "#e2e8f0",
                            color: i <= cur ? "white" : "#94a3b8",
                            boxShadow:
                              i === cur && i !== progressLabels.length - 1
                                ? "0 0 0 4px rgba(204,50,63,0.15)"
                                : i === cur
                                  ? "0 0 0 4px rgba(34,197,94,0.15)"
                                  : "none",
                            fontWeight: 700,
                          }}
                        >
                          {i < cur ||
                          (i === cur && i === progressLabels.length - 1)
                            ? "✓"
                            : i + 1}
                        </div>
                        {i < progressLabels.length - 1 && (
                          <div
                            className="flex-1 h-1 mx-1 transition-all"
                            style={{
                              backgroundColor: i < cur ? "#22c55e" : "#e2e8f0",
                            }}
                          />
                        )}
                      </div>
                      <p
                        className="text-xs mt-2 text-center leading-tight"
                        style={{
                          color:
                            i < cur ||
                            (i === cur && i === progressLabels.length - 1)
                              ? "#16a34a"
                              : i === cur
                                ? "#cc323f"
                                : "#94a3b8",
                          fontWeight: i === cur ? 700 : i < cur ? 600 : 400,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-center mt-0.5"
                        style={{ color: "#cbd5e1", fontSize: "0.62rem" }}
                      >
                        {progressSubs[i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p
              className="flex items-center gap-2 text-gray-700 text-sm mb-3"
              style={{ fontWeight: 600 }}
            >
              <Truck className="w-4 h-4" style={{ color: "#cc323f" }} /> Thông
              tin giao hàng
            </p>
            <p className="text-gray-800" style={{ fontWeight: 600 }}>
              {order.shippingInfo.name}
            </p>
            <p className="text-gray-600 text-sm">{order.shippingInfo.phone}</p>
            <p className="text-gray-600 text-sm mt-1">
              {order.shippingInfo.address}
            </p>
            {order.shippingInfo.notes && (
              <p className="text-gray-500 text-xs mt-1 italic">
                "{order.shippingInfo.notes}"
              </p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-500 text-xs">Dự kiến giao hàng</p>
              <p className="text-green-600 text-sm" style={{ fontWeight: 600 }}>
                {order.estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p
              className="flex items-center gap-2 text-gray-700 text-sm mb-3"
              style={{ fontWeight: 600 }}
            >
              <Banknote className="w-4 h-4" style={{ color: "#cc323f" }} />{" "}
              Thanh toán
            </p>
            <p className="text-gray-800" style={{ fontWeight: 600 }}>
              {order.paymentMethod === "cod"
                ? "Thanh toán khi nhận hàng (COD)"
                : "Chuyển khoản ngân hàng"}
            </p>
            {order.paymentMethod === "bank" && (
              <p className="text-gray-500 text-sm mt-1">VCB: 1234567890</p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-500 text-xs">Tổng cộng</p>
              <p
                className="text-xl"
                style={{ color: "#cc323f", fontWeight: 700 }}
              >
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-gray-700 text-sm mb-4" style={{ fontWeight: 600 }}>
            Sản phẩm đã đặt
          </p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-800"
                    style={{ fontFamily: "Lora, serif" }}
                  >
                    {item.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    x{item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span
                  className="text-sm flex-shrink-0"
                  style={{ color: "#cc323f", fontWeight: 700 }}
                >
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
