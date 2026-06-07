import { useEffect, useState } from "react";
import { useLocation, Link, Navigate } from "react-router";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Truck,
  Banknote,
  Package,
  Zap,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, CartItem } from "../data";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface OrderState {
  orderId: string;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  paymentMethod: "cod" | "bank" | "card";
  total: number;
  shippingFee?: number;
  shippingMethod?: "standard" | "express" | "sameday";
  items: CartItem[];
}

const SHIPPING_META: Record<
  string,
  { label: string; icon: React.ReactNode; daysMin: number; daysMax: number }
> = {
  standard: {
    label: "Giao hàng tiêu chuẩn",
    icon: <Package className="w-4 h-4" />,
    daysMin: 3,
    daysMax: 5,
  },
  express: {
    label: "Giao hàng nhanh",
    icon: <Zap className="w-4 h-4" />,
    daysMin: 1,
    daysMax: 2,
  },
  sameday: {
    label: "Hỏa tốc (2–4 giờ)",
    icon: <Clock className="w-4 h-4" />,
    daysMin: 0,
    daysMax: 0,
  },
};

// ─── Confetti Particle ───────────────────────────────────────────────────────
function ConfettiCanvas() {
  useEffect(() => {
    const canvas = document.getElementById(
      "confetti-canvas",
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#cc323f",
      "#e6bb0c",
      "#902131",
      "#f5d020",
      "#ffffff",
      "#fca5a5",
    ];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 1.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      drift: (Math.random() - 0.5) * 1.5,
    }));

    let raf: number;
    let elapsed = 0;
    const draw = () => {
      elapsed++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 300);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < 300) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}

