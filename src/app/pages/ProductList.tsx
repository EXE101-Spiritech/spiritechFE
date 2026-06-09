import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, SlidersHorizontal, X } from "lucide-react";
import { formatCurrency } from "../data";
import { productApi } from "@/features/products/api";
import { track } from "@/features/products/tracking/api";

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

const PAGE_SIZE = 20;

export default function ProductList() {
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState("popular");
  const [apiProducts, setApiProducts] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p: number) => {
    setLoading(true);
    productApi
      .list({ page: p, size: PAGE_SIZE })
      .then((r) => {
        setApiProducts(r.data);
        setTotal(r.total);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    track("product.list_viewed", {});
  }, []);

  const displayProducts = apiProducts
    ? apiProducts.map((p) => ({
        ...p,
        id: p.slug,
        price: p.base_price_vnd,
        originalPrice: undefined,
        image: p.images?.[0] || "",
        images: p.images || [],
        description: "",
        category: "",
        rating: 4.5,
        reviews: 0,
        badge: undefined,
        inStock: p.quantity > 0,
        lowStock: p.quantity > 0 && p.quantity < 5,
        quantity: p.quantity ?? 0,
      }))
    : [];
  const filtered = displayProducts
    .filter((p) => {
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="py-8 sm:py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Sản phẩm</span>
          </nav>
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "white",
              fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
            }}
          >
            Đồ Thờ Cúng Tâm Linh
          </h1>
          <p className="text-white/70 mt-1">
            Sản phẩm chất lượng cao, đúng phong tục
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Hiển thị <strong className="text-gray-800">{total}</strong> sản phẩm
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 outline-none"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white transition-colors hover:border-[#cc323f] hover:text-[#cc323f]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Lọc
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>
                Bộ lọc
              </h3>
              <button onClick={() => setShowFilter(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div>
              <p
                className="text-sm text-gray-700 mb-2"
                style={{ fontWeight: 600 }}
              >
                Khoảng giá: {formatCurrency(priceRange[0])} –{" "}
                {formatCurrency(priceRange[1])}
              </p>
              <input
                type="range"
                min={0}
                max={50000000}
                step={100000}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full accent-[#cc323f]"
              />
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛕</div>
            <p className="text-gray-600 mb-2" style={{ fontWeight: 600 }}>
              Hiện chưa có sản phẩm lẻ
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Hãy khám phá các combo mâm cúng đầy đủ của chúng tôi.
            </p>
            <Link
              to="/combo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm transition-colors"
              style={{ backgroundColor: "#cc323f" }}
            >
              Xem Combo Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative overflow-hidden h-32 sm:h-44">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain scale-[1.08] group-hover:scale-[1.13] transition-transform duration-500"
                  />
                  {product.lowStock && (
                    <span
                      className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: "#ff4444", color: "white" }}
                    >
                      <span style={{ filter: "none" }}>🔥</span> Sắp hết
                    </span>
                  )}
                  {product.originalPrice && (
                    <span
                      className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#e6bb0c",
                        color: "#0f172a",
                        fontWeight: 700,
                      }}
                    >
                      -
                      {Math.round(
                        (1 - product.price / product.originalPrice) * 100,
                      )}
                      %
                    </span>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span
                        className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className="mb-2 mt-1 line-clamp-2"
                    style={{
                      fontFamily: "Lora, serif",
                      color: "#0f172a",
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-400">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        color: "#cc323f",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                      }}
                    >
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-30"
              style={{
                borderColor: "#e2e8f0",
                color: page <= 1 ? "#94a3b8" : "#334155",
              }}
            >
              Trước
            </button>
            {Array.from(
              { length: Math.ceil(total / PAGE_SIZE) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => load(p)}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: p === page ? "#cc323f" : "transparent",
                  color: p === page ? "white" : "#334155",
                }}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              onClick={() => load(page + 1)}
              className="px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-30"
              style={{
                borderColor: "#e2e8f0",
                color:
                  page >= Math.ceil(total / PAGE_SIZE) ? "#94a3b8" : "#334155",
              }}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
