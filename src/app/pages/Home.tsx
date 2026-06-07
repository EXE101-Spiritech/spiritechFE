import { Link } from "react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "../data";
import { comboApi } from "@/features/combos/api";

const HERO_IMG =
  "https://images.unsplash.com/photo-1656911051207-f36a904da6d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-[#e6bb0c] text-[#e6bb0c]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [apiCombos, setApiCombos] = useState<any[] | null>(null);

  useEffect(() => {
    comboApi
      .list({ page: 1, size: 3 })
      .then((r) => setApiCombos(r.data))
      .catch(() => {});
  }, []);

  const mappedApiCombos = apiCombos
    ? apiCombos.map((c) => ({
        id: c.slug,
        name: c.name,
        price: c.base_price_vnd || 0,
        originalPrice: c.combo_original_price_vnd || undefined,
        image: c.images?.[0] || "",
        images: c.images || [],
        description: c.description || "",
        items: [],
        occasion: "",
        rating: 4.5,
        reviews: 0,
        badge: apiCombos.length > 0 ? "Tiết kiệm" : undefined,
        inStock: c.status === "active",
        usageGuide: "",
      }))
    : null;
  const displayCombos = mappedApiCombos || [];
  const featuredCombos = displayCombos.slice(0, 3);

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      {/* Hero */}
      <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(58,14,22,0.92) 0%, rgba(144,33,49,0.72) 60%, transparent 100%)",
          }}
        />
        <div className="relative z-10 max-w-7xl w-full pl-6 sm:pl-10 lg:pl-20 pr-6 py-20">
          <div className="max-w-2xl">
            <h1
              className="text-white mb-4"
              style={{
                fontFamily: "Lora, serif",
                fontSize: "clamp(1.6rem, 6vw, 2.8rem)",
                lineHeight: 1.25,
                fontWeight: 700,
              }}
            >
              Đồ Cúng <br />
              <span style={{ color: "#e6bb0c" }}>Chất Lượng Cao</span>
            </h1>

            <div
              className="mb-8 space-y-2"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <p className="text-base sm:text-lg leading-relaxed pl-[0px] pr-[14px] py-[0px]">
                Cung cấp mâm cúng, combo lễ vật đầy đủ theo phong tục truyền
                thống Việt Nam.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Đặt hàng dễ dàng — giao tận nơi.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/combo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
                style={{
                  backgroundColor: "#e6bb0c",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#bb8907")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e6bb0c")
                }
              >
                Xem Combo Ngay <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
              >
                Sản Phẩm Lẻ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-6" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Truck,
                label: "Giao hàng nhanh",
                sub: "Giao hàng nội thành",
              },
              {
                icon: ShieldCheck,
                label: "Cam kết chất lượng",
                sub: "100% hàng chính hãng",
              },
              {
                icon: HeartHandshake,
                label: "Tư vấn miễn phí",
                sub: "Trợ lý An Tâm luôn sẵn sàng hỗ trợ",
              },
              {
                icon: Clock,
                label: "Đặt hàng dễ dàng",
                sub: "Xem - Chọn - Thanh toán",
              },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 py-2">
                <b.icon
                  className="w-8 h-8 flex-shrink-0"
                  style={{ color: "#e6bb0c" }}
                />
                <div>
                  <p className="text-white text-sm" style={{ fontWeight: 600 }}>
                    {b.label}
                  </p>
                  <p className="text-white/60 text-xs">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Combos */}
      <section className="py-16" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-1"
                style={{ color: "#cc323f", fontWeight: 600 }}
              >
                Combo nổi bật
              </p>
              <h2
                style={{
                  fontFamily: "Lora, serif",
                  color: "#0f172a",
                  fontSize: "1.8rem",
                }}
              >
                Mâm Cúng Trọn Bộ
              </h2>
            </div>
            <Link
              to="/combo"
              className="group flex items-center gap-1 text-sm font-medium transition-all duration-200 hover:text-[#ab2534] hover:underline underline-offset-2"
              style={{ color: "#cc323f" }}
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredCombos.map((combo) => (
              <Link
                key={combo.id}
                to={`/combo/${combo.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden h-52">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {combo.badge && (
                    <span
                      className="absolute top-3 left-3 text-white text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "#cc323f",
                        fontWeight: 600,
                      }}
                    >
                      {combo.badge}
                    </span>
                  )}
                  {combo.originalPrice && (
                    <span
                      className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: "#e6bb0c",
                        color: "#0f172a",
                        fontWeight: 700,
                      }}
                    >
                      -
                      {Math.round(
                        (1 - combo.price / combo.originalPrice) * 100,
                      )}
                      %
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "rgba(204,50,63,0.6)" }}
                  >
                    {combo.occasion}
                  </p>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "Lora, serif",
                      color: "#0f172a",
                      fontSize: "1rem",
                    }}
                  >
                    {combo.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={combo.rating} />
                    <span className="text-xs text-gray-500">
                      ({combo.reviews})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div>
                      <span
                        className="text-lg"
                        style={{
                          color: "#cc323f",
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(combo.price)}
                      </span>
                      {combo.originalPrice && (
                        <span className="text-gray-400 text-sm line-through ml-2">
                          {formatCurrency(combo.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-1"
              style={{ color: "#cc323f", fontWeight: 600 }}
            >
              Quy trình
            </p>
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "1.8rem",
              }}
            >
              Đặt Hàng Đơn Giản
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div
              className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5"
              style={{
                backgroundColor: "rgba(230,187,12,0.5)",
              }}
            />
            {[
              {
                step: 1,
                title: "Chọn Sản Phẩm",
                desc: "Duyệt qua các combo và sản phẩm lẻ. Đọc hướng dẫn để chọn đúng lễ vật phù hợp.",
                emoji: "🛍️",
              },
              {
                step: 2,
                title: "Đặt Hàng Online",
                desc: "Thêm vào giỏ hàng và thanh toán dễ dàng qua COD hoặc chuyển khoản ngân hàng.",
                emoji: "💳",
              },
              {
                step: 3,
                title: "Nhận Hàng Tại Nhà",
                desc: "Chúng tôi giao hàng cẩn thận, đúng hẹn.",
                emoji: "🏠",
              },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl relative z-10"
                  style={{ backgroundColor: "#fdf4f3" }}
                >
                  {s.emoji}
                  <span
                    className="absolute -top-1 -right-1 w-6 h-6 text-white text-xs rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "#cc323f",
                      fontWeight: 700,
                    }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  style={{
                    color: "#0f172a",
                    fontFamily: "Lora, serif",
                  }}
                  className="mb-2"
                >
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
