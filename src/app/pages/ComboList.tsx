import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Star, SlidersHorizontal, X } from 'lucide-react';
import { combos, OCCASIONS, formatCurrency } from '../data';
import { comboApi } from '@/features/combos/api';
import exampleImage from 'figma:asset/e5cf50079f7038348babb7662b17fe84a7e6152f.png';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(rating)
              ? 'fill-[#e6bb0c] text-[#e6bb0c]'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function ComboList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [apiCombos, setApiCombos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    comboApi.list().then(setApiCombos).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const displayCombos = apiCombos
    ? apiCombos.map(c => ({
        ...c,
        id: c.slug,
        price: 0,
        originalPrice: undefined,
        image: c.banner_url || '',
        images: [c.banner_url || ''],
        description: c.description,
        items: [],
        occasion: '',
        rating: 4.5,
        reviews: 0,
        badge: undefined,
        inStock: true,
        usageGuide: '',
      }))
    : combos;
  const selectedOccasion = searchParams.get('occasion') || 'Tất cả';

  const filtered = displayCombos
    .filter((c) => {
      const matchOccasion =
        selectedOccasion === 'Tất cả' || c.occasion === selectedOccasion;
      const matchPrice = c.price >= priceRange[0] && c.price <= priceRange[1];
      return matchOccasion && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const setOccasion = (occasion: string) => {
    if (occasion === 'Tất cả') searchParams.delete('occasion');
    else searchParams.set('occasion', occasion);
    setSearchParams(searchParams);
  };

  return (
    <div
      style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="py-10" style={{ backgroundColor: '#902131' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Combo cúng</span>
          </nav>
          <h1
            style={{
              fontFamily: 'Lora, serif',
              color: 'white',
              fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
            }}
          >
            Combo Mâm Cúng Trọn Bộ
          </h1>
          <p className="text-white/70 mt-1">
            Đầy đủ lễ vật theo phong tục truyền thống
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Occasion filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              onClick={() => setOccasion(occ)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={
                selectedOccasion === occ
                  ? {
                      backgroundColor: '#cc323f',
                      color: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }
                  : {
                      backgroundColor: 'white',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                    }
              }
            >
              {occ}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Hiển thị{' '}
            <strong className="text-gray-800">{filtered.length}</strong> combo
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 outline-none"
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white transition-colors hover:text-[#cc323f] hover:border-[#cc323f]"
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
              <h3 className="text-gray-800" style={{ fontWeight: 700 }}>
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
                Khoảng giá: {formatCurrency(priceRange[0])} –{' '}
                {formatCurrency(priceRange[1])}
              </p>
              <div className="flex gap-4">
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
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">Không tìm thấy combo phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((combo) => (
              <Link
                key={combo.id}
                to={`/combo/${combo.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden h-56">
                  <img
                    src={exampleImage}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {combo.badge && (
                    <span
                      className="absolute top-3 left-3 text-white text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#cc323f', fontWeight: 600 }}
                    >
                      {combo.badge}
                    </span>
                  )}
                  {combo.originalPrice && (
                    <span
                      className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: '#e6bb0c',
                        color: '#0f172a',
                        fontWeight: 700,
                      }}
                    >
                      -{Math.round((1 - combo.price / combo.originalPrice) * 100)}%
                    </span>
                  )}
                  {!combo.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span
                        className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm"
                        style={{ fontWeight: 600 }}
                      >
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ color: '#cc323f', backgroundColor: '#fdf4f3' }}
                    >
                      {combo.occasion}
                    </span>
                  </div>
                  <h3
                    className="mb-2 mt-1"
                    style={{
                      fontFamily: 'Lora, serif',
                      color: '#0f172a',
                      fontSize: '1.05rem',
                    }}
                  >
                    {combo.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                    {combo.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={combo.rating} />
                    <span className="text-xs text-gray-500">
                      ({combo.reviews} đánh giá)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="text-xl"
                        style={{ color: '#cc323f', fontWeight: 700 }}
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
        )}
      </div>
    </div>
  );
}