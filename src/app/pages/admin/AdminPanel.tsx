import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Tag,
  Package,
  Boxes,
  ShoppingCart,
  Calendar,
  FolderTree,
  FileText,
  BarChart2,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { getAccessToken, getUserRole } from "@/shared/api/axiosClient";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminCombo from "./AdminCombo";
import AdminInventory from "./AdminInventory";
import AdminCMS from "./AdminCMS";
import AdminCoupons from "./AdminCoupons";
import AdminOrders from "./AdminOrders";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | "dashboard"
  | "products"
  | "categories"
  | "combos"
  | "inventory"
  | "cms"
  | "coupons"
  | "orders";

const NAV_ITEMS: { key: Section; icon: React.ElementType; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "products", icon: Package, label: "Sản phẩm" },
  { key: "categories", icon: FolderTree, label: "Danh mục" },
  { key: "combos", icon: Package, label: "Combo" },
  { key: "inventory", icon: Boxes, label: "Kho hàng" },
  { key: "cms", icon: FileText, label: "Nội dung (CMS)" },
  { key: "coupons", icon: Tag, label: "Mã giảm giá" },
  { key: "orders", icon: ShoppingCart, label: "Đơn hàng" },

];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Dashboard",
  products: "Quản lý Sản phẩm",
  categories: "Danh mục sản phẩm",
  combos: "Quản lý Combo",
  inventory: "Quản lý Kho hàng",
  cms: "Quản lý Nội dung",
  coupons: "Mã giảm giá",
  orders: "Quản lý đơn hàng",
  };

// ─── Admin Layout ─────────────────────────────────────────────────────────────
function AdminLayout({
  activeSection,
  setActiveSection,
}: {
  activeSection: Section;
  setActiveSection: (s: Section) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login?redirect=/admin");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(230,187,12,0.2)" }}
        >
          🕯️
        </div>
        <div>
          <p
            className="text-white font-semibold text-sm leading-tight"
            style={{ fontFamily: "Lora, serif" }}
          >
            Spiritech
          </p>
          <p
            className="text-white/50 text-xs"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all relative text-left"
              style={{
                fontFamily: "Be Vietnam Pro, sans-serif",
                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                background: isActive ? "rgba(204,50,63,0.7)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: "#e6bb0c" }}
                />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{
            fontFamily: "Be Vietnam Pro, sans-serif",
            color: "rgba(255,255,255,0.65)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
        <a
          href="/"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all mt-0.5"
          style={{
            fontFamily: "Be Vietnam Pro, sans-serif",
            color: "rgba(255,255,255,0.45)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronRight size={16} className="flex-shrink-0 rotate-180" />
          <span>Về website</span>
        </a>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "#f0ede8",
        fontFamily: "Be Vietnam Pro, sans-serif",
      }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 h-full"
        style={{
          background: "linear-gradient(180deg, #3a0e16 0%, #200a0e 100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative z-50 flex flex-col w-64 h-full shadow-2xl"
            style={{
              background: "linear-gradient(180deg, #3a0e16 0%, #200a0e 100%)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                {SECTION_TITLES[activeSection]}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Spiritech Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-800 font-medium">Quản trị viên</p>
              <p className="text-xs text-gray-400">Spiritech</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #cc323f, #902131)",
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeSection === "dashboard" && <AdminDashboard />}
          {activeSection === "products" && <AdminProducts />}
          {activeSection === "categories" && <AdminCategories />}
          {activeSection === "combos" && <AdminCombo />}
          {activeSection === "inventory" && <AdminInventory />}
          {activeSection === "cms" && <AdminCMS />}
          {activeSection === "coupons" && <AdminCoupons />}
          {activeSection === "orders" && <AdminOrders />}
        </main>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
// Checks auth via HTTP cookies (set by main login flow).
// Redirects to /login if not authenticated as admin/staff.
export default function AdminPanel() {
  const [authorized, setAuthorized] = useState<
    "loading" | "granted" | "denied"
  >("loading");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  useEffect(() => {
    const token = getAccessToken();
    const role = getUserRole();

    if (token && (role === "admin" || role === "staff")) {
      setAuthorized("granted");
    } else {
      setAuthorized("denied");
    }
  }, []);

  if (authorized === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f0ede8" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Đang xác thực...
          </p>
        </div>
      </div>
    );
  }

  if (authorized === "denied") {
    // Redirect to main login page with return URL
    window.location.href = "/login?redirect=/admin";
    return null;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    />
  );
}
