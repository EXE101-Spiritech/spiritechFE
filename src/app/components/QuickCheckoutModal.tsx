import {
  X,
  User,
  Mail,
  MapPin,
  Lock,
  Shield,
  Truck,
  Building2,
  Copy,
  Check,
  Clock,
  CheckCircle,
  Phone,
  Zap,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { formatCurrency } from "../data";
import { useAuth } from "../context/AuthContext";

// ─── VietQR ──────────────────────────────────────────────────────────────────
function VietQR({ amount, info }: { amount: number; info: string }) {
  const BANK_ID = "VCB";
  const ACCOUNT_NO = "1234567890";
  const ACCOUNT_NAME = "NGUYEN TAM LINH";
  const url = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(info)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-2xl p-3 bg-white"
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          border: "1.5px solid #e2e8f0",
        }}
      >
        {[
          ["top-2 left-2", "border-t-2 border-l-2 rounded-tl-md"],
          ["top-2 right-2", "border-t-2 border-r-2 rounded-tr-md"],
          ["bottom-2 left-2", "border-b-2 border-l-2 rounded-bl-md"],
          ["bottom-2 right-2", "border-b-2 border-r-2 rounded-br-md"],
        ].map(([pos, border]) => (
          <div
            key={pos}
            className={`absolute ${pos} w-5 h-5 ${border}`}
            style={{ borderColor: "#cc323f" }}
          />
        ))}
        <img
          src={url}
          alt="QR chuyển khoản VietQR"
          className="w-72 h-72 object-contain block"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/288x288?text=QR";
          }}
        />
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-sm text-gray-600" style={{ fontWeight: 600 }}>
          Quét mã để chuyển khoản
        </p>
        <p className="text-xs text-gray-400">
          Hỗ trợ tất cả ứng dụng ngân hàng Việt Nam
        </p>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface QuickCheckoutItem {
  id: string;
  type: "product" | "combo";
  name: string;
  price: number;
  image: string;
}

