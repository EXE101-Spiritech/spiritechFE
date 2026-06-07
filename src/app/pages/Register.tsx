import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoSvg from "../../imports/logo-only-primary.svg";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)";
    if (!form.email.trim() || !form.email.includes("@"))
      e.email = "Email không hợp lệ";
    if (!form.password || form.password.length < 6)
      e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!agreed) e.agreed = "Vui lòng đồng ý với các điều khoản";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.phone, form.password);
      navigate(redirect);
    } catch {
      setErrors({ form: "Đăng ký thất bại. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 outline-none transition-all bg-gray-50 ${errors[field] ? "border-red-300" : "border-gray-200"}`;

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#902131" }}
          >
            <img src={logoSvg} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "#0f172a",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
          >
            Tạo Tài Khoản
          </h1>
          <p className="text-gray-500 mt-1">Đăng ký để mua sắm dễ dàng hơn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
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
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            {/* Phone */}
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
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label
                className="block text-sm text-gray-700 mb-1.5"
                style={{ fontWeight: 500 }}
              >
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="example@email.com"
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            {/* Password */}
            <div>
              <label
                className="block text-sm text-gray-700 mb-1.5"
                style={{ fontWeight: 500 }}
              >
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`${inputClass("password")} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            {/* Agreement checkbox */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (errors.agreed) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.agreed;
                        return n;
                      });
                    }
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#cc323f] focus:ring-[#cc323f]"
                />
                <span className="text-sm text-gray-500 leading-relaxed">
                  Tôi đã đọc và đồng ý với{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "#cc323f", fontWeight: 600 }}
                  >
                    Chính sách bảo mật
                  </a>
                  {", "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "#cc323f", fontWeight: 600 }}
                  >
                    Điều khoản dịch vụ
                  </a>
                  {" và "}
                  <a
                    href="/return-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "#cc323f", fontWeight: 600 }}
                  >
                    Chính sách đổi trả
                  </a>
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-60"
              style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#ab2534";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#cc323f";
              }}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng Ký"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to={`/login${redirect !== "/account" ? `?redirect=${redirect}` : ""}`}
                className="hover:underline"
                style={{ color: "#cc323f", fontWeight: 600 }}
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
