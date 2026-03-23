import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../../imports/logo-only-primary.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate(redirect);
    else setError('Email hoặc mật khẩu không chính xác');
  };

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }} className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#902131' }}>
            <img src={logoSvg} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>
            Đăng Nhập
          </h1>
          <p className="text-gray-500 mt-1">Chào mừng bạn quay trở lại</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Email / Số điện thoại</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif', backgroundColor: 'white' }}
                onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none transition-all"
                  style={{ backgroundColor: 'white' }}
                  onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/reset-password" className="text-sm hover:underline" style={{ color: '#cc323f' }}>
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#cc323f', fontWeight: 600 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#ab2534'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#cc323f'; }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Chưa có tài khoản?{' '}
              <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="hover:underline" style={{ color: '#cc323f', fontWeight: 600 }}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="hover:underline" style={{ color: '#cc323f' }}>Điều khoản dịch vụ</a> của chúng tôi
        </p>
      </div>
    </div>
  );
}