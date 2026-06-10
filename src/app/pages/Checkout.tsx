import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  CheckCircle,
  Truck,
  Shield,
  Lock,
  Building2,
  Store,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data";
import { checkoutApi } from "@/features/checkout/api";
import { orderApi } from "@/features/orders/api";
import { couponApi } from "@/features/coupons/api";
import type { CouponInfo } from "@/shared/types";
import { API_BASE } from "@/shared/api/axiosClient";

// ── Event tracking ───────────────────────────────────────────────────────────
function track(eventType: string, payload: Record<string, any> = {}) {
  fetch(`${API_BASE}/v1/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, payload }),
  }).catch(() => {});
}

// ─── ShippingForm ─────────────────────────────────────────────────────────────
interface ShippingForm {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, totalPrice, clearCart, cartId, version } = useCart();
  const { profile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, []);

  // ── Form state ────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<ShippingForm>({
    name: profile?.name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    notes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingForm, string>>
  >({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<"cod" | "bank">("cod");
  const [pickup, setPickup] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState<{
    orderId: string;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  // ── Coupon ──────────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const discountVnd = couponInfo
    ? couponInfo.discount_type === "percent"
      ? Math.round((totalPrice * couponInfo.discount_value) / 100)
      : Math.min(couponInfo.discount_value, totalPrice)
    : 0;

  const handleLookupCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const info = await couponApi.lookup(couponCode.trim().toUpperCase());
      if (info.status !== "active") {
        setCouponError("Mã giảm giá đã hết hạn hoặc không khả dụng");
        setCouponInfo(null);
      } else if (info.min_order_vnd > totalPrice) {
        setCouponError(`Đơn tối thiểu ${formatCurrency(info.min_order_vnd)}`);
        setCouponInfo(null);
      } else {
        setCouponInfo(info);
      }
    } catch {
      setCouponError("Mã giảm giá không hợp lệ");
      setCouponInfo(null);
    }
    setCouponLoading(false);
  };

  const subtotal = totalPrice - discountVnd;

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof ShippingForm, string>> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const update = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  // ─── Submit Order ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setCheckoutError("");
    setLoading(true);

    try {
      track("checkout.step_payment", {
        cart_id: cartId,
        payment_method: payment,
      });

      const orderData = await checkoutApi.placeOrder(
        {
          cart_id: cartId || "",
          cart_version: version,
          payment_method: payment === "bank" ? "payos" : "cod",
          shipping_address: {
            line1: form.address,
            city: "",
          },
          buyer: {
            name: form.name,
            phone: form.phone,
            email: profile?.email || "",
            address: form.address,
          },
          coupon_code: couponInfo?.code || undefined,
          note: form.notes || undefined,
        },
        crypto.randomUUID(),
      );

      clearCart();
      setLoading(false);

      if (orderData.payment_redirect) {
        // Open PayOS in new tab
        window.open(orderData.payment_redirect, "_blank");

        // Poll order status every 3s
        const poll = setInterval(async () => {
          try {
            const ord = await orderApi.get(orderData.order_id);
            if (
              ord.status === "paid" ||
              ord.status === "confirmed" ||
              ord.invoice_status === "paid"
            ) {
              clearInterval(poll);
              navigate("/order-success", {
                state: {
                  orderId: orderData.order_id,
                  shippingInfo: {
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                  },
                  paymentMethod: payment,
                  total: orderData.total_vnd,
                  items,
                },
              });
            }
          } catch {
            /* retry */
          }
        }, 3000);
      } else {
        navigate("/order-success", {
          state: {
            orderId: orderData.order_id,
            shippingInfo: {
              name: form.name,
              phone: form.phone,
              address: form.address,
            },
            paymentMethod: payment,
            total: orderData.total_vnd,
            items,
          },
        });
      }
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
      setCheckoutError(msg);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const inputClass = (field: keyof ShippingForm) =>
    `w-full border rounded-xl px-4 py-3 outline-none transition-all bg-gray-50 ${
      errors[field] ? "border-red-300" : "border-gray-200"
    }`;

  const fieldFocus = (field: keyof ShippingForm) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = "#cc323f";
      e.target.style.boxShadow = "0 0 0 3px rgba(204,50,63,0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!errors[field]) {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
      }
    },
  });

  // ─── Render items for order summary ─────────────────────────────────────────
  const renderItem = (item: any, index: number) => (
    <div key={item.id || index} className="flex items-center gap-3 py-2">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ fontWeight: 600, color: "#1e293b" }}
        >
          {item.name}
        </p>
        <p className="text-xs text-gray-400">
          {item.type === "combo" ? "Combo" : "Sản phẩm"} × {item.quantity}
        </p>
      </div>
      <span
        className="text-sm whitespace-nowrap"
        style={{ color: "#cc323f", fontWeight: 700 }}
      >
        {formatCurrency(item.price * item.quantity)}
      </span>
    </div>
  );

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="py-8 sm:py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-white">
              Giỏ hàng
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Thanh toán</span>
          </nav>
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "white",
              fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
            }}
          >
            Thanh Toán
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Shipping info */}
            <div
              className="bg-white rounded-2xl shadow-sm p-6"
              style={{ border: "1px solid #f1e5e5" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: "#cc323f", fontWeight: 700 }}
                >
                  1
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "Lora, serif",
                      color: "#0f172a",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Hình thức nhận hàng
                  </h2>
                  <p className="text-xs text-gray-400">Chọn cách nhận hàng</p>
                </div>
              </div>

              {/* Pickup / Delivery toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setPickup(false)}
                  className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: !pickup ? "#cc323f" : "#e2e8f0",
                    backgroundColor: !pickup ? "#fdf4f3" : "white",
                  }}
                >
                  <Truck
                    className={`w-5 h-5 ${!pickup ? "text-[#cc323f]" : "text-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Giao hàng tận nơi
                    </p>
                    <p className="text-xs text-gray-400">Miễn phí giao hàng</p>
                  </div>
                </button>
                <button
                  onClick={() => setPickup(true)}
                  className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: pickup ? "#cc323f" : "#e2e8f0",
                    backgroundColor: pickup ? "#fdf4f3" : "white",
                  }}
                >
                  <Store
                    className={`w-5 h-5 ${pickup ? "text-[#cc323f]" : "text-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Nhận tại cửa hàng
                    </p>
                    <p className="text-xs text-gray-400">
                      Nhận hàng trực tiếp tại shop
                    </p>
                  </div>
                </button>
              </div>

              {/* Shipping form — hidden when pickup is selected */}
              {!pickup && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: "#cc323f", fontWeight: 700 }}
                    >
                      1
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "Lora, serif",
                          color: "#0f172a",
                          fontSize: "1.1rem",
                          fontWeight: 600,
                        }}
                      >
                        Thông tin nhận hàng
                      </h2>
                      <p className="text-xs text-gray-400">
                        Nhập thông tin người nhận
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm text-gray-700 mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={inputClass("name")}
                        {...fieldFocus("name")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm text-gray-700 mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="0912 345 678"
                        className={inputClass("phone")}
                        {...fieldFocus("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm text-gray-700 mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        Địa chỉ giao hàng *
                      </label>
                      <textarea
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        rows={3}
                        className={`${inputClass("address")} resize-none`}
                        {...fieldFocus("address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm text-gray-700 mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        Ghi chú (không bắt buộc)
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Ghi chú thêm cho người giao hàng..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all bg-gray-50 resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Pickup note */}
              {pickup && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <Store className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Quý khách vui lòng đến nhận hàng tại cửa hàng
                  </p>
                  <p className="text-xs text-amber-600">
                    Địa chỉ: số 687 Tô Ngọc Vân, Tam Bình, Thủ Đức
                  </p>{" "}
                </div>
              )}
            </div>

            {/* Step 2: Payment method */}
            <div
              className="bg-white rounded-2xl shadow-sm p-6"
              style={{ border: "1px solid #f1e5e5" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: "#cc323f", fontWeight: 700 }}
                >
                  2
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "Lora, serif",
                      color: "#0f172a",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Phương thức thanh toán
                  </h2>
                  <p className="text-xs text-gray-400">Chọn cách thanh toán</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPayment("cod")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: payment === "cod" ? "#cc323f" : "#e2e8f0",
                    backgroundColor: payment === "cod" ? "#fdf4f3" : "white",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        payment === "cod" ? "#cc323f" : "#f1f5f9",
                    }}
                  >
                    <Truck
                      className={`w-5 h-5 ${payment === "cod" ? "text-white" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm"
                      style={{ fontWeight: 600, color: "#0f172a" }}
                    >
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-gray-400">
                      Chỉ thanh toán khi nhận được hàng
                    </p>
                  </div>
                  {payment === "cod" && (
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: "#cc323f" }}
                    />
                  )}
                </button>

                <button
                  onClick={() => setPayment("bank")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: payment === "bank" ? "#cc323f" : "#e2e8f0",
                    backgroundColor: payment === "bank" ? "#fdf4f3" : "white",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        payment === "bank" ? "#cc323f" : "#f1f5f9",
                    }}
                  >
                    <Building2
                      className={`w-5 h-5 ${payment === "bank" ? "text-white" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm"
                      style={{ fontWeight: 600, color: "#0f172a" }}
                    >
                      Thanh toán qua PayOS
                    </p>
                    <p className="text-xs text-gray-400">
                      Quét mã QR để thanh toán
                    </p>
                  </div>
                  {payment === "bank" && (
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: "#cc323f" }}
                    />
                  )}
                </button>
              </div>

              {/* PayOS info */}
              {payment === "bank" && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Building2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Thanh toán qua PayOS
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Sau khi xác nhận đặt hàng, bạn sẽ được chuyển đến trang
                        thanh toán an toàn của PayOS (hỗ trợ thẻ, chuyển khoản,
                        ví điện tử).
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <Shield
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "#d97706" }}
                    />
                    <p className="text-xs" style={{ color: "#92400e" }}>
                      PayOS bảo mật giao dịch. Không lưu thông tin thẻ/tài
                      khoản.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div
              className="bg-white rounded-2xl shadow-sm p-6"
              style={{ border: "1px solid #f1e5e5" }}
            >
              <h3
                style={{
                  fontFamily: "Lora, serif",
                  color: "#0f172a",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
                className="mb-3"
              >
                Mã giảm giá
              </h3>
              {couponInfo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      {couponInfo.code}
                    </p>
                    <p className="text-xs text-green-600">
                      Giảm{" "}
                      {couponInfo.discount_type === "percent"
                        ? `${couponInfo.discount_value}%`
                        : formatCurrency(couponInfo.discount_value)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCouponInfo(null);
                      setCouponCode("");
                    }}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Xoá
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
                    onKeyDown={(e) => e.key === "Enter" && handleLookupCoupon()}
                  />
                  <button
                    onClick={handleLookupCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all"
                    style={{
                      background: "linear-gradient(135deg, #cc323f, #902131)",
                    }}
                  >
                    {couponLoading ? "..." : "Áp dụng"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-red-500 text-xs mt-1">{couponError}</p>
              )}
            </div>
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl shadow-sm p-6 sticky top-20"
              style={{ border: "1px solid #f1e5e5" }}
            >
              <h3
                style={{
                  fontFamily: "Lora, serif",
                  color: "#0f172a",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
                className="mb-4"
              >
                Đơn hàng
              </h3>

              <div className="divide-y divide-gray-100 mb-4">
                {items.map(renderItem)}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                {discountVnd > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span style={{ fontWeight: 600 }}>
                      -{formatCurrency(discountVnd)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span style={{ fontWeight: 600 }}>Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    Tổng cộng
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#cc323f",
                      fontSize: "1.2rem",
                    }}
                  >
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-3">
                  {checkoutError}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#ab2534";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#cc323f";
                }}
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                Thanh toán an toàn qua PayOS hoặc trả tiền khi nhận hàng (COD)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {successOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "1.3rem",
              }}
              className="mb-2"
            >
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-500 text-sm mb-1">
              Mã đơn:{" "}
              <strong style={{ color: "#cc323f" }}>
                {successOverlay.orderId}
              </strong>
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xác nhận đơn hàng sớm nhất.
            </p>
            <Link
              to="/account/orders"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, #cc323f, #902131)",
              }}
            >
              Xem đơn hàng
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
