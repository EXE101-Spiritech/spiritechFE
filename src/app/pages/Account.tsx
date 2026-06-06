import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { User, Package, LogOut, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "@/features/user/api";

export default function Account() {
  const { isLoggedIn, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userApi
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!isLoggedIn) return <Navigate to="/login?redirect=/account" replace />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async () => {
    try {
      const updated = await userApi.updateProfile(form);
      setProfile(updated);
      updateProfile(form);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const displayProfile = profile || { name: "—", phone: "—", email: "—" };

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#e6bb0c" }}
            >
              <span
                className="text-xl"
                style={{ color: "#902131", fontWeight: 700 }}
              >
                {displayProfile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "Lora, serif",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                {displayProfile.name}
              </h1>
              <p className="text-white/70 text-sm">{displayProfile.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveTab("profile")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors"
                style={{
                  fontWeight: 500,
                  borderLeft:
                    activeTab === "profile"
                      ? "3px solid #cc323f"
                      : "3px solid transparent",
                  backgroundColor:
                    activeTab === "profile" ? "#fdf4f3" : "transparent",
                  color: activeTab === "profile" ? "#cc323f" : "#475569",
                }}
              >
                <User className="w-4 h-4" /> Thông tin cá nhân
              </button>
              <Link
                to="/account/orders"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Package className="w-4 h-4" /> Đơn hàng của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center py-12">
                <span className="inline-block w-5 h-5 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    style={{
                      fontFamily: "Lora, serif",
                      color: "#0f172a",
                      fontSize: "1.3rem",
                    }}
                  >
                    Thông Tin Cá Nhân
                  </h2>
                  {!editing ? (
                    <button
                      onClick={() => {
                        setEditing(true);
                        setForm({
                          name: displayProfile.name || "",
                          phone: displayProfile.phone || "",
                          email: displayProfile.email || "",
                          address: displayProfile.address || "",
                        });
                      }}
                      className="flex items-center gap-1.5 text-sm hover:underline"
                      style={{ color: "#cc323f" }}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700"
                      >
                        <X className="w-3.5 h-3.5" /> Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 text-sm hover:underline"
                        style={{ color: "#cc323f", fontWeight: 600 }}
                      >
                        <Save className="w-3.5 h-3.5" /> Lưu
                      </button>
                    </div>
                  )}
                </div>

                {saved && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">
                    Cập nhật thông tin thành công!
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      label: "Họ và tên",
                      key: "name",
                      type: "text",
                      placeholder: "Nguyễn Văn A",
                    },
                    {
                      label: "Số điện thoại",
                      key: "phone",
                      type: "tel",
                      placeholder: "0912 345 678",
                    },
                    {
                      label: "Email",
                      key: "email",
                      type: "email",
                      placeholder: "email@example.com",
                    },
                    {
                      label: "Địa chỉ",
                      key: "address",
                      type: "text",
                      placeholder: "Số nhà, đường, quận...",
                    },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className={field.key === "email" || field.key === "address" ? "sm:col-span-2" : ""}
                    >
                      <label
                        className="block text-sm text-gray-600 mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        {field.label}
                      </label>
                      {editing ? (
                        <input
                          type={field.type}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
                          onFocus={(e) => {
                            e.target.style.borderColor = "#cc323f";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(204,50,63,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e2e8f0";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      ) : (
                        <div className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-gray-800">
                          {displayProfile[field.key] || "—"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!editing && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Link
                      to="/account/orders"
                      className="inline-flex items-center gap-2 text-sm hover:underline"
                      style={{ color: "#cc323f" }}
                    >
                      <Package className="w-4 h-4" /> Xem lịch sử đơn hàng →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
