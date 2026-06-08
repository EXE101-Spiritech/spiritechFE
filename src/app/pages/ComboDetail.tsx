import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { formatCurrency } from "../data";
import { comboApi } from "@/features/combos/api";
import { useCart } from "../context/CartContext";
import { QuickCheckoutModal } from "../components/QuickCheckoutModal";
import { track } from "@/features/products/tracking/api";
export default function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiCombo, setApiCombo] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      comboApi
        .get(id)
        .then((c) => {
          setApiCombo(c);
          track("combo.viewed", { slug: id, product_id: c.id, name: c.name });
        })
        .catch(() => {});
    }
  }, [id]);

  // Map API product to UI expected shape
  const combo = apiCombo
    ? {
        ...apiCombo,
        id: apiCombo.slug,
        price: apiCombo.base_price_vnd,
        originalPrice: apiCombo.combo_original_price_vnd,
        image: apiCombo.images?.[0] || "",
        images: apiCombo.images || [],
        items: [],
        occasion: "",
        rating: 4.5,
        reviews: 0,
        badge: apiCombo.is_combo ? "Tiết kiệm" : undefined,
        inStock: apiCombo.quantity > 0,
        lowStock: apiCombo.quantity > 0 && apiCombo.quantity < 5,
        usageGuide: "",
      }
    : undefined;
  if (!combo) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      >
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy combo</p>
        <Link to="/combo" className="underline" style={{ color: "#cc323f" }}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(
      {
        id: combo.id,
        variantId: apiCombo?.id,
        type: "combo",
        name: combo.name,
        price: combo.price,
        image: combo.image,
      },
      qty,
    );
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:underline"
            style={{ color: "#cc323f", fontWeight: 500 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className="text-gray-300">|</span>
          <div className="flex items-center">
            <Link to="/" className="hover:text-[#cc323f]">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link to="/combo" className="hover:text-[#cc323f]">
              Combo
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "#0f172a" }}>{combo.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm mb-3 h-80 lg:h-96">
              <img
                src={combo.images?.[activeImg] || combo.image || ""}
                alt={combo.name}
                className="w-full h-full object-cover"
              />
              {combo.badge && (
                <span
                  className="absolute top-4 left-4 text-white text-sm px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
                >
                  {combo.badge}
                </span>
              )}
              {combo.originalPrice && (
                <span
                  className="absolute top-4 right-4 text-sm px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "#e6bb0c",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  -{Math.round((1 - combo.price / combo.originalPrice) * 100)}%
                </span>
              )}
              {combo.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(Math.max(0, activeImg - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                    disabled={activeImg === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImg(
                        Math.min(combo.images.length - 1, activeImg + 1),
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                    disabled={combo.images.length - 1 === activeImg}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {combo.images.length > 1 && (
              <div className="flex gap-2">
                {combo.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: activeImg === i ? "#cc323f" : "transparent",
                    }}
                  >
                    <img
                      src={img || ""}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: "#fdf4f3", color: "#cc323f" }}
              >
                {combo.occasion}
              </span>
              {combo.inStock ? (
                combo.lowStock ? (
                  <span className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    🔥 Sắp hết hàng
                  </span>
                ) : (
                  <span className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                    Còn hàng
                  </span>
                )
              ) : (
                <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full">
                  Hết hàng
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "clamp(1.1rem, 2.8vw, 1.6rem)",
                lineHeight: 1.3,
              }}
              className="mb-3"
            >
              {combo.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(combo.rating) ? "fill-[#e6bb0c] text-[#e6bb0c]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm">
                {combo.rating}/5 ({combo.reviews} đánh giá)
              </span>
            </div>

            <div className="mb-4">
              <span
                className="text-3xl"
                style={{ color: "#cc323f", fontWeight: 700 }}
              >
                {formatCurrency(combo.price)}
              </span>
              {combo.originalPrice && (
                <>
                  <span className="text-gray-400 text-lg line-through ml-3">
                    {formatCurrency(combo.originalPrice)}
                  </span>
                  <span
                    className="ml-2 text-sm px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: "#e6bb0c",
                      color: "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    -{Math.round((1 - combo.price / combo.originalPrice) * 100)}
                    %
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-5">
              {combo.description}
            </p>

            {/* Items included */}
            <div className="bg-white rounded-xl p-4 mb-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Package
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#cc323f" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "#0f172a", fontWeight: 600 }}
                >
                  Bao gồm trong combo:
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-1.5">
                {combo.items
                  .filter(
                    (item: any) =>
                      ![
                        "Muối gạo",
                        "Trái cây",
                        "Hoa cúng tươi",
                        "Rượu cúng",
                      ].some((exclude) =>
                        item.toLowerCase().includes(exclude.toLowerCase()),
                      ),
                  )
                  .map((item: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span
                className="text-sm text-gray-700"
                style={{ fontWeight: 500 }}
              >
                Số lượng:
              </span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 text-gray-500 hover:bg-gray-50 text-lg"
                >
                  −
                </button>
                <span
                  className="w-12 text-center text-gray-800"
                  style={{ fontWeight: 600 }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 text-gray-500 hover:bg-gray-50 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {addedMsg && (
              <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Đã thêm vào giỏ hàng!
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!combo.inStock}
              className="w-full flex items-center justify-center gap-2 border-2 py-3 rounded-xl transition-colors disabled:opacity-40"
              style={{ borderColor: "#cc323f", color: "#cc323f" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fdf4f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ
            </button>
          </div>
        </div>

        {/* Usage guide */}
        <div
          className="mt-10 bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: "1px solid rgba(230,187,12,0.2)" }}
        >
          <h3
            style={{
              fontFamily: "Lora, serif",
              color: "#0f172a",
              fontSize: "1.2rem",
            }}
            className="mb-3"
          >
            📖 Hướng dẫn sử dụng
          </h3>
          <p className="text-gray-600 leading-relaxed">{combo.usageGuide}</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/guide"
              className="text-sm hover:underline"
              style={{ color: "#cc323f" }}
            >
              → Xem thêm hướng dẫn cúng bái
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Checkout Modal */}
      {showModal && (
        <QuickCheckoutModal
          item={{
            id: combo.id,
            type: "combo",
            name: combo.name,
            price: combo.price,
            image: combo.image,
          }}
          qty={qty}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