// ─── Order Timeline ───────────────────────────────────────────────────────────
function OrderTimeline({ shippingMethod }: { shippingMethod: string }) {
  const isSameDay = shippingMethod === "sameday";
  const steps = [
    { label: "Đặt hàng", sub: "Vừa xong", done: true, active: false },
    { label: "Xác nhận", sub: "Trong 30 phút", done: false, active: true },
    {
      label: isSameDay ? "Đang lấy hàng" : "Đang giao",
      sub: isSameDay ? "~1 giờ" : "Sau xác nhận",
      done: false,
      active: false,
    },
    {
      label: "Đã nhận",
      sub: isSameDay
        ? "Hôm nay"
        : SHIPPING_META[shippingMethod]?.label.replace("Giao hàng ", "") || "",
      done: false,
      active: false,
    },
  ];

  return (
    <div className="flex items-start justify-between px-2 py-4">
      {steps.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative">
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className="absolute top-4 left-1/2 w-full h-0.5 transition-all"
              style={{
                backgroundColor: s.done ? "#22c55e" : "#e2e8f0",
                zIndex: 0,
              }}
            />
          )}
          {/* Circle */}
          <div
            className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              backgroundColor: s.done
                ? "#22c55e"
                : s.active
                  ? "#fef9ec"
                  : "#f1f5f9",
              border: s.active
                ? "2px solid #e6bb0c"
                : s.done
                  ? "2px solid #22c55e"
                  : "2px solid #e2e8f0",
              boxShadow: s.active ? "0 0 0 4px rgba(230,187,12,0.15)" : "none",
            }}
          >
            {s.done ? (
              <Check className="w-4 h-4 text-white" />
            ) : s.active ? (
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#e6bb0c" }}
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            )}
          </div>
          {/* Label */}
          <p
            className="text-xs mt-2 text-center"
            style={{
              fontWeight: s.done || s.active ? 600 : 400,
              color: s.done ? "#16a34a" : s.active ? "#92650a" : "#94a3b8",
            }}
          >
            {s.label}
          </p>
          <p
            className="text-xs text-center mt-0.5"
            style={{ color: "#cbd5e1", fontSize: "0.65rem" }}
          >
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderSuccess() {
  const location = useLocation();
  const [copiedId, setCopiedId] = useState(false);
  const [visible, setVisible] = useState(false);

  // Ưu tiên location.state, fallback sang sessionStorage
  const rawState = location.state as OrderState | null;
  const [state] = useState<OrderState | null>(() => {
    if (rawState) return rawState;
    try {
      const stored = sessionStorage.getItem("pendingOrder");
      if (stored) {
        sessionStorage.removeItem("pendingOrder"); // xoá sau khi đọc
        return JSON.parse(stored) as OrderState;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!state) return <Navigate to="/" replace />;

  const {
    orderId,
    shippingInfo,
    paymentMethod,
    total,
    shippingFee,
    shippingMethod = "standard",
    items,
  } = state;

  // ETA
  const eta = new Date();
  if (shippingMethod === "sameday") {
    eta.setHours(eta.getHours() + 4);
  } else {
    eta.setDate(eta.getDate() + SHIPPING_META[shippingMethod].daysMax);
  }
  const etaStr =
    shippingMethod === "sameday"
      ? `Hôm nay trước ${eta.getHours()}:00`
      : eta.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

  const copyOrderId = () => {
    const el = document.createElement("textarea");
    el.value = orderId;
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
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const paymentLabel =
    paymentMethod === "cod"
      ? "Thanh toán khi nhận hàng (COD)"
      : "Thanh toán qua PayOS";
  const subtotal = total - (shippingFee ?? 0);

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-14 px-4"
        style={{
          background:
            "linear-gradient(135deg, #3a0e16 0%, #902131 55%, #cc323f 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: "#e6bb0c" }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: "#e6bb0c" }}
        />

        <div
          className="max-w-xl mx-auto text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div
              className="absolute w-24 h-24 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "#22c55e" }}
            />
            <div
              className="absolute w-20 h-20 rounded-full opacity-30"
              style={{ backgroundColor: "#22c55e" }}
            />
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
              <CheckCircle
                className="w-10 h-10 text-green-500"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "white",
              fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
            }}
          >
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            Cảm ơn <strong className="text-white">{shippingInfo.name}</strong>{" "}
            đã tin tưởng Góc An Nhiên 🙏
          </p>

          {/* Order ID badge */}
          <button
            onClick={copyOrderId}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <span className="text-white/70 text-sm">Mã đơn hàng</span>
            <span
              className="text-white"
              style={{
                fontWeight: 700,
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {orderId}
            </span>
            {copiedId ? (
              <Check className="w-4 h-4 text-green-300" />
            ) : (
              <Copy className="w-4 h-4 text-white/50" />
            )}
          </button>
          <p className="text-white/40 text-xs mt-2">Nhấn để sao chép mã đơn</p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Order Progress */}
        <div
          className="bg-white rounded-2xl shadow-sm px-4 pt-2 pb-4 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "100ms",
          }}
        >
          <p
            className="text-xs text-gray-400 pt-4 px-2 mb-1"
            style={{
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Tiến trình đơn hàng
          </p>
          <OrderTimeline shippingMethod={shippingMethod} />
        </div>

        {/* Items */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "180ms",
          }}
        >
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
            <p
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "1.05rem",
              }}
            >
              Sản phẩm ({items.reduce((s, i) => s + i.quantity, 0)})
            </p>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "#fdf4f3",
                color: "#cc323f",
                fontWeight: 600,
              }}
            >
              #{orderId}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 px-5 py-4 items-center">
                <div className="relative flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl"
                  />
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      backgroundColor: "#cc323f",
                    }}
                  >
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-800 text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    {item.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {formatCurrency(item.price)} / sản phẩm
                  </p>
                </div>
                <span
                  className="flex-shrink-0 text-sm"
                  style={{ color: "#cc323f", fontWeight: 700 }}
                >
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-5 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tạm tính</span>
              <span style={{ fontWeight: 500 }}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            {shippingFee !== undefined && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 500 }}>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Tổng cộng
              </span>
              <span
                style={{
                  fontWeight: 800,
                  color: "#cc323f",
                  fontSize: "1.15rem",
                }}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery + Payment */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "260ms",
          }}
        >
          {/* Delivery card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#fdf4f3" }}
              >
                <MapPin className="w-4 h-4" style={{ color: "#cc323f" }} />
              </div>
              <p
                style={{
                  fontWeight: 600,
                  color: "#0f172a",
                  fontSize: "0.9rem",
                }}
              >
                Địa chỉ nhận hàng
              </p>
            </div>
            <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
              {shippingInfo.name}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">{shippingInfo.phone}</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {shippingInfo.address}
            </p>
            {shippingInfo.notes && (
              <p className="text-gray-400 text-xs mt-1.5 italic">
                "{shippingInfo.notes}"
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                {SHIPPING_META[shippingMethod].icon}
                <span>{SHIPPING_META[shippingMethod].label}</span>
              </div>
              <p
                className="text-sm"
                style={{ color: "#16a34a", fontWeight: 700 }}
              >
                🚚 Dự kiến: {etaStr}
              </p>
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#fdf4f3" }}
              >
                {paymentMethod === "cod" ? (
                  <Truck className="w-4 h-4" style={{ color: "#cc323f" }} />
                ) : paymentMethod === "bank" ? (
                  <Banknote className="w-4 h-4" style={{ color: "#cc323f" }} />
                ) : (
                  <CreditCard
                    className="w-4 h-4"
                    style={{ color: "#cc323f" }}
                  />
                )}
              </div>
              <p
                style={{
                  fontWeight: 600,
                  color: "#0f172a",
                  fontSize: "0.9rem",
                }}
              >
                Thanh toán
              </p>
            </div>
            <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
              {paymentLabel}
            </p>

            {paymentMethod === "cod" && (
              <>
                <p className="text-gray-500 text-sm mt-1">
                  Chuẩn bị đúng số tiền khi nhận hàng
                </p>
                <div
                  className="mt-3 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <span
                    className="text-green-700 text-xs"
                    style={{ fontWeight: 500 }}
                  >
                    Số tiền cần thanh toán
                  </span>
                  <span style={{ fontWeight: 800, color: "#16a34a" }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </>
            )}

            {paymentMethod !== "cod" && (
              <div
                className="mt-3 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span
                  className="text-green-700 text-xs"
                  style={{ fontWeight: 500 }}
                >
                  Trạng thái
                </span>
                <span
                  className="text-green-700 text-xs flex items-center gap-1"
                  style={{ fontWeight: 700 }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Thanh toán thành công
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hotline notice */}
        <div
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "340ms",
            background: "linear-gradient(135deg, #fdf4f3 0%, #fef9ec 100%)",
            border: "1px solid rgba(204,50,63,0.15)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#cc323f" }}
          >
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p
              style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}
            >
              Chúng tôi sẽ xác nhận đơn trong{" "}
              <span style={{ color: "#cc323f" }}>30 phút</span>
            </p>
            <p className="text-gray-500 text-sm mt-0.5">
              Cần hỗ trợ? Gọi hotline{" "}
              <a
                href="tel:0800123456"
                style={{ color: "#cc323f", fontWeight: 700 }}
              >
                0800 123 456
              </a>{" "}
              hoặc nhắn tin Zalo
            </p>
          </div>
          <a
            href="https://zalo.me"
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0068FF", fontWeight: 600 }}
          >
            <MessageCircle className="w-4 h-4" /> Nhắn Zalo
          </a>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "420ms",
          }}
        >
          <Link
            to="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 text-white py-4 rounded-xl transition-colors text-sm"
            style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ab2534";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#cc323f";
            }}
          >
            Theo dõi đơn hàng <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/products"
            className="flex-1 flex items-center justify-center gap-2 border-2 py-4 rounded-xl transition-colors text-sm hover:bg-[#fdf4f3]"
            style={{
              borderColor: "#cc323f",
              color: "#cc323f",
              fontWeight: 600,
            }}
          >
            <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
          </Link>
          <Link
            to="/"
            className="sm:w-14 flex items-center justify-center border-2 py-4 rounded-xl transition-colors hover:bg-gray-50"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
            title="Về trang chủ"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer trust */}
        <div
          className="text-center pb-4 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: "500ms" }}
        >
          <p className="text-xs text-gray-400">
            🔒 Đơn hàng được bảo vệ bởi chính sách{" "}
            <strong>đổi trả 7 ngày</strong> · Giao hàng toàn quốc
          </p>
        </div>
      </div>
    </div>
  );
}
