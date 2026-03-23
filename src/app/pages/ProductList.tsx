import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Star, SlidersHorizontal, X } from 'lucide-react';
import { products, CATEGORIES, formatCurrency } from '../data';
import nhangImage from 'figma:asset/b2c37b674ec7f7c6335108a122aa3526e2a6cfe3.png';
import denLyImage from 'figma:asset/42798c95181dc052ceac12cdaa0a58f3d4c1406f.png';
import denCayLonImage from 'figma:asset/df97bc4cd293cebf88ba1d247ecb017492bcdad0.png';
import denCayNhoImage from 'figma:asset/eb2fc9a0a51e17243df477cea736c858af36d4da.png';
import luHuongImage from 'figma:asset/23ed9670385e74f09addd804528ecb4bee074c94.png';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-[#e6bb0c] text-[#e6bb0c]' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [sortBy, setSortBy] = useState('popular');

  const selectedCategory = searchParams.get('category') || 'Tất cả';

  const filtered = products
    .filter(p => {
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const setCategory = (cat: string) => {
    if (cat === 'Tất cả') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }} className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="py-10" style={{ backgroundColor: '#902131' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Sản phẩm</span>
          </nav>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'white', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)' }}>
            Đồ Thờ Cúng Tâm Linh
          </h1>
          <p className="text-white/70 mt-1">Sản phẩm chất lượng cao, đúng phong tục</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={
                selectedCategory === cat
                  ? { backgroundColor: '#cc323f', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                  : { backgroundColor: 'white', color: '#334155', border: '1px solid #e2e8f0' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Hiển thị <strong className="text-gray-800">{filtered.length}</strong> sản phẩm
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
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
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Bộ lọc</h3>
              <button onClick={() => setShowFilter(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                Khoảng giá: {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
              </p>
              <input
                type="range" min={0} max={500000} step={10000}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#cc323f]"
              />
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛕</div>
            <p className="text-gray-600 mb-2" style={{ fontWeight: 600 }}>Hiện chưa có sản phẩm lẻ</p>
            <p className="text-gray-400 text-sm mb-6">Hãy khám phá các combo mâm cúng đầy đủ của chúng tôi.</p>
            <Link
              to="/combo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm transition-colors"
              style={{ backgroundColor: '#cc323f' }}
            >
              Xem Combo Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(product => (
              <Link key={product.id} to={`/products/${product.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden h-44">
                  <img src={product.id === 'p1' ? nhangImage : product.id === 'p2' ? denLyImage : product.id === 'p3' ? luHuongImage : product.id === 'p4' ? denCayLonImage : product.id === 'p5' ? denCayNhoImage : product.image} alt={product.name} className="w-full h-full object-contain scale-[1.08] group-hover:scale-[1.13] transition-transform duration-500" />
                  {product.badge && (
                    <span className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#cc323f' }}>
                      {product.badge}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e6bb0c', color: '#0f172a', fontWeight: 700 }}>
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs" style={{ fontWeight: 600 }}>Hết hàng</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{product.category}</p>
                  <h3
                    className="mb-2 mt-1 line-clamp-2"
                    style={{
                      fontFamily: 'Lora, serif',
                      color: '#0f172a',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#cc323f', fontWeight: 700, fontSize: '1.05rem' }}>{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">{formatCurrency(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}