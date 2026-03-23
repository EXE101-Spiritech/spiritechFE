import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router';
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Calendar,
  FileText, BarChart2, Users, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { path: '/admin/inventory', icon: Boxes, label: 'Kho hàng' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { path: '/admin/events', icon: Calendar, label: 'Sự kiện' },
  { path: '/admin/cms', icon: FileText, label: 'Nội dung (CMS)' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Thống kê' },
  { path: '/admin/users', icon: Users, label: 'Người dùng' },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Quản lý Sản phẩm',
  '/admin/inventory': 'Quản lý Kho hàng',
  '/admin/orders': 'Quản lý Đơn hàng',
  '/admin/events': 'Quản lý Sự kiện',
  '/admin/cms': 'Quản lý Nội dung',
  '/admin/analytics': 'Thống kê & Báo cáo',
  '/admin/users': 'Quản lý Người dùng',
};

export default function AdminRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronous auth check — redirect immediately without waiting for effect
  const isAuth = localStorage.getItem('admin_auth') === 'true';

  useEffect(() => {
    if (!isAuth) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuth, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Block render if not authenticated (avoid any flash of admin UI)
  if (!isAuth) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  const adminName = localStorage.getItem('admin_name') || 'Admin';
  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin Panel';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(230,187,12,0.2)' }}>
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
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all group relative"
              style={{
                fontFamily: 'Be Vietnam Pro, sans-serif',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(204,50,63,0.7)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: '#e6bb0c' }} />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
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
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0ede8', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
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
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
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
                {currentTitle}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Spiritech Admin Panel
              </p>
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}