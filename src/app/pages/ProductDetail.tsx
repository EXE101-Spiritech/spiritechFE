import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { products, formatCurrency } from "../data";
import { productApi } from "@/features/products/api";
import { useCart } from "../context/CartContext";
import { QuickCheckoutModal } from "../components/QuickCheckoutModal";
import nhangImage from "figma:asset/b2c37b674ec7f7c6335108a122aa3526e2a6cfe3.png";
import denLyImage from "figma:asset/42798c95181dc052ceac12cdaa0a58f3d4c1406f.png";
import luHuongImage from "figma:asset/23ed9670385e74f09addd804528ecb4bee074c94.png";
import denCayLonImage from "figma:asset/df97bc4cd293cebf88ba1d247ecb017492bcdad0.png";
import denCayNhoImage from "figma:asset/eb2fc9a0a51e17243df477cea736c858af36d4da.png";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiProduct, setApiProduct] = useState<any | null>(undefined);
  const [apiDone, setApiDone] = useState(false);

  useEffect(() => {
    if (id) {
      productApi.get(id).then(setApiProduct).catch(() => setApiProduct(null)).finally(() => setApiDone(true));
    }
  }, [id]);

  const mockMatch = products.find((p) => p.id === id);
  const product = apiProduct
    ? { ...apiProduct, price: apiProduct.base_price_vnd, image: apiProduct.images?.[0] || '', rating: 4.5, reviews: 0, badge: undefined, inStock: apiProduct.status === 'active', category: '' }
    : apiProduct === undefined
      ? mockMatch
      : null;

  // Show spinner while loading API for unknown products
  if (!product && !mockMatch && !apiDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product && apiDone) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      >
        <p className="text-gray-500 text-lg mb-4">
          Không tìm thấy sản phẩm
        </p>
        <Link
          to="/products"
          className="underline"
          style={{ color: "#cc323f" }}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        type: "product",
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const related = products
    .filter(
      (p) =>
        p.category === product.category && p.id !== product.id,
    )
    .slice(0, 4);

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
            <Link
              to="/products"
              className="hover:text-[#cc323f]"
            >
              Sản phẩm
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "#0f172a" }}>
              {product.name}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm mb-3 h-80 lg:h-96">
              <img
                src={
                  product.id === "p1"
                    ? nhangImage
                    : product.id === "p2"
                      ? denLyImage
                      : product.id === "p3"
                        ? luHuongImage
                        : product.id === "p4"
                          ? denCayLonImage
                          : product.id === "p5"
                            ? denCayNhoImage
                            : product.images[activeImg]
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span
                  className="absolute top-4 left-4 text-white text-sm px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "#cc323f",
                    fontWeight: 600,
                  }}
                >
                  {product.badge}
                </span>
              )}
              {product.originalPrice && (
                <span
                  className="absolute top-4 right-4 text-sm px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "#e6bb0c",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  -
                  {Math.round(
                    (1 -
                      product.price / product.originalPrice) *
                      100,
                  )}
                  %
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImg(Math.max(0, activeImg - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                    disabled={activeImg === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImg(
                        Math.min(
                          product.images.length - 1,
                          activeImg + 1,
                        ),
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow"
                    disabled={
                      activeImg === product.images.length - 1
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      borderColor:
                        activeImg === i
                          ? "#cc323f"
                          : "transparent",
                    }}
                  >
                    <img
                      src={img}
                      alt=""
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
                style={{
                  backgroundColor: "#fdf4f3",
                  color: "#cc323f",
                }}
              >
                {product.category}
              </span>
              {product.inStock ? (
                <span className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  Còn hàng
                </span>
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
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(product.rating) ? "fill-[#e6bb0c] text-[#e6bb0c]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm">
                {product.rating}/5 ({product.reviews} đánh giá)
              </span>
            </div>

            <div className="mb-4">
              <span
                className="text-3xl"
                style={{ color: "#cc323f", fontWeight: 700 }}
              >
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-400 text-lg line-through ml-3">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span
                    className="ml-2 text-sm px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: "#e6bb0c",
                      color: "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    -
                    {Math.round(
                      (1 -
                        product.price / product.originalPrice) *
                        100,
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-5">
              {product.description}
            </p>

            {/* Highlights */}
            <div className="bg-white rounded-xl p-4 mb-5 border border-gray-100">
              <p
                className="text-sm mb-2"
                style={{ color: "#0f172a", fontWeight: 600 }}
              >
                Điểm nổi bật:
              </p>
              <ul className="space-y-1.5">
                {[
                  "Chất liệu thiên nhiên, an toàn",
                  "Đúng phong tục truyền thống",
                  "Đóng gói cẩn thận, giao nhanh",
                  "Hàng chính hãng 100%",
                ].map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {feat}
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
                <Check className="w-4 h-4" /> Đã thêm vào giỏ
                hàng!
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 border-2 py-3 rounded-xl transition-colors disabled:opacity-40"
                style={{
                  borderColor: "#cc323f",
                  color: "#cc323f",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "#fdf4f3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "transparent";
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl transition-colors disabled:opacity-40"
                style={{ backgroundColor: "#cc323f" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "#ab2534";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "#cc323f";
                }}
              >
                <Zap className="w-5 h-5" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "clamp(1.05rem, 2.2vw, 1.4rem)",
              }}
              className="mb-6"
            >
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={
                        p.id === "p1"
                          ? nhangImage
                          : p.id === "p2"
                            ? denLyImage
                            : p.id === "p3"
                              ? luHuongImage
                              : p.id === "p4"
                                ? denCayLonImage
                                : p.id === "p5"
                                  ? denCayNhoImage
                                  : p.image
                      }
                      alt={p.name}
                      className="w-full h-full object-contain scale-[1.08] group-hover:scale-[1.13] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h4
                      className="text-sm line-clamp-2 mb-1"
                      style={{
                        fontFamily: "Lora, serif",
                        color: "#0f172a",
                      }}
                    >
                      {p.name}
                    </h4>
                    <span
                      className="text-sm"
                      style={{
                        color: "#cc323f",
                        fontWeight: 700,
                      }}
                    >
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Checkout Modal */}
      {showModal && (
        <QuickCheckoutModal
          item={{
            id: product.id,
            type: "product",
            name: product.name,
            price: product.price,
            image: product.image,
          }}
          qty={qty}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}