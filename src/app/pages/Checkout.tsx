import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  CheckCircle,
  Banknote,
  Truck,
  MapPin,
  ChevronDown,
  Package,
  Zap,
  Clock,
  ChevronRight,
  Shield,
  Lock,
  Copy,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data";
import { checkoutApi } from "@/features/checkout/api";
import { couponApi } from "@/features/coupons/api";
import type { CouponInfo } from "@/shared/types";
import { API_BASE } from "@/shared/api/axiosClient";

// ── Event tracking ─────────────────────────────────────────────────────────────
function track(eventType: string, payload: Record<string, any> = {}) {
  fetch(`${API_BASE}/v1/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, payload }),
  }).catch(() => {});
}

// ─── VietQR Component ─────────────────────────────────────────────────────────
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
        {/* Corner accents */}
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

// ─── Vietnam Province Data ────────────────────────────────────────────────────
type ShippingZone = "hcm" | "hn" | "city" | "province";

interface Province {
  code: string;
  name: string;
  zone: ShippingZone;
  districts: string[];
}

const PROVINCES: Province[] = [
  {
    code: "HCM",
    name: "TP. Hồ Chí Minh",
    zone: "hcm",
    districts: [
      "Quận 1",
      "Quận 2 (TP. Thủ Đức)",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 9 (TP. Thủ Đức)",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Thạnh",
      "Quận Gò Vấp",
      "Quận Phú Nhuận",
      "Quận Tân Bình",
      "Quận Tân Phú",
      "Huyện Bình Chánh",
      "Huyện Củ Chi",
      "Huyện Hóc Môn",
      "Huyện Nhà Bè",
      "Huyện Cần Giờ",
    ],
  },
  {
    code: "HN",
    name: "Hà Nội",
    zone: "hn",
    districts: [
      "Quận Ba Đình",
      "Quận Hoàn Kiếm",
      "Quận Tây Hồ",
      "Quận Long Biên",
      "Quận Cầu Giấy",
      "Quận Đống Đa",
      "Quận Hai Bà Trưng",
      "Quận Hoàng Mai",
      "Quận Thanh Xuân",
      "Quận Nam Từ Liêm",
      "Quận Bắc Từ Liêm",
      "Quận Hà Đông",
      "Huyện Gia Lâm",
      "Huyện Đông Anh",
      "Huyện Sóc Sơn",
      "Huyện Thanh Trì",
      "Huyện Thường Tín",
      "Huyện Đan Phượng",
    ],
  },
  {
    code: "DN",
    name: "Đà Nẵng",
    zone: "city",
    districts: [
      "Quận Hải Châu",
      "Quận Thanh Khê",
      "Quận Sơn Trà",
      "Quận Ngũ Hành Sơn",
      "Quận Liên Chiểu",
      "Quận Cẩm Lệ",
      "Huyện Hòa Vang",
    ],
  },
  {
    code: "CT",
    name: "Cần Thơ",
    zone: "city",
    districts: [
      "Quận Ninh Kiều",
      "Quận Cái Răng",
      "Quận Bình Thủy",
      "Quận Ô Môn",
      "Quận Thốt Nốt",
      "Huyện Phong Điền",
      "Huyện Cờ Đỏ",
    ],
  },
  {
    code: "HP",
    name: "Hải Phòng",
    zone: "city",
    districts: [
      "Quận Hồng Bàng",
      "Quận Ngô Quyền",
      "Quận Lê Chân",
      "Quận Hải An",
      "Quận Kiến An",
      "Huyện An Dương",
      "Huyện Thủy Nguyên",
    ],
  },
  {
    code: "BD",
    name: "Bình Dương",
    zone: "city",
    districts: [
      "TP. Thủ Dầu Một",
      "TP. Dĩ An",
      "TP. Thuận An",
      "TP. Bến Cát",
      "Huyện Bàu Bàng",
      "Huyện Dầu Tiếng",
    ],
  },
  {
    code: "BH",
    name: "Biên Hòa (Đồng Nai)",
    zone: "city",
    districts: [
      "TP. Biên Hòa",
      "Huyện Nhơn Trạch",
      "Huyện Long Thành",
      "Huyện Trảng Bom",
      "Huyện Xuân Lộc",
    ],
  },
  {
    code: "AG",
    name: "An Giang",
    zone: "province",
    districts: [
      "TP. Long Xuyên",
      "TP. Châu Đốc",
      "Huyện An Phú",
      "Huyện Châu Phú",
      "Huyện Châu Thành",
    ],
  },
  {
    code: "BNH",
    name: "Bắc Ninh",
    zone: "province",
    districts: [
      "TP. Bắc Ninh",
      "TX. Từ Sơn",
      "Huyện Tiên Du",
      "Huyện Yên Phong",
      "Huyện Thuận Thành",
    ],
  },
  {
    code: "GL",
    name: "Gia Lai",
    zone: "province",
    districts: [
      "TP. Pleiku",
      "TX. An Khê",
      "TX. Ayun Pa",
      "Huyện Chư Sê",
      "Huyện Đak Đoa",
    ],
  },
  {
    code: "KH",
    name: "Khánh Hòa",
    zone: "province",
    districts: [
      "TP. Nha Trang",
      "TX. Cam Ranh",
      "Huyện Diên Khánh",
      "Huyện Ninh Hòa",
      "Huyện Vạn Ninh",
    ],
  },
  {
    code: "LAN",
    name: "Lâm Đồng (Đà Lạt)",
    zone: "province",
    districts: [
      "TP. Đà Lạt",
      "TP. Bảo Lộc",
      "Huyện Lâm Hà",
      "Huyện Đức Trọng",
      "Huyện Di Linh",
    ],
  },
  {
    code: "NA",
    name: "Nghệ An",
    zone: "province",
    districts: [
      "TP. Vinh",
      "TX. Cửa Lò",
      "Huyện Nghi Lộc",
      "Huyện Hưng Nguyên",
      "Huyện Nam Đàn",
    ],
  },
  {
    code: "QN",
    name: "Quảng Nam",
    zone: "province",
    districts: [
      "TP. Tam Kỳ",
      "TP. Hội An",
      "Huyện Điện Bàn",
      "Huyện Duy Xuyên",
      "Huyện Thăng Bình",
    ],
  },
  {
    code: "TH",
    name: "Thanh Hóa",
    zone: "province",
    districts: [
      "TP. Thanh Hóa",
      "TX. Bỉm Sơn",
      "TX. Sầm Sơn",
      "Huyện Đông Sơn",
      "Huyện Hoằng Hóa",
    ],
  },
  {
    code: "VL",
    name: "Vĩnh Long",
    zone: "province",
    districts: [
      "TP. Vĩnh Long",
      "Huyện Long Hồ",
      "Huyện Mang Thít",
      "Huyện Vũng Liêm",
      "Huyện Tam Bình",
    ],
  },
];

// ─── Shipping Methods ─────────────────────────────────────────────────────────
interface ShippingMethod {
  id: "standard" | "sameday";
  label: string;
  desc: string;
  icon: React.ReactNode;
  zones: ShippingZone[];
  baseFee: Record<ShippingZone, number>;
  freeThreshold: number | null;
  discountThreshold?: { amount: number; discount: number };
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Giao hàng tiêu chuẩn",
    desc: "3 – 4 tiếng",
    icon: <Package className="w-5 h-5" />,
    zones: ["hcm", "hn", "city", "province"],
    baseFee: {
      hcm: 30000,
      hn: 30000,
      city: 30000,
      province: 30000,
    },
    freeThreshold: null,
  },
  {
    id: "sameday",
    label: "Hỏa tốc",
    desc: "1 – 2 tiếng · Chỉ áp dụng tại HCM & Hà Nội",
    icon: <Clock className="w-5 h-5" />,
    zones: ["hcm", "hn"],
    baseFee: { hcm: 45000, hn: 45000, city: 0, province: 0 },
    freeThreshold: null,
  },
];

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEPS = ["Địa chỉ", "Vận chuyển", "Thanh toán", "Xác nhận"];

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
              style={{
                backgroundColor:
                  i < step ? "#cc323f" : i === step ? "#cc323f" : "#e2e8f0",
                color: i <= step ? "white" : "#94a3b8",
                fontWeight: 600,
                boxShadow:
                  i === step ? "0 0 0 3px rgba(204,50,63,0.2)" : "none",
              }}
            >
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className="text-xs mt-1 hidden sm:block"
              style={{
                color: i <= step ? "#cc323f" : "#94a3b8",
                fontWeight: i === step ? 600 : 400,
              }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="w-12 sm:w-16 h-0.5 mx-1 mt-[-10px] sm:mt-[-18px] transition-all"
              style={{
                backgroundColor: i < step ? "#cc323f" : "#e2e8f0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ShippingForm {
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  province?: string;
  district?: string;
  address?: string;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, totalPrice, clearCart, cartId, version } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const autoProvince = profile?.address
    ? PROVINCES.find((p) =>
        profile.address
          .toLowerCase()
          .includes(
            p.name.toLowerCase().replace("tp. ", "").replace("tỉnh ", ""),
          ),
      )
    : undefined;

  const [form, setForm] = useState<ShippingForm>({
    name: profile?.name || "",
    phone: profile?.phone || "",
    province: autoProvince?.code || "",
    district: "",
    ward: "",
    address: profile?.address || "",
    notes: "",
  });
  const [selectedMethod, setSelectedMethod] = useState<string>("standard");
  const [payment, setPayment] = useState<"cod" | "bank">("cod");

  // Track user entered checkout
  useEffect(() => {
    if (cartId) {
      track("checkout.step_cart", { cart_id: cartId });
    }
  }, []);

  // Track page exit with cart items
  useEffect(() => {
    if (items.length === 0) return;
    const handleExit = () => {
      track("page.exited", {
        cart_id: cartId,
        item_count: items.length,
      });
    };
    window.addEventListener("beforeunload", handleExit, { capture: true });
    return () =>
      window.removeEventListener("beforeunload", handleExit, { capture: true });
  }, [items.length, cartId]);
  const [errors, setErrors] = useState<FormErrors>({});

  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState<{
    orderId: string;
  } | null>(null);

  // ── Coupon ───────────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const discountVnd = couponInfo
    ? couponInfo.discount_type === "percent"
      ? Math.round((totalPrice * couponInfo.discount_value) / 10000)
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

  // ── Guest checkout (non-logged-in) ──────────────────────────────────────────
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [guestPayment, setGuestPayment] = useState<"cod" | "bank">("cod");
  const [guestShippingMethod, setGuestShippingMethod] = useState<
    "standard" | "sameday"
  >("standard");
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  // Derived
  const selectedProvince = PROVINCES.find((p) => p.code === form.province);
  const zone: ShippingZone = selectedProvince?.zone || "province";
  const availableMethods = SHIPPING_METHODS.filter((m) =>
    m.zones.includes(zone),
  );

  useEffect(() => {
    setForm((prev) => ({ ...prev, district: "", ward: "" }));
    if (!availableMethods.find((m) => m.id === selectedMethod)) {
      setSelectedMethod("standard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.province]);

  const getShippingFee = (methodId: string) => {
    const method = SHIPPING_METHODS.find((m) => m.id === methodId)!;
    if (!selectedProvince) return method.baseFee["province"];
    const base = method.baseFee[zone];
    if (method.freeThreshold && totalPrice >= method.freeThreshold) return 0;
    if (
      method.discountThreshold &&
      totalPrice >= method.discountThreshold.amount
    ) {
      return Math.round(base * (1 - method.discountThreshold.discount));
    }
    return base;
  };

  const shippingFee = form.province ? getShippingFee(selectedMethod) : 0;
  const grandTotal = totalPrice + shippingFee - discountVnd;

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validateStep0 = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!form.province) e.province = "Vui lòng chọn tỉnh / thành phố";
    if (!form.district) e.district = "Vui lòng chọn quận / huyện";
    if (!form.address.trim()) e.address = "Vui lòng nhập số nhà, tên đường";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => true;

  const update = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field as keyof FormErrors];
        return n;
      });
    }
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

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    // Kiểm tra thông tin đã đủ chưa
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.province ||
      !form.district ||
      !form.address.trim()
    ) {
      alert("Bạn cần nhập đủ thông tin thanh toán");
      return;
    }

    setLoading(true);

    const fullAddress = [
      form.address,
      form.ward,
      form.district,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");

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
          shipping_vnd: shippingFee,
          shipping_address: {
            street: fullAddress,
            city: selectedProvince?.name || "",
            district: form.district,
          },
          buyer: {
            name: form.name,
            phone: form.phone,
            email: profile?.email || "",
            address: fullAddress,
          },
          coupon_code: couponInfo?.code || undefined,
          note: form.notes || undefined,
        },
        crypto.randomUUID(),
      );

      clearCart();
      setLoading(false);

      // Lưu vào localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("userOrders") || "[]");
        localStorage.setItem(
          "userOrders",
          JSON.stringify([
            {
              id: orderData.order_id,
              orderNumber: orderData.order_number,
              date: new Date().toLocaleDateString("vi-VN"),
              status: orderData.status,
              items,
              total: orderData.total_vnd,
              shippingInfo: {
                name: form.name,
                phone: form.phone,
                address: fullAddress,
                notes: form.notes || "",
              },
              paymentMethod: payment,
            },
            ...existing,
          ]),
        );
      } catch {
        /* ignore */
      }

      // Nếu thanh toán ngân hàng, redirect
      if (orderData.payment_redirect) {
        window.location.href = orderData.payment_redirect;
      } else {
        navigate("/order-success", {
          state: {
            orderId: orderData.order_id,
            shippingInfo: { ...form, address: fullAddress },
            paymentMethod: payment,
            total: orderData.total_vnd,
            shippingMethod: selectedMethod,
            shippingFee,
            items,
          },
        });
      }
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
      alert(msg);
    }
  };

  // ─── Guest checkout handlers ───────────────────────────────────────────────
  const GUEST_SHIPPING = guestShippingMethod === "sameday" ? 45000 : 30000;
  const guestTotal = totalPrice + GUEST_SHIPPING;

  const validateGuest = () => {
    const e: Record<string, string> = {};
    if (!guestForm.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (
      !guestForm.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email)
    )
      e.email = "Email không hợp lệ";
    if (!guestForm.phone.trim() || !/^0\d{9}$/.test(guestForm.phone))
      e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!guestForm.address.trim())
      e.address = "Vui lòng nhập địa chỉ giao hàng";

    setGuestErrors(e);

    // Nếu có lỗi, hiển thị thông báo
    if (Object.keys(e).length > 0) {
      alert("Bạn cần nhập đủ thông tin thanh toán");
      return false;
    }

    return true;
  };

  const handleGuestSubmit = async () => {
    if (!validateGuest()) return;
    setLoading(true);
    const orderItems = [...items];
    const orderId = "DH" + Date.now().toString().slice(-6);
    await new Promise((r) => setTimeout(r, 1400));
    setSuccessOverlay({ orderId });
    await new Promise((r) => setTimeout(r, 1800));
    clearCart();

    // Lưu vào localStorage để hiển thị trong "Đơn hàng của tôi"
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const eta = new Date(now);
    if (guestShippingMethod === "sameday") {
      eta.setHours(eta.getHours() + 2);
    } else {
      eta.setHours(eta.getHours() + 4);
    }
    const etaStr = `Hôm nay trước ${String(eta.getHours()).padStart(2, "0")}:00`;
    try {
      const existing = JSON.parse(localStorage.getItem("userOrders") || "[]");
      localStorage.setItem(
        "userOrders",
        JSON.stringify([
          {
            id: orderId,
            date: dateStr,
            status: "processing",
            items: orderItems,
            total: guestTotal,
            shippingInfo: {
              name: guestForm.name,
              phone: guestForm.phone,
              address: guestForm.address,
              notes: "",
            },
            paymentMethod: guestPayment,
            estimatedDelivery: etaStr,
          },
          ...existing,
        ]),
      );
    } catch {
      /* ignore */
    }

    navigate("/order-success", {
      state: {
        orderId,
        shippingInfo: {
          name: guestForm.name,
          phone: guestForm.phone,
          address: guestForm.address,
        },
        paymentMethod: guestPayment,
        total: guestTotal,
        shippingMethod: guestShippingMethod,
        shippingFee: GUEST_SHIPPING,
        items: orderItems,
      },
    });
  };

  const gfFocus = (field: string) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = "#cc323f";
      e.target.style.boxShadow = "0 0 0 3px rgba(204,50,63,0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = guestErrors[field] ? "#fca5a5" : "#e2e8f0";
      e.target.style.boxShadow = "none";
    },
  });

  if (items.length === 0 && !loading && !successOverlay) {
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center"
      >
        <p className="text-gray-500 mb-4">
          Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.
        </p>
        <Link to="/products" className="underline" style={{ color: "#cc323f" }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const inp = (hasErr: boolean) => ({
    borderColor: hasErr ? "#fca5a5" : "#e2e8f0",
  });
  const focusHandlers = (errField?: keyof FormErrors) => ({
    onFocus: (
      e: React.FocusEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      e.target.style.borderColor = "#cc323f";
      e.target.style.boxShadow = "0 0 0 3px rgba(204,50,63,0.1)";
    },
    onBlur: (
      e: React.FocusEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      e.target.style.borderColor =
        errField && errors[errField] ? "#fca5a5" : "#e2e8f0";
      e.target.style.boxShadow = "none";
    },
  });

  // ─── Step 0: Address ──────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2
        className="flex items-center gap-2 mb-5"
        style={{
          fontFamily: "Lora, serif",
          color: "#0f172a",
          fontSize: "1.2rem",
        }}
      >
        <MapPin className="w-5 h-5" style={{ color: "#cc323f" }} />
        Địa chỉ giao hàng
      </h2>

      {/* Auto-fill banner */}
      {profile && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            backgroundColor: "rgba(204,50,63,0.06)",
            border: "1px solid rgba(204,50,63,0.18)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#cc323f" }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm truncate"
                style={{ fontWeight: 600, color: "#3a0e16" }}
              >
                {profile.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile.phone} · {profile.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              update("name", profile.name);
              update("phone", profile.phone);
              if (profile.address) {
                update("address", profile.address);
                const matched = PROVINCES.find((p) =>
                  profile.address
                    .toLowerCase()
                    .includes(
                      p.name
                        .toLowerCase()
                        .replace("tp. ", "")
                        .replace("tỉnh ", ""),
                    ),
                );
                if (matched) update("province", matched.code);
              }
            }}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "#cc323f",
              color: "white",
              fontWeight: 600,
            }}
          >
            Điền tự động
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
            style={inp(!!errors.name)}
            {...focusHandlers("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
            className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
            style={inp(!!errors.phone)}
            {...focusHandlers("phone")}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label
            className="block text-sm text-gray-700 mb-1.5"
            style={{ fontWeight: 500 }}
          >
            Tỉnh / Thành phố *
          </label>
          <div className="relative">
            <select
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all appearance-none"
              style={inp(!!errors.province)}
              {...focusHandlers("province")}
            >
              <option value="">-- Chọn tỉnh / thành phố --</option>
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.province && (
            <p className="text-red-500 text-xs mt-1">{errors.province}</p>
          )}
        </div>
        <div>
          <label
            className="block text-sm text-gray-700 mb-1.5"
            style={{ fontWeight: 500 }}
          >
            Quận / Huyện *
          </label>
          <div className="relative">
            <select
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              disabled={!form.province}
              className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all appearance-none disabled:opacity-50"
              style={inp(!!errors.district)}
              {...focusHandlers("district")}
            >
              <option value="">-- Chọn quận / huyện --</option>
              {(selectedProvince?.districts || []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.district && (
            <p className="text-red-500 text-xs mt-1">{errors.district}</p>
          )}
        </div>
        <div>
          <label
            className="block text-sm text-gray-700 mb-1.5"
            style={{ fontWeight: 500 }}
          >
            Phường / Xã <span className="text-gray-400">(tuỳ chọn)</span>
          </label>
          <input
            type="text"
            value={form.ward}
            onChange={(e) => update("ward", e.target.value)}
            placeholder="VD: Phường 8"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
            {...focusHandlers()}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            className="block text-sm text-gray-700 mb-1.5"
            style={{ fontWeight: 500 }}
          >
            Số nhà, tên đường *
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="VD: 123 Nguyễn Văn Trỗi"
            className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
            style={inp(!!errors.address)}
            {...focusHandlers("address")}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label
            className="block text-sm text-gray-700 mb-1.5"
            style={{ fontWeight: 500 }}
          >
            Ghi chú đơn hàng <span className="text-gray-400">(tuỳ chọn)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Ghi chú cho người giao hàng (gọi trước, để ở lễ tân, v.v.)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all resize-none"
            {...focusHandlers()}
          />
        </div>
      </div>
    </div>
  );

  // ─── Step 1: Shipping ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2
        className="flex items-center gap-2 mb-2"
        style={{
          fontFamily: "Lora, serif",
          color: "#0f172a",
          fontSize: "1.2rem",
        }}
      >
        <Truck className="w-5 h-5" style={{ color: "#cc323f" }} />
        Phương thức vận chuyển
      </h2>
      {selectedProvince && (
        <p className="text-sm text-gray-500 mb-5">
          Giao đến:{" "}
          <strong className="text-gray-700">
            {[form.district, selectedProvince.name].filter(Boolean).join(", ")}
          </strong>
        </p>
      )}
      <div className="space-y-3">
        {availableMethods.map((method) => {
          const fee = form.province
            ? getShippingFee(method.id)
            : method.baseFee[zone];
          const selected = selectedMethod === method.id;
          const originalFee = method.baseFee[zone];
          const isDiscounted = fee < originalFee;
          return (
            <label
              key={method.id}
              className="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
              style={{
                borderColor: selected ? "#cc323f" : "#e2e8f0",
                backgroundColor: selected ? "#fdf4f3" : "white",
              }}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selected}
                onChange={() => setSelectedMethod(method.id)}
                className="mt-0.5 accent-[#cc323f]"
              />
              <span
                className={`mt-0.5 ${selected ? "text-[#cc323f]" : "text-gray-400"}`}
              >
                {method.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800" style={{ fontWeight: 600 }}>
                  {method.label}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">{method.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {fee === 0 ? (
                  <span
                    className="text-green-600 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Miễn phí
                  </span>
                ) : (
                  <div>
                    <span
                      className="text-sm"
                      style={{
                        fontWeight: 600,
                        color: selected ? "#cc323f" : "#0f172a",
                      }}
                    >
                      {formatCurrency(fee)}
                    </span>
                    {isDiscounted && (
                      <span className="block text-xs text-gray-400 line-through">
                        {formatCurrency(originalFee)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {totalPrice < 500000 && (
        <div
          className="mt-4 p-3 rounded-xl flex items-center gap-2 text-sm"
          style={{
            backgroundColor: "#fef9ec",
            border: "1px solid rgba(230,187,12,0.3)",
          }}
        >
          <span>🎁</span>
          <span style={{ color: "#92650a" }}>
            Mua thêm <strong>{formatCurrency(500000 - totalPrice)}</strong> để
            được freeship tiêu chuẩn!
          </span>
        </div>
      )}
    </div>
  );

  // ─── Step 2: Payment ──────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2
          className="flex items-center gap-2 mb-5"
          style={{
            fontFamily: "Lora, serif",
            color: "#0f172a",
            fontSize: "1.2rem",
          }}
        >
          <Lock className="w-5 h-5" style={{ color: "#cc323f" }} />
          Phương thức thanh toán
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-green-500" /> Bảo mật SSL
            256-bit
          </span>
        </h2>

        {/* Payment method tabs */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {(
            [
              {
                id: "cod",
                label: "Tiền mặt (COD)",
                icon: <Truck className="w-5 h-5" />,
              },
              {
                id: "bank",
                label: "Chuyển khoản",
                icon: <Building2 className="w-5 h-5" />,
              },
            ] as {
              id: "cod" | "bank";
              label: string;
              icon: React.ReactNode;
            }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPayment(opt.id)}
              className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 transition-all"
              style={{
                borderColor: payment === opt.id ? "#cc323f" : "#e2e8f0",
                backgroundColor: payment === opt.id ? "#fdf4f3" : "white",
                color: payment === opt.id ? "#cc323f" : "#64748b",
              }}
            >
              {opt.icon}
              <span
                className="text-xs text-center leading-tight"
                style={{
                  fontWeight: payment === opt.id ? 600 : 400,
                }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* COD Details */}
      {payment === "cod" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#f0fdf4" }}
            >
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-800" style={{ fontWeight: 600 }}>
                Thanh toán khi nhận hàng
              </p>
              <p className="text-gray-500 text-sm">
                Chuẩn bị đúng số tiền cho nhân viên giao hàng
              </p>
            </div>
            <span
              className="ml-auto text-xs px-2.5 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                fontWeight: 600,
              }}
            >
              Phổ biến nhất
            </span>
          </div>
          <div
            className="rounded-xl p-4 space-y-2"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px dashed #cbd5e1",
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tổng tiền cần chuẩn bị</span>
              <span
                style={{
                  color: "#cc323f",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <p className="text-gray-400 text-xs">
              Nhân viên giao hàng sẽ thu tiền mặt khi giao đơn thành công.
            </p>
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              Kiểm tra hàng trước khi thanh toán. Từ chối nhận nếu hàng bị hư
              hỏng.
            </span>
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {payment === "bank" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* QR Code */}
          <VietQR
            amount={grandTotal}
            info={`TLD ${form.phone || "THANH TOAN"}`}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 px-1">
              hoặc chuyển khoản thủ công
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Account info table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {[
              {
                label: "Ngân hàng",
                value: "Vietcombank (VCB)",
                key: "bank",
              },
              {
                label: "Số tài khoản",
                value: "1234567890",
                key: "acc",
              },
              {
                label: "Chủ tài khoản",
                value: "NGUYEN TAM LINH",
                key: "owner",
              },
              {
                label: "Số tiền",
                value: formatCurrency(grandTotal),
                key: "amount",
              },
              {
                label: "Nội dung CK",
                value: `TLD ${form.phone || "SĐT"}`,
                key: "note",
              },
            ].map((row, i) => (
              <div
                key={row.key}
                className="flex items-center justify-between px-4 py-3 text-sm"
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
                      color: row.key === "amount" ? "#cc323f" : "#0f172a",
                      fontFamily: row.key === "acc" ? "monospace" : undefined,
                    }}
                  >
                    {row.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(row.value, row.key)}
                    className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-gray-100"
                    title="Sao chép"
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

          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-4">
            <Clock className="w-3.5 h-3.5" />
            Đơn hàng sẽ được xử lý trong 15–30 phút sau khi xác nhận thanh toán
            (8:00–21:00 mỗi ngày).
          </p>
        </div>
      )}
    </div>
  );

  // ─── Step 3: Review ───────────────────────────────────────────────────────────
  const renderStep3 = () => {
    const shippingMethod = SHIPPING_METHODS.find(
      (m) => m.id === selectedMethod,
    )!;
    const fullAddress = [
      form.address,
      form.ward,
      form.district,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");
    const paymentLabel =
      payment === "cod"
        ? "Thanh toán khi nhận hàng (COD)"
        : "Chuyển khoản ngân hàng";
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2
          className="flex items-center gap-2 mb-5"
          style={{
            fontFamily: "Lora, serif",
            color: "#0f172a",
            fontSize: "1.2rem",
          }}
        >
          <CheckCircle className="w-5 h-5" style={{ color: "#cc323f" }} />
          Xác nhận đơn hàng
        </h2>
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Giao đến
          </p>
          <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
            {form.name} — {form.phone}
          </p>
          <p className="text-gray-600 text-sm mt-0.5">{fullAddress}</p>
          {form.notes && (
            <p className="text-gray-400 text-xs mt-1 italic">"{form.notes}"</p>
          )}
        </div>
        <div
          className="rounded-xl p-4 mb-4 flex items-center gap-3"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ color: "#cc323f" }}>{shippingMethod.icon}</span>
          <div>
            <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
              {shippingMethod.label}
            </p>
            <p className="text-gray-500 text-xs">{shippingMethod.desc}</p>
          </div>
          <span
            className="ml-auto text-sm"
            style={{ color: "#cc323f", fontWeight: 600 }}
          >
            {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
          </span>
        </div>
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="flex items-center gap-3">
            {payment === "cod" ? (
              <Truck className="w-5 h-5 text-gray-500" />
            ) : (
              <Banknote className="w-5 h-5 text-gray-500" />
            )}
            <div className="flex-1">
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                {paymentLabel}
              </p>
              {payment === "bank" && (
                <p className="text-gray-500 text-xs mt-0.5">
                  VCB: 1234567890 — NGUYEN TAM LINH
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          className="mt-4 flex items-center gap-2 text-sm"
          style={{ color: "#64748b" }}
        >
          <Shield className="w-4 h-4 text-green-500" />
          <span>Đơn hàng được bảo vệ bởi chính sách đổi trả 7 ngày</span>
        </div>
      </div>
    );
  };

  // ─── Order Summary Sidebar ───────────────────────────────────────────────────
  const OrderSummary = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
      <h2
        style={{
          fontFamily: "Lora, serif",
          color: "#0f172a",
          fontSize: "1.1rem",
          marginBottom: "1rem",
        }}
      >
        Tóm tắt đơn hàng
      </h2>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm truncate">{item.name}</p>
              <p className="text-gray-400 text-xs">x{item.quantity}</p>
            </div>
            <span
              className="text-sm flex-shrink-0"
              style={{ color: "#cc323f", fontWeight: 600 }}
            >
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
          </span>
          <span style={{ fontWeight: 600 }}>{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí vận chuyển</span>
          <span style={{ fontWeight: 600 }}>
            {!form.province ? (
              <span className="text-gray-400">Chọn địa chỉ</span>
            ) : shippingFee === 0 ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        {couponInfo ? (
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-700 text-sm font-medium">
                {couponInfo.code}
              </span>
              <button
                onClick={() => {
                  setCouponInfo(null);
                  setCouponCode("");
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
            <span className="text-green-700 text-sm font-semibold">
              -{formatCurrency(discountVnd)}
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Mã giảm giá"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-200"
              onKeyDown={(e) => e.key === "Enter" && handleLookupCoupon()}
            />
            <button
              onClick={handleLookupCoupon}
              disabled={couponLoading}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-60"
              style={{ background: "#cc323f" }}
            >
              {couponLoading ? "..." : "Áp dụng"}
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-xs text-red-500 mt-1">{couponError}</p>
        )}
      </div>

      <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between">
        <span style={{ fontWeight: 700, color: "#0f172a" }}>Tổng cộng</span>
        <span
          style={{
            fontWeight: 700,
            color: "#cc323f",
            fontSize: "1.2rem",
          }}
        >
          {formatCurrency(grandTotal)}
        </span>
      </div>
      {step < 3 ? (
        <button
          onClick={goNext}
          className="w-full text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-5"
          style={{
            backgroundColor: "#cc323f",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ab2534";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#cc323f";
          }}
        >
          Tiếp tục <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-5 disabled:opacity-60"
          style={{
            backgroundColor: "#cc323f",
            fontWeight: 600,
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
                className="animate-spin w-4 h-4"
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
              </svg>{" "}
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" /> Xác nhận đặt hàng
            </>
          )}
        </button>
      )}
    </div>
  );

  // ─── Guest checkout UI ────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc]"
      >
        {/* Overlays */}
        {successOverlay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(15,23,42,0.72)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              className="bg-white rounded-3xl px-10 py-12 flex flex-col items-center text-center max-w-sm w-full mx-4"
              style={{
                animation:
                  "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
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
                  fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                }}
                className="mb-1"
              >
                Đặt Hàng Thành Công!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Cảm ơn bạn đã tin tưởng Tâm Linh Đường 🙏
              </p>
              <div
                className="w-full rounded-2xl px-5 py-4 mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, #3a0e16 0%, #cc323f 100%)",
                }}
              >
                <p className="text-white/60 text-xs mb-1.5">
                  Mã đơn hàng của bạn
                </p>
                <p
                  className="text-white"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "clamp(1rem, 2.8vw, 1.6rem)",
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
              <style>{`
                @keyframes successPop { 0%{opacity:0;transform:scale(.72) translateY(24px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes pingOnce { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(2.2)} }
                @keyframes drawCheck { to{stroke-dashoffset:0} }
              `}</style>
            </div>
          </div>
        )}
        {loading && !successOverlay && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(15,23,42,0.45)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-3 shadow-2xl">
              <svg
                className="animate-spin w-10 h-10"
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
              <p style={{ fontWeight: 600, color: "#0f172a" }}>
                Đang xử lý đơn hàng…
              </p>
              <p className="text-gray-400 text-xs">Vui lòng không tắt trang</p>
            </div>
          </div>
        )}

        <div className="py-10" style={{ backgroundColor: "#902131" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Thanh Toán Nhanh
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Login prompt */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  backgroundColor: "#fef9ec",
                  border: "1px solid rgba(230,187,12,0.35)",
                }}
              >
                <span className="text-xl">🔔</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm"
                    style={{
                      color: "#92650a",
                      fontWeight: 600,
                    }}
                  >
                    Bạn chưa đăng nhập
                  </p>
                  <p className="text-xs text-yellow-700/70 mt-0.5">
                    Đăng nhập để theo dõi đơn hàng, tích điểm và thanh toán
                    nhanh hơn.
                  </p>
                </div>
                <Link
                  to="/login?redirect=/checkout"
                  className="flex-shrink-0 text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: "#e6bb0c",
                    color: "#3a2800",
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập
                </Link>
              </div>

              {/* Info fields */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2
                  className="flex items-center gap-2 mb-5"
                  style={{
                    fontFamily: "Lora, serif",
                    color: "#0f172a",
                    fontSize: "1.2rem",
                  }}
                >
                  <User className="w-5 h-5" style={{ color: "#cc323f" }} />
                  Thông tin nhận hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      className="block text-sm text-gray-700 mb-1.5"
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
                        value={guestForm.name}
                        onChange={(e) => {
                          setGuestForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }));
                          setGuestErrors((p) => {
                            const n = { ...p };
                            delete n.name;
                            return n;
                          });
                        }}
                        placeholder="Nguyễn Văn A"
                        className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none bg-gray-50 transition-all"
                        style={{
                          borderColor: guestErrors.name ? "#fca5a5" : "#e2e8f0",
                        }}
                        {...gfFocus("name")}
                      />
                    </div>
                    {guestErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {guestErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm text-gray-700 mb-1.5"
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
                        value={guestForm.email}
                        onChange={(e) => {
                          setGuestForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }));
                          setGuestErrors((p) => {
                            const n = { ...p };
                            delete n.email;
                            return n;
                          });
                        }}
                        placeholder="example@email.com"
                        className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none bg-gray-50 transition-all"
                        style={{
                          borderColor: guestErrors.email
                            ? "#fca5a5"
                            : "#e2e8f0",
                        }}
                        {...gfFocus("email")}
                      />
                    </div>
                    {guestErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {guestErrors.email}
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Phone
                          className="w-4 h-4"
                          style={{ color: "#cc323f" }}
                        />
                      </span>
                      <input
                        type="tel"
                        value={guestForm.phone}
                        onChange={(e) => {
                          setGuestForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }));
                          setGuestErrors((p) => {
                            const n = { ...p };
                            delete n.phone;
                            return n;
                          });
                        }}
                        placeholder="0912 345 678"
                        className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none bg-gray-50 transition-all"
                        style={{
                          borderColor: guestErrors.phone
                            ? "#fca5a5"
                            : "#e2e8f0",
                        }}
                        {...gfFocus("phone")}
                      />
                    </div>
                    {guestErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {guestErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      className="block text-sm text-gray-700 mb-1.5"
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
                        value={guestForm.address}
                        onChange={(e) => {
                          setGuestForm((p) => ({
                            ...p,
                            address: e.target.value,
                          }));
                          setGuestErrors((p) => {
                            const n = { ...p };
                            delete n.address;
                            return n;
                          });
                        }}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none bg-gray-50 transition-all"
                        style={{
                          borderColor: guestErrors.address
                            ? "#fca5a5"
                            : "#e2e8f0",
                        }}
                        {...gfFocus("address")}
                      />
                    </div>
                    {guestErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {guestErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2
                  className="flex items-center gap-2 mb-5"
                  style={{
                    fontFamily: "Lora, serif",
                    color: "#0f172a",
                    fontSize: "1.2rem",
                  }}
                >
                  <Truck className="w-5 h-5" style={{ color: "#cc323f" }} />
                  Phương thức vận chuyển
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "standard" as const,
                      label: "Tiêu chuẩn",
                      time: "3–4 tiếng",
                      fee: 30000,
                      icon: <Package className="w-5 h-5" />,
                    },
                    {
                      id: "sameday" as const,
                      label: "Hỏa tốc",
                      time: "1–2 tiếng",
                      fee: 45000,
                      icon: <Clock className="w-5 h-5" />,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGuestShippingMethod(opt.id)}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor:
                          guestShippingMethod === opt.id
                            ? "#cc323f"
                            : "#e2e8f0",
                        backgroundColor:
                          guestShippingMethod === opt.id ? "#fdf4f3" : "white",
                      }}
                    >
                      <span
                        className={
                          guestShippingMethod === opt.id
                            ? "text-[#cc323f]"
                            : "text-gray-400"
                        }
                      >
                        {opt.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{
                            fontWeight: 600,
                            color:
                              guestShippingMethod === opt.id
                                ? "#cc323f"
                                : "#0f172a",
                          }}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {opt.time}
                        </p>
                      </div>
                      <div className="flex flex-col items-end mr-2">
                        <p
                          className="text-sm"
                          style={{
                            fontWeight: 700,
                            color: "#cc323f",
                          }}
                        >
                          {formatCurrency(opt.fee)}
                        </p>
                      </div>
                      <div
                        className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor:
                            guestShippingMethod === opt.id
                              ? "#cc323f"
                              : "#cbd5e1",
                        }}
                      >
                        {guestShippingMethod === opt.id && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: "#cc323f",
                            }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2
                  className="flex items-center gap-2 mb-5"
                  style={{
                    fontFamily: "Lora, serif",
                    color: "#0f172a",
                    fontSize: "1.2rem",
                  }}
                >
                  <Lock className="w-5 h-5" style={{ color: "#cc323f" }} />
                  Phương thức thanh toán
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5 text-green-500" /> Bảo mật
                    SSL
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-5">
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
                        desc: "QR / tài khoản ngân hàng",
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
                      onClick={() => setGuestPayment(opt.id)}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor:
                          guestPayment === opt.id ? "#cc323f" : "#e2e8f0",
                        backgroundColor:
                          guestPayment === opt.id ? "#fdf4f3" : "white",
                      }}
                    >
                      <span
                        className={
                          guestPayment === opt.id
                            ? "text-[#cc323f]"
                            : "text-gray-400"
                        }
                      >
                        {opt.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{
                            fontWeight: 600,
                            color:
                              guestPayment === opt.id ? "#cc323f" : "#0f172a",
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
                          borderColor:
                            guestPayment === opt.id ? "#cc323f" : "#cbd5e1",
                        }}
                      >
                        {guestPayment === opt.id && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: "#cc323f",
                            }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {guestPayment === "cod" && (
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
                        Tổng thanh toán
                      </span>
                      <span
                        style={{
                          color: "#cc323f",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatCurrency(guestTotal)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600/80 mt-2 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Kiểm tra hàng trước khi thanh toán.
                    </p>
                  </div>
                )}

                {guestPayment === "bank" && (
                  <div className="space-y-4">
                    <VietQR
                      amount={guestTotal}
                      info={`TLD ${guestForm.phone || "THANH TOAN"}`}
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
                          key: "gb",
                        },
                        {
                          label: "Số tài khoản",
                          value: "1234567890",
                          key: "ga",
                        },
                        {
                          label: "Chủ tài khoản",
                          value: "Goc An Nhien",
                          key: "go",
                        },
                        {
                          label: "Số tiền",
                          value: formatCurrency(guestTotal),
                          key: "gam",
                        },
                        {
                          label: "Nội dung CK",
                          value: `TLD ${guestForm.phone || "SĐT"}`,
                          key: "gn",
                        },
                      ].map((row, i) => (
                        <div
                          key={row.key}
                          className="flex items-center justify-between px-4 py-3 text-sm"
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
                                color:
                                  row.key === "gam" ? "#cc323f" : "#0f172a",
                                fontFamily:
                                  row.key === "ga" ? "monospace" : undefined,
                              }}
                            >
                              {row.value}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(row.value, row.key)
                              }
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
                      <Clock className="w-3.5 h-3.5" />
                      Đơn hàng được xử lý trong 15–30 phút sau khi xác nhận
                      thanh toán.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleGuestSubmit}
                disabled={loading}
                className="w-full text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  backgroundColor: "#cc323f",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(204,50,63,0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#ab2534";
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
                    </svg>{" "}
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Đặt hàng ngay
                  </>
                )}
              </button>
            </div>

            {/* Right: summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
                <h2
                  style={{
                    fontFamily: "Lora, serif",
                    color: "#0f172a",
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                  }}
                >
                  Tóm tắt đơn hàng
                </h2>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          x{item.quantity}
                        </p>
                      </div>
                      <span
                        className="text-sm flex-shrink-0"
                        style={{
                          color: "#cc323f",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sp)
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span style={{ fontWeight: 600 }}>
                      {guestTotal === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatCurrency(GUEST_SHIPPING)
                      )}
                    </span>
                  </div>
                  {totalPrice < 500000 && (
                    <p className="text-xs text-gray-400">
                      Mua thêm{" "}
                      <span
                        style={{
                          color: "#cc323f",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(500000 - totalPrice)}
                      </span>{" "}
                      để nhận freeship
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between">
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Tổng cộng
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#cc323f",
                      fontSize: "1.2rem",
                    }}
                  >
                    {formatCurrency(guestTotal)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span>Bảo vệ bởi chính sách đổi trả 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stepper step={step} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Mobile nav */}
            <div className="flex gap-3 mt-5 lg:hidden">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="flex-1 py-3.5 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: "#cc323f",
                    color: "#cc323f",
                    fontWeight: 600,
                  }}
                >
                  ← Quay lại
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={goNext}
                  className="flex-1 text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#cc323f",
                    fontWeight: 600,
                  }}
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    backgroundColor: "#cc323f",
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Đặt hàng
                    </>
                  )}
                </button>
              )}
            </div>
            {step > 0 && (
              <button
                onClick={goBack}
                className="mt-4 text-sm hidden lg:flex items-center gap-1.5 transition-colors"
                style={{ color: "#cc323f" }}
              >
                ← Quay lại
              </button>
            )}
          </div>
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
