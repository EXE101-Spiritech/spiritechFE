import { useState } from 'react';
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Calendar,
  FileText, BarChart2, Users, LogOut, Menu, X, ChevronRight,
  Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminEvents from './AdminEvents';
import AdminCMS from './AdminCMS';
import AdminAnalytics from './AdminAnalytics';
import AdminUsers from './AdminUsers';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'events'
  | 'cms'
  | 'analytics'
  | 'users';

const NAV_ITEMS: { key: Section; icon: React.ElementType; label: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'products', icon: Package, label: 'Sản phẩm' },
  { key: 'inventory', icon: Boxes, label: 'Kho hàng' },
  { key: 'orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { key: 'events', icon: Calendar, label: 'Sự kiện' },
  { key: 'cms', icon: FileText, label: 'Nội dung (CMS)' },
  { key: 'analytics', icon: BarChart2, label: 'Thống kê' },
  { key: 'users', icon: Users, label: 'Người dùng' },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: 'Dashboard',
  products: 'Quản lý Sản phẩm',
  inventory: 'Quản lý Kho hàng',
  orders: 'Quản lý Đơn hàng',
  events: 'Quản lý Sự kiện',
  cms: 'Quản lý Nội dung',
  analytics: 'Thống kê & Báo cáo',
  users: 'Quản lý Người dùng',
};

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (name: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (email === 'admin@spiritech.com' && password === 'admin123') {
        onLogin('Admin Spiritech');
      } else {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        setLoading(false);
      }
    }, 600);
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
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              Email quản trị
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-200 border-transparent"
              style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
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

// ─── Admin Layout + All Sections ─────────────────────────────────────────────
function AdminLayout({
  adminName,
  activeSection,
  setActiveSection,
  onLogout,
}: {
  adminName: string;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  onLogout: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(230,187,12,0.2)' }}
        >
          🕯️
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: 'Lora, serif' }}>
            Spiritech
          </p>
          <p className="text-white/50 text-xs" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all relative text-left"
              style={{
                fontFamily: 'Be Vietnam Pro, sans-serif',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(204,50,63,0.7)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: '#e6bb0c' }}
                />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{ fontFamily: 'Be Vietnam Pro, sans-serif', color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
        <a
          href="/"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all mt-0.5"
          style={{ fontFamily: 'Be Vietnam Pro, sans-serif', color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronRight size={16} className="flex-shrink-0 rotate-180" />
          <span>Về website</span>
        </a>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#f0ede8', fontFamily: 'Be Vietnam Pro, sans-serif' }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 h-full"
        style={{ background: 'linear-gradient(180deg, #3a0e16 0%, #200a0e 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative z-50 flex flex-col w-64 h-full shadow-2xl"
            style={{ background: 'linear-gradient(180deg, #3a0e16 0%, #200a0e 100%)' }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
                {SECTION_TITLES[activeSection]}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Spiritech Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-800 font-medium">{adminName}</p>
              <p className="text-xs text-gray-400">Quản trị viên</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #cc323f, #902131)' }}
            >
              A
            </div>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'products' && <AdminProducts />}
          {activeSection === 'inventory' && <AdminInventory />}
          {activeSection === 'orders' && <AdminOrders />}
          {activeSection === 'events' && <AdminEvents />}
          {activeSection === 'cms' && <AdminCMS />}
          {activeSection === 'analytics' && <AdminAnalytics />}
          {activeSection === 'users' && <AdminUsers />}
        </main>
      </div>
    </div>
  );
}

// ─── Root export: handles auth state + switches between Login / Dashboard ─────
export default function AdminPanel() {
  const [adminName, setAdminName] = useState<string | null>(() => {
    // Try to restore session from localStorage
    const saved = localStorage.getItem('admin_auth');
    const name = localStorage.getItem('admin_name');
    return saved === 'true' && name ? name : null;
  });
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const handleLogin = (name: string) => {
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_name', name);
    setAdminName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_name');
    setAdminName(null);
  };

  if (!adminName) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AdminLayout
      adminName={adminName}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onLogout={handleLogout}
    />
  );
}
