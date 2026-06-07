import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Clock, Calendar, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { formatCurrency } from "../data";
import { productApi } from "@/features/products/api";
import { QuickCheckoutModal } from "../components/QuickCheckoutModal";
import { ContentRenderer } from "../components/ContentRenderer";
import { API_BASE } from "@/shared/api/axiosClient";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apiArticle, setApiArticle] = useState<any | null>(undefined);

  useEffect(() => {
    if (id) {
      productApi
        .getBlog(id)
        .then(setApiArticle)
        .catch(() => setApiArticle(null));
    }
  }, [id]);

  const article = apiArticle
    ? {
        id: apiArticle.slug || apiArticle.id,
        title: apiArticle.title,
        excerpt: apiArticle.excerpt || "",
        content: apiArticle.content || "",
        image: apiArticle.image_url
          ? apiArticle.image_url.startsWith("http")
            ? apiArticle.image_url
            : `${API_BASE}${apiArticle.image_url}`
          : "",
        category: "",
        readTime: "5 phút",
        date: apiArticle.created_at ? apiArticle.created_at.slice(0, 10) : "",
        relatedComboId: null,
        relatedComboName: null,
      }
    : apiArticle === undefined
      ? null
      : null;
  const [showModal, setShowModal] = useState(false);

  if (!article) {
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center"
      >
        <p className="text-gray-500 mb-4">Không tìm thấy bài viết</p>
        <Link to="/guide" className="underline" style={{ color: "#cc323f" }}>
          ← Quay lại hướng dẫn
        </Link>
      </div>
    );
  }

  const relatedCombo: any = null;
  const others: any[] = [];

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link to="/guide" className="hover:text-white">
              Hướng dẫn
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:underline mb-6"
          style={{ color: "#cc323f", fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại hướng dẫn
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {article.image && (
            <div className="flex justify-center bg-gray-50 p-4">
              <img
                src={article.image}
                alt={article.title}
                className="w-full max-w-md h-auto rounded-lg"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#fdf4f3", color: "#cc323f" }}
              >
                {article.category}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} đọc
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {article.date}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                lineHeight: 1.3,
              }}
              className="mb-6"
            >
              {article.title}
            </h1>

            <div
              className="text-gray-600 leading-relaxed"
              style={{ fontSize: "20px" }}
            >
              <ContentRenderer content={article.content} />
            </div>

            {/* Related combo CTA with Buy Now */}
            {relatedCombo && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    background: "linear-gradient(to right, #fdf4f3, #f8fafc)",
                    borderColor: "rgba(230,187,12,0.3)",
                  }}
                >
                  <p
                    className="text-sm mb-2"
                    style={{ color: "#cc323f", fontWeight: 600 }}
                  >
                    🎁 Combo phù hợp cho nghi lễ này:
                  </p>

                  <div className="flex gap-3 mb-3">
                    <img
                      src={relatedCombo.image}
                      alt={relatedCombo.name}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm mb-0.5"
                        style={{
                          fontFamily: "Lora, serif",
                          color: "#0f172a",
                          fontWeight: 600,
                        }}
                      >
                        {relatedCombo.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "#cc323f", fontWeight: 700 }}
                      >
                        {formatCurrency(relatedCombo.price)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {relatedCombo.items.length} lễ vật ·{" "}
                        {relatedCombo.occasion}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/combo/${article.relatedComboId}`}
                      className="inline-flex items-center gap-2 border-2 px-4 py-2 rounded-full text-sm transition-colors"
                      style={{
                        borderColor: "#cc323f",
                        color: "#cc323f",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fdf4f3";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Xem chi tiết <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm transition-colors"
                      style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ab2534";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#cc323f";
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Checkout Modal — mở ngay từ trang bài viết */}
      {showModal && relatedCombo && (
        <QuickCheckoutModal
          item={{
            id: relatedCombo.id,
            type: "combo",
            name: relatedCombo.name,
            price: relatedCombo.price,
            image: relatedCombo.image,
          }}
          qty={1}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
