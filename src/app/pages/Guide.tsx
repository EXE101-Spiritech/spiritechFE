import { Link } from 'react-router';
import { Clock, Calendar, Tag } from 'lucide-react';
import { guideArticles } from '../data';

export default function Guide() {
  const featured = guideArticles[0];
  const rest = guideArticles.slice(1);

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }} className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="py-10" style={{ backgroundColor: '#902131' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Hướng dẫn</span>
          </nav>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'white', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)' }}>
            Hướng Dẫn Cúng Bái
          </h1>
          <p className="text-white/70 mt-1">Kiến thức thờ cúng theo phong tục truyền thống Việt Nam</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured article — toàn bộ card là link */}
        <Link
          to={`/guide/${featured.id}`}
          className="block bg-white rounded-2xl overflow-hidden shadow-sm mb-8 hover:shadow-lg transition-all group"
        >
          <div className="md:flex">
            <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: '#fdf4f3', color: '#cc323f' }}
                >
                  <Tag className="w-3 h-3" /> {featured.category}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featured.readTime} đọc
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {featured.date}
                </span>
              </div>
              <h2
                style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', lineHeight: 1.3 }}
                className="mb-3 group-hover:text-[#cc323f] transition-colors"
              >
                {featured.title}
              </h2>
              <p className="text-gray-500 leading-relaxed">{featured.excerpt}</p>
            </div>
          </div>
        </Link>

        {/* Article grid */}
        <div className="mb-6">
          <p className="text-sm uppercase tracking-widest mb-1" style={{ color: '#cc323f', fontWeight: 600 }}>
            Tất cả bài viết
          </p>
          <h2 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
            Kiến Thức Thờ Cúng
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(article => (
            <Link
              key={article.id}
              to={`/guide/${article.id}`}
              className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className="absolute top-3 left-3 text-white text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(144,33,49,0.85)' }}
                >
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex gap-3 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
                </div>
                <h3
                  style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: '1rem', lineHeight: 1.4 }}
                  className="mb-2 group-hover:text-[#cc323f] transition-colors"
                >
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}