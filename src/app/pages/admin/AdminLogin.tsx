import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@spiritech.com' && password === 'admin123') {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_name', 'Admin Spiritech');
        // Hard navigate to ensure clean route resolution
        window.location.replace('/admin');
      } else {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #3a0e16 0%, #902131 50%, #cc323f 100%)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, #e6bb0c 2px, transparent 2px), radial-gradient(circle at 75% 75%, #e6bb0c 2px, transparent 2px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(180deg, #fdf8f0 0%, #fff 100%)' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #3a0e16, #cc323f)' }}>
            <span className="text-3xl">🕯️</span>
          </div>
          <h1 className="text-2xl" style={{ fontFamily: 'Lora, serif', color: '#3a0e16' }}>
            Spiritech Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            Bảng điều khiển quản trị
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              Email quản trị
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
              onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.15)')}
              onBlur={e => (e.target.style.boxShadow = 'none')}
              placeholder="admin@spiritech.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm transition-all focus:outline-none"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
                onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.15)')}
                onBlur={e => (e.target.style.boxShadow = 'none')}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #cc323f, #902131)', fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang đăng nhập...
              </span>
            ) : 'Đăng nhập'}
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-700 text-xs" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              <strong>Demo:</strong> admin@spiritech.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}