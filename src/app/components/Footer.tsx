import { Link } from "react-router";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#3a0e16",
        fontFamily: "Be Vietnam Pro, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-3">
              <Logo height={48} />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              Cung cấp đồ cúng chất lượng cao, đúng phong tục truyền thống Việt
              Nam. Giao hàng tận nơi.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61590624020423"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center transition-colors hover:bg-[#e6bb0c]"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-3" style={{ fontWeight: 600 }}>
              Liên kết
            </h4>
            <ul className="space-y-1.5">
              {[
                { label: "Trang chủ", to: "/" },
                { label: "Combo cúng", to: "/combo" },
                { label: "Sản phẩm", to: "/products" },
                { label: "Hướng dẫn cúng", to: "/guide" },
                { label: "Giới thiệu", to: "/about" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 text-sm transition-colors hover:text-[#e6bb0c]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-3" style={{ fontWeight: 600 }}>
              Liên hệ
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: "#e6bb0c" }}
                />
                <span>687 Tô Ngọc Vân, Tam Bình, Thủ Đức</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Phone
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#e6bb0c" }}
                />
                <span>0800 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Mail
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#e6bb0c" }}
                />
                <span>luungocngangiang25@gmail.com</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p
                className="text-xs mb-1"
                style={{ color: "#e6bb0c", fontWeight: 600 }}
              >
                Giờ hoạt động
              </p>
              <p className="text-white/60 text-xs">
                Thứ 2 - Thứ 7: 8:00 - 20:00
              </p>
              <p className="text-white/60 text-xs">Chủ nhật: 9:00 - 18:00</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">© 2026 SpiriTech.</p>
          <div className="flex gap-4">
            <Link
              to="/privacy-policy"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <Link
              to="/terms-of-service"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              to="/return-policy"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