interface Props {
  item: QuickCheckoutItem;
  qty: number;
  onClose: () => void;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function QuickCheckoutModal({ item, qty, onClose }: Props) {
  const navigate = useNavigate();
  const { profile, isLoggedIn } = useAuth();

  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });
  const [payment, setPayment] = useState<"cod" | "bank">("cod");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "sameday">(
    "standard",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [successOverlay, setSuccessOverlay] = useState<{
    orderId: string;
  } | null>(null);

  const subtotal = item.price * qty;

  const SHIPPING_OPTIONS = [
    {
      id: "standard" as const,
      label: "Tiêu chuẩn",
      time: "3–4 tiếng",
      fee: 30000,
      freeNote: null,
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: "sameday" as const,
      label: "Hỏa tốc",
      time: "1–2 tiếng",
      fee: 45000,
      freeNote: null,
      icon: <Timer className="w-4 h-4" />,
    },
  ];

  const selectedOption = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!;
  const shipping = selectedOption.fee;
  const total = subtotal + shipping;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const orderId = "DH" + Date.now().toString().slice(-6);
    await new Promise((r) => setTimeout(r, 1400));
    setSuccessOverlay({ orderId });
    await new Promise((r) => setTimeout(r, 1800));

    // Tính ETA theo phương thức vận chuyển
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const eta = new Date(now);
    if (shippingMethod === "sameday") {
      eta.setHours(eta.getHours() + 2); // Hỏa tốc: 1-2 tiếng
    } else {
      eta.setHours(eta.getHours() + 4); // Tiêu chuẩn: 3-4 tiếng
    }
    const etaStr = `Hôm nay trước ${String(eta.getHours()).padStart(2, "0")}:00`;

    // Lưu vào sessionStorage — tránh mất state khi navigate async
    const orderData = {
      orderId,
      shippingInfo: {
        name: form.name,
        phone: form.phone,
        address: form.address,
      },
      paymentMethod: payment,
      total,
      shippingMethod,
      shippingFee: shipping,
      items: [
        {
          id: item.id,
          type: item.type,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: qty,
        },
      ],
    };
    sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

    // Lưu vào localStorage để hiển thị trong "Đơn hàng của tôi"
    const newOrder = {
      id: orderId,
      date: dateStr,
      status: "processing",
      items: [
        {
          id: item.id,
          type: item.type,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: qty,
        },
      ],
      total,
      shippingInfo: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        notes: "",
      },
      paymentMethod: payment,
      estimatedDelivery: etaStr,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("userOrders") || "[]");
      localStorage.setItem(
        "userOrders",
        JSON.stringify([newOrder, ...existing]),
      );
    } catch {
      /* ignore */
    }

    onClose();
    navigate("/order-success");
  };

  const copyToClipboard = (text: string, key: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(el);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const fieldFocus = (field: string) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = "#cc323f";
      e.target.style.boxShadow = "0 0 0 3px rgba(204,50,63,0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = errors[field] ? "#fca5a5" : "#e2e8f0";
      e.target.style.boxShadow = "none";
    },
  });

  const setField = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const n = { ...p };
      delete n[field];
      return n;
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{
          backgroundColor: "rgba(15,23,42,0.72)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <div>
              <h2
                style={{
                  fontFamily: "Lora, serif",
                  color: "#0f172a",
                  fontSize: "1.4rem",
                }}
              >
                Thanh Toán Nhanh
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Không cần đăng nhập · Đặt hàng trong 2 phút
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* ── Product summary ── */}
            <div
              className="flex gap-4 p-4 rounded-2xl"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#fdf4f3", color: "#cc323f" }}
                >
                  {item.type === "combo" ? "Combo" : "Sản phẩm"}
                </span>
                <h3
                  className="mt-1.5 mb-1 line-clamp-2"
                  style={{
                    fontFamily: "Lora, serif",
                    color: "#0f172a",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">x{qty}</span>
                  <span style={{ color: "#cc323f", fontWeight: 700 }}>
                    {formatCurrency(item.price * qty)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Shipping info form ── */}
            <div>
              <h3
                className="flex items-center gap-2 mb-3"
                style={{ color: "#0f172a", fontWeight: 600 }}
              >
                <User
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#cc323f" }}
                />
                Thông tin thanh toán
              </h3>

              {/* Auto-fill notice */}
              {isLoggedIn ? (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                  <span style={{ fontWeight: 500 }}>
                    Đã điền tự động từ tài khoản{" "}
                    <strong>{profile?.name}</strong> — bạn vẫn có thể chỉnh sửa
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4 text-xs"
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                  }}
                >
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                  <span>
                    <a
                      href="/login"
                      className="underline font-semibold"
                      style={{ color: "#cc323f" }}
                    >
                      Đăng nhập
                    </a>{" "}
                    để điền thông tin tự động
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-xs text-gray-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#cc323f" }}
                    />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none bg-gray-50 transition-all text-sm"
                      style={{
                        borderColor: errors.name ? "#fca5a5" : "#e2e8f0",
                      }}
                      {...fieldFocus("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-xs text-gray-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#cc323f" }}
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="example@email.com"
                      className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none bg-gray-50 transition-all text-sm"
                      style={{
                        borderColor: errors.email ? "#fca5a5" : "#e2e8f0",
                      }}
                      {...fieldFocus("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-xs text-gray-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#cc323f" }}
                    />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none bg-gray-50 transition-all text-sm"
                      style={{
                        borderColor: errors.phone ? "#fca5a5" : "#e2e8f0",
                      }}
                      {...fieldFocus("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    className="block text-xs text-gray-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Địa chỉ giao hàng *
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#cc323f" }}
                    />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none bg-gray-50 transition-all text-sm"
                      style={{
                        borderColor: errors.address ? "#fca5a5" : "#e2e8f0",
                      }}
                      {...fieldFocus("address")}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Shipping method ── */}
            <div>
              <h3
                className="flex items-center gap-2 mb-4"
                style={{ color: "#0f172a", fontWeight: 600 }}
              >
                <Truck
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#cc323f" }}
                />
                Phương thức vận chuyển
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {SHIPPING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setShippingMethod(opt.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center"
                    style={{
                      borderColor:
                        shippingMethod === opt.id ? "#cc323f" : "#e2e8f0",
                      backgroundColor:
                        shippingMethod === opt.id ? "#fdf4f3" : "white",
                    }}
                  >
                    <span
                      className={
                        shippingMethod === opt.id
                          ? "text-[#cc323f]"
                          : "text-gray-400"
                      }
                    >
                      {opt.icon}
                    </span>
                    <div>
                      <p
                        className="text-xs"
                        style={{
                          fontWeight: 600,
                          color:
                            shippingMethod === opt.id ? "#cc323f" : "#0f172a",
                        }}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.time}</p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          fontWeight: 700,
                          color: opt.freeNote
                            ? "#16a34a"
                            : shippingMethod === opt.id
                              ? "#cc323f"
                              : "#64748b",
                        }}
                      >
                        {opt.freeNote ? opt.freeNote : formatCurrency(opt.fee)}
                      </p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor:
                          shippingMethod === opt.id ? "#cc323f" : "#cbd5e1",
                      }}
                    >
                      {shippingMethod === opt.id && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#cc323f" }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected method highlight */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span className="text-green-600">{selectedOption.icon}</span>
                <div className="flex-1">
                  <span
                    className="text-sm text-green-800"
                    style={{ fontWeight: 600 }}
                  >
                    {selectedOption.label}
                  </span>
                  <span className="text-xs text-green-600 ml-2">
                    · {selectedOption.time}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    color: selectedOption.freeNote ? "#16a34a" : "#cc323f",
                  }}
                >
                  {selectedOption.freeNote
                    ? selectedOption.freeNote
                    : formatCurrency(selectedOption.fee)}
                </span>
              </div>
            </div>

            {/* ── Payment method ── */}
            <div>
              <h3
                className="flex items-center gap-2 mb-4"
                style={{ color: "#0f172a", fontWeight: 600 }}
              >
                <Lock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#cc323f" }}
                />
                Phương thức thanh toán
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5 text-green-500" /> Bảo mật SSL
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {(
                  [
                    {
                      id: "cod",
                      label: "Tiền mặt (COD)",
                      icon: <Truck className="w-5 h-5" />,
                      desc: "Trả khi nhận hàng",
                    },
                    {
                      id: "bank",
                      label: "Chuyển khoản",
                      icon: <Building2 className="w-5 h-5" />,
                      desc: "QR / ngân hàng",
                    },
                  ] as {
                    id: "cod" | "bank";
                    label: string;
                    icon: React.ReactNode;
                    desc: string;
                  }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPayment(opt.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: payment === opt.id ? "#cc323f" : "#e2e8f0",
                      backgroundColor: payment === opt.id ? "#fdf4f3" : "white",
                    }}
                  >
                    <span
                      className={
                        payment === opt.id ? "text-[#cc323f]" : "text-gray-400"
                      }
                    >
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs truncate"
                        style={{
                          fontWeight: 600,
                          color: payment === opt.id ? "#cc323f" : "#0f172a",
                        }}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {opt.desc}
                      </p>
                    </div>
                    <div
                      className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: payment === opt.id ? "#cc323f" : "#cbd5e1",
                      }}
                    >
                      {payment === opt.id && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#cc323f" }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* COD info */}
              {payment === "cod" && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p
                      className="text-sm text-green-800"
                      style={{ fontWeight: 600 }}
                    >
                      Thanh toán khi nhận hàng
                    </p>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"
                      style={{ fontWeight: 600 }}
                    >
                      Phổ biến
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-green-200">
                    <span className="text-sm text-green-700">
                      Tổng cần chuẩn bị
                    </span>
                    <span
                      style={{
                        color: "#cc323f",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                      }}
                    >
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600/80 mt-2 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    Kiểm tra hàng trước khi thanh toán.
                  </p>
                </div>
              )}

              {/* Bank transfer */}
              {payment === "bank" && (
                <div className="space-y-4">
                  <VietQR
                    amount={total}
                    info={`TLD ${form.phone || "THANH TOAN"}`}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 px-2">
                      hoặc chuyển khoản thủ công
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    {[
                      {
                        label: "Ngân hàng",
                        value: "Vietcombank (VCB)",
                        key: "bnk",
                      },
                      {
                        label: "Số tài khoản",
                        value: "1234567890",
                        key: "acc",
                      },
                      {
                        label: "Chủ tài khoản",
                        value: "NGUYEN TAM LINH",
                        key: "own",
                      },
                      {
                        label: "Số tiền",
                        value: formatCurrency(total),
                        key: "amt",
                      },
                      {
                        label: "Nội dung CK",
                        value: `TLD ${form.phone || "SĐT"}`,
                        key: "msg",
                      },
                    ].map((row, i) => (
                      <div
                        key={row.key}
                        className="flex items-center justify-between px-4 py-2.5 text-xs"
                        style={{
                          backgroundColor: i % 2 === 0 ? "white" : "#f8fafc",
                          borderBottom: i < 4 ? "1px solid #f1f5f9" : "none",
                        }}
                      >
                        <span className="text-gray-500">{row.label}</span>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontWeight: 600,
                              color: row.key === "amt" ? "#cc323f" : "#0f172a",
                              fontFamily:
                                row.key === "acc" ? "monospace" : undefined,
                            }}
                          >
                            {row.value}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(row.value, row.key)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                          >
                            {copied === row.key ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    Đơn hàng được xử lý trong 15–30 phút sau khi xác nhận thanh
                    toán.
                  </p>
                </div>
              )}
            </div>

            {/* ── Order summary ── */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tạm tính ({qty} sp)</span>
                <span style={{ fontWeight: 600 }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 600 }}>
                  {shipping === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              {subtotal < 500000 && (
                <p className="text-xs text-gray-400 mb-2">
                  Mua thêm{" "}
                  <span style={{ color: "#cc323f", fontWeight: 600 }}>
                    {formatCurrency(500000 - subtotal)}
                  </span>{" "}
                  để freeship
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between">
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
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{
                backgroundColor: "#cc323f",
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(204,50,63,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#ab2534";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#cc323f";
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Đặt hàng ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {successOverlay && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            backgroundColor: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="bg-white rounded-3xl px-10 py-12 flex flex-col items-center text-center max-w-sm w-full mx-4"
            style={{
              animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div className="relative mb-6 w-20 h-20">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: "rgba(34,197,94,0.15)",
                  animation: "pingOnce 0.8s ease-out 0.1s both",
                }}
              />
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center relative z-10 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animation: "drawCheck 0.45s ease-out 0.25s both",
                    strokeDasharray: 30,
                    strokeDashoffset: 30,
                  }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "1.5rem",
              }}
              className="mb-1"
            >
              Đặt Hàng Thành Công!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Cảm ơn bạn đã tin tưởng Góc An Nhiên 🙏
            </p>
            <div
              className="w-full rounded-2xl px-5 py-4 mb-5"
              style={{
                background: "linear-gradient(135deg, #3a0e16 0%, #cc323f 100%)",
              }}
            >
              <p className="text-white/60 text-xs mb-1.5">
                Mã đơn hàng của bạn
              </p>
              <p
                className="text-white"
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                }}
              >
                {successOverlay.orderId}
              </p>
              <p className="text-white/50 text-xs mt-1.5">
                Lưu mã này để theo dõi đơn hàng
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg
                className="animate-spin w-4 h-4 flex-shrink-0"
                style={{ color: "#cc323f" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Đang chuyển đến trang xác nhận...
            </div>
          </div>
          <style>{`
            @keyframes successPop { 0%{opacity:0;transform:scale(.72) translateY(24px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
            @keyframes pingOnce { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(2.2)} }
            @keyframes drawCheck { to{stroke-dashoffset:0} }
          `}</style>
        </div>
      )}
    </>
  );
}
