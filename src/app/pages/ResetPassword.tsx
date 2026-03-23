import { useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import logoSvg from '../../imports/logo-only-primary.svg';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setError('Email không hợp lệ'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }} className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#902131' }}>
            <img src={logoSvg} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: '1.8rem' }}>Đặt Lại Mật Khẩu</h1>
          <p className="text-gray-500 mt-1">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 style={{ color: '#0f172a' }} className="mb-2">Kiểm tra email của bạn!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và thư mục spam).
              </p>
              <Link to="/login" className="text-sm hover:underline" style={{ color: '#cc323f', fontWeight: 600 }}>
                ← Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email đã đăng ký"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all bg-gray-50"
                  onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3.5 rounded-xl transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#cc323f', fontWeight: 600 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#ab2534'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#cc323f'; }}
              >
                {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại Mật Khẩu'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-gray-500 text-sm hover:text-[#cc323f]">
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}