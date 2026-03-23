import { useState } from 'react';
import { Link } from 'react-router';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email không hợp lệ';
    if (!form.message.trim()) e.message = 'Vui lòng nhập nội dung';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const inputBase = 'w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all';
  const getInputClass = (field: string) => `${inputBase} ${errors[field] ? 'border-red-300' : 'border-gray-200'}`;

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }} className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="py-10" style={{ backgroundColor: '#902131' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Liên hệ</span>
          </nav>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'white', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)' }}>Liên Hệ</h1>
          <p className="text-white/70 mt-1">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: '1.2rem' }} className="mb-5">
                Thông Tin Liên Hệ
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fdf4f3' }}>
                    <Phone className="w-4 h-4" style={{ color: '#cc323f' }} />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Hotline</p>
                    <a href="tel:0800123456" className="hover:underline" style={{ color: '#cc323f' }}>0800 123 456</a>
                    <p className="text-gray-400 text-xs">Miễn phí (8:00 - 20:00)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fdf4f3' }}>
                    <Mail className="w-4 h-4" style={{ color: '#cc323f' }} />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Email</p>
                    <a href="mailto:tamlinhdung@gmail.com" className="hover:underline text-sm" style={{ color: '#cc323f' }}>gocannhien@gmail.com</a>
                    <p className="text-gray-400 text-xs">Phản hồi trong 2-4 giờ</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fdf4f3' }}>
                    <MessageCircle className="w-4 h-4" style={{ color: '#cc323f' }} />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Zalo</p>
                    <p className="text-sm" style={{ color: '#cc323f' }}>0800 123 456</p>
                    <p className="text-gray-400 text-xs">Chat trực tiếp 24/7</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fdf4f3' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#cc323f' }} />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Địa chỉ</p>
                    <p className="text-gray-600 text-sm">123 Đinh Tiên Hoàng, P. Đa Kao, Q.1, TP.HCM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" style={{ color: '#cc323f' }} />
                <h3 style={{ color: '#0f172a', fontSize: '1rem' }}>Giờ hoạt động</h3>
              </div>
              <div className="space-y-2">
                {[
                  { day: 'Thứ 2 - Thứ 6', time: '8:00 - 20:00' },
                  { day: 'Thứ 7', time: '8:00 - 20:00' },
                  { day: 'Chủ nhật', time: '9:00 - 18:00' },
                  { day: 'Lễ, Tết', time: 'Theo thông báo' },
                ].map(h => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="text-gray-600">{h.day}</span>
                    <span style={{ color: '#cc323f', fontWeight: 600 }}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-48">
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fdf4f3, #f8fafc)' }}>
                <div className="text-center">
                  <MapPin className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(204,50,63,0.3)' }} />
                  <p className="text-gray-400 text-sm">123 Đinh Tiên Hoàng, Q.1</p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#cc323f' }}>
                    Xem trên Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }} className="mb-3">
                    Cảm ơn bạn đã liên hệ!
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 2-4 giờ làm việc.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }); }}
                    className="text-sm hover:underline"
                    style={{ color: '#cc323f' }}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: '1.3rem' }} className="mb-6">
                    Gửi Tin Nhắn
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Họ và tên *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => update('name', e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className={getInputClass('name')}
                          onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = errors.name ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Số điện thoại</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => update('phone', e.target.value)}
                          placeholder="0912 345 678"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50 transition-all"
                          onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        placeholder="example@email.com"
                        className={getInputClass('email')}
                        onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Chủ đề</label>
                      <select
                        value={form.subject}
                        onChange={e => update('subject', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 outline-none bg-gray-50 transition-all text-gray-700"
                        onFocus={e => { e.target.style.borderColor = '#cc323f'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                      >
                        <option value="">Chọn chủ đề...</option>
                        <option>Tư vấn lễ vật</option>
                        <option>Đặt hàng số lượng lớn</option>
                        <option>Khiếu nại / Phản ánh</option>
                        <option>Hợp tác kinh doanh</option>
                        <option>Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Nội dung *</label>
                      <textarea
                        value={form.message}
                        onChange={e => update('message', e.target.value)}
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        rows={5}
                        className={`${getInputClass('message')} resize-none`}
                        onFocus={e => { e.target.style.borderColor = '#cc323f'; e.target.style.boxShadow = '0 0 0 3px rgba(204,50,63,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = errors.message ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: '#cc323f', fontWeight: 600 }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#ab2534'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#cc323f'; }}
                    >
                      {loading ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi tin nhắn</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}