import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Search, User, Menu, X, TrendingUp } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data";
import { Logo } from "./Logo";
import { AdminBadge } from "./AdminBadge";
import { productApi } from "@/features/products/api";
import { track } from "@/features/products/tracking/api";

const popularProducts: any[] = [];
const allItems: any[] = [];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const { totalItems } = useCart();
  const { isLoggedIn, user } = useAuth();
  const isAdmin =
    isLoggedIn && (user?.role === "admin" || user?.role === "staff");
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { label: "Trang chủ", to: "/" },
    { label: "Combo", to: "/combo" },
    { label: "Sản phẩm", to: "/products" },
    { label: "Thông Tin", to: "/guide" },
    { label: "Giới thiệu", to: "/about" },
  ];

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const searchResults = searchQuery.length > 1 ? apiResults : [];

  const showDropdown = searchFocused;
  const showPopular = searchFocused && searchQuery.length <= 1;
  const showResults = searchFocused && searchQuery.length > 1;

  const handleSelect = (item: any) => {
    const path = item.slug ? `/products/${item.slug}` : `/products/${item.id}`;
    navigate(path);
    setSearchQuery("");
    setSearchFocused(false);
    setMobileSearchQuery("");
    setMobileSearchOpen(false);
    inputRef.current?.blur();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Debounced search via API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setApiResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      productApi
        .search({ q: searchQuery, size: 6 })
        .then((r) => {
          setApiResults(r.data);
          track("search.performed", { query: searchQuery, results: r.total });
        })
        .catch(() => {});
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const mobileSearchResults = mobileSearchQuery.length > 1 ? apiResults : [];

  const showMobileDropdown = mobileSearchOpen;
  const showMobilePopular = mobileSearchOpen && mobileSearchQuery.length <= 1;
  const showMobileResults = mobileSearchOpen && mobileSearchQuery.length > 1;

  return (
    <>
      <nav
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: "#902131" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-[68px] gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo height={48} />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap"
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    fontWeight: isActive(link.to) ? 600 : 500,
                    color: isActive(link.to)
                      ? "#e6bb0c"
                      : "rgba(255,255,255,0.88)",
                  }}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ backgroundColor: "#e6bb0c" }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search Bar */}
            <div ref={searchRef} className="hidden md:block relative">
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all"
                style={{
                  backgroundColor: searchFocused
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.12)",
                  border: searchFocused
                    ? "1.5px solid rgba(230,187,12,0.7)"
                    : "1.5px solid rgba(255,255,255,0.2)",
                  width: searchFocused ? "240px" : "190px",
                  transition: "width 0.25s ease, border-color 0.2s",
                }}
              >
                <Search
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: searchFocused ? "#e6bb0c" : "rgba(255,255,255,0.7)",
                  }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="bg-transparent outline-none text-white placeholder:text-white/50 text-sm w-full"
                  style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchFocused(false);
                      setSearchQuery("");
                      inputRef.current?.blur();
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery("");
                    }}
                    className="flex-shrink-0 text-white/50 hover:text-white/90"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {showDropdown && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    width: "min(360px, calc(100vw - 32px))",
                    border: "1px solid #f1e5e5",
                  }}
                >
                  {/* Popular suggestions */}
                  {showPopular && (
                    <>
                      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                        <TrendingUp
                          className="w-4 h-4"
                          style={{ color: "#cc323f" }}
                        />
                        <span
                          className="text-xs uppercase tracking-wide"
                          style={{
                            color: "#cc323f",
                            fontWeight: 700,
                            fontFamily: "Be Vietnam Pro, sans-serif",
                          }}
                        >
                          Sản phẩm bán chạy
                        </span>
                      </div>
                      <div className="pb-2">
                        {popularProducts.map((item, idx) => (
                          <button
                            key={item.id}
                            onMouseDown={() =>
                              handleSelect({
                                ...item,
                                type: "product",
                                badge: item.badge,
                              })
                            }
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#fdf4f3] transition-colors text-left"
                          >
                            <span
                              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                              style={{
                                backgroundColor:
                                  idx < 3 ? "#cc323f" : "#f1f5f9",
                                color: idx < 3 ? "white" : "#64748b",
                                fontWeight: 700,
                                fontFamily: "Be Vietnam Pro, sans-serif",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm text-gray-800 truncate"
                                style={{
                                  fontFamily: "Be Vietnam Pro, sans-serif",
                                  fontWeight: 500,
                                }}
                              >
                                {item.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "#cc323f" }}
                              >
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            {item.badge && (
                              <span
                                className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: "#fdf4f3",
                                  color: "#cc323f",
                                  fontWeight: 600,
                                  fontFamily: "Be Vietnam Pro, sans-serif",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Search Results */}
                  {showResults && (
                    <div className="py-2">
                      {searchResults.length > 0 ? (
                        <>
                          <p
                            className="px-4 pb-1 text-xs uppercase tracking-wide"
                            style={{
                              color: "#94a3b8",
                              fontFamily: "Be Vietnam Pro, sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            Kết quả tìm kiếm
                          </p>
                          {searchResults.map((item) => (
                            <button
                              key={item.id}
                              onMouseDown={() => handleSelect(item)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#fdf4f3] transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm text-gray-800 truncate"
                                  style={{
                                    fontFamily: "Be Vietnam Pro, sans-serif",
                                    fontWeight: 500,
                                  }}
                                >
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor:
                                        item.type === "combo"
                                          ? "#fef9e7"
                                          : "#fdf4f3",
                                      color:
                                        item.type === "combo"
                                          ? "#92620a"
                                          : "#cc323f",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {item.type === "combo"
                                      ? "Combo"
                                      : "Sản phẩm"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-5 text-center">
                          <p
                            className="text-sm text-gray-400"
                            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
                          >
                            Không tìm thấy kết quả cho "{searchQuery}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Mobile search */}
              <button
                className="md:hidden text-white/90 hover:text-white p-2"
                onClick={() => {
                  setMobileSearchOpen((o) => !o);
                  setTimeout(() => mobileInputRef.current?.focus(), 80);
                }}
              >
                {mobileSearchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>

              <Link
                to="/cart"
                className="relative text-white/90 hover:text-white transition-colors p-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 text-xs w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "#e6bb0c",
                      color: "#902131",
                      fontWeight: 700,
                      fontSize: "10px",
                    }}
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              <Link
                to={isLoggedIn ? "/account" : "/login"}
                className="text-white/90 hover:text-white transition-colors p-2"
              >
                <User className="w-5 h-5" />
              </Link>

              {isAdmin && <AdminBadge />}

              <button
                className="lg:hidden text-white p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div
            ref={mobileSearchRef}
            className="md:hidden border-t border-white/10 relative"
            style={{ backgroundColor: "#7d1c2b" }}
          >
            <div className="px-4 py-3">
              <div
                className="flex items-center gap-2 rounded-full px-3 py-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(230,187,12,0.6)",
                }}
              >
                <Search
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#e6bb0c" }}
                />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Tìm sản phẩm, combo..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-white placeholder:text-white/50 text-sm w-full"
                  style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setMobileSearchOpen(false);
                      setMobileSearchQuery("");
                    }
                  }}
                />
                {mobileSearchQuery && (
                  <button
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setMobileSearchQuery("");
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMobileSearchQuery("");
                    }}
                    className="flex-shrink-0 text-white/50 hover:text-white/90 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Dropdown */}
            {showMobileDropdown && (
              <div
                className="mx-4 mb-3 bg-white rounded-xl shadow-2xl overflow-hidden"
                style={{ border: "1px solid #f1e5e5" }}
              >
                {/* Popular */}
                {showMobilePopular && (
                  <>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <TrendingUp
                        className="w-4 h-4"
                        style={{ color: "#cc323f" }}
                      />
                      <span
                        className="text-xs uppercase tracking-wide"
                        style={{
                          color: "#cc323f",
                          fontWeight: 700,
                          fontFamily: "Be Vietnam Pro, sans-serif",
                        }}
                      >
                        Sản phẩm bán chạy
                      </span>
                    </div>
                    <div className="pb-2">
                      {popularProducts.map((item, idx) => (
                        <button
                          key={item.id}
                          onTouchStart={() =>
                            handleSelect({
                              ...item,
                              type: "product",
                              badge: item.badge,
                            })
                          }
                          onMouseDown={() =>
                            handleSelect({
                              ...item,
                              type: "product",
                              badge: item.badge,
                            })
                          }
                          className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-[#fdf4f3] hover:bg-[#fdf4f3] transition-colors text-left"
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: idx < 3 ? "#cc323f" : "#f1f5f9",
                              color: idx < 3 ? "white" : "#64748b",
                              fontWeight: 700,
                              fontFamily: "Be Vietnam Pro, sans-serif",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm text-gray-800 truncate"
                              style={{
                                fontFamily: "Be Vietnam Pro, sans-serif",
                                fontWeight: 500,
                              }}
                            >
                              {item.name}
                            </p>
                            <p className="text-xs" style={{ color: "#cc323f" }}>
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          {item.badge && (
                            <span
                              className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#fdf4f3",
                                color: "#cc323f",
                                fontWeight: 600,
                                fontFamily: "Be Vietnam Pro, sans-serif",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Results */}
                {showMobileResults && (
                  <div className="py-2">
                    {mobileSearchResults.length > 0 ? (
                      <>
                        <p
                          className="px-4 pb-1 text-xs uppercase tracking-wide"
                          style={{
                            color: "#94a3b8",
                            fontFamily: "Be Vietnam Pro, sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          Kết quả tìm kiếm
                        </p>
                        {mobileSearchResults.map((item) => (
                          <button
                            key={item.id}
                            onTouchStart={() => handleSelect(item)}
                            onMouseDown={() => handleSelect(item)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-[#fdf4f3] hover:bg-[#fdf4f3] transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm text-gray-800 truncate"
                                style={{
                                  fontFamily: "Be Vietnam Pro, sans-serif",
                                  fontWeight: 500,
                                }}
                              >
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor:
                                      item.type === "combo"
                                        ? "#fef9e7"
                                        : "#fdf4f3",
                                    color:
                                      item.type === "combo"
                                        ? "#92620a"
                                        : "#cc323f",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.type === "combo" ? "Combo" : "Sản phẩm"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-5 text-center">
                        <p
                          className="text-sm text-gray-400"
                          style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
                        >
                          Không tìm thấy kết quả cho "{mobileSearchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu — slide-in from right */}
        {/* Backdrop */}
        <div
          className="lg:hidden fixed inset-0 z-40 transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(15,23,42,0.5)",
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
          }}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className="lg:hidden fixed top-0 right-0 z-50 h-full flex flex-col"
          style={{
            width: "72vw",
            maxWidth: "300px",
            background:
              "linear-gradient(160deg, #3a0e16 0%, #902131 60%, #cc323f 100%)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.35)",
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "Be Vietnam Pro, sans-serif",
          }}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
          >
            <span
              style={{
                fontFamily: "Lora, serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#e6bb0c",
                letterSpacing: "0.01em",
              }}
            >
              SpiriTech
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors relative"
                style={{
                  fontWeight: isActive(link.to) ? 700 : 500,
                  fontSize: "0.95rem",
                  color: isActive(link.to)
                    ? "#e6bb0c"
                    : "rgba(255,255,255,0.88)",
                  backgroundColor: isActive(link.to)
                    ? "rgba(0,0,0,0.2)"
                    : undefined,
                  borderLeft: isActive(link.to)
                    ? "3px solid #e6bb0c"
                    : "3px solid transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            {/* Lịch cúng — chỉ xuất hiện trên mobile drawer */}
            <Link
              to="/calendar"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors relative"
              style={{
                fontWeight: isActive("/calendar") ? 700 : 500,
                fontSize: "0.95rem",
                color: isActive("/calendar")
                  ? "#e6bb0c"
                  : "rgba(255,255,255,0.88)",
                backgroundColor: isActive("/calendar")
                  ? "rgba(0,0,0,0.2)"
                  : undefined,
                borderLeft: isActive("/calendar")
                  ? "3px solid #e6bb0c"
                  : "3px solid transparent",
              }}
            >
              Xem lịch cúng
            </Link>
          </nav>

          {/* Bottom shortcuts */}
          <div
            className="flex-shrink-0 px-5 py-4 flex items-center gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Giỏ hàng
              {totalItems > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "#e6bb0c",
                    color: "#902131",
                    fontWeight: 700,
                    fontSize: "10px",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            {isAdmin && (
              <AdminBadge mobile onNavigate={() => setMobileOpen(false)} />
            )}
            <Link
              to={isLoggedIn ? "/account" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors"
              style={{
                backgroundColor: "#e6bb0c",
                color: "#3a0e16",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              <User className="w-4 h-4" />
              {isLoggedIn ? "Tài khoản" : "Đăng nhập"}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
