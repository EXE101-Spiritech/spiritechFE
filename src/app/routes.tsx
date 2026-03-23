import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Home from './pages/Home';
import ComboList from './pages/ComboList';
import ComboDetail from './pages/ComboDetail';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Guide from './pages/Guide';
import GuideDetail from './pages/GuideDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import ResetPassword from './pages/ResetPassword';
import CalendarPage from './pages/CalendarPage';
import AdminPanel from './pages/admin/AdminPanel';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      <p className="text-6xl mb-4">🕯️</p>
      <h1 style={{ fontFamily: 'Lora, serif', color: '#0f172a', fontSize: '2rem' }} className="mb-2">
        Trang Không Tìm Thấy
      </h1>
      <p className="text-gray-500 mb-6">Trang bạn đang tìm kiếm không tồn tại.</p>
      <a href="/" className="text-white px-6 py-3 rounded-full transition-colors" style={{ backgroundColor: '#cc323f' }}>
        Về Trang Chủ
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  // ─── Admin Panel (single self-contained route — no Navbar/Footer) ──────────
  {
    path: '/admin',
    Component: AdminPanel,
  },
  {
    // Catch /admin/login, /admin/products, etc. — all handled by AdminPanel
    path: '/admin/*',
    Component: AdminPanel,
  },

  // ─── Main website ──────────────────────────────────────────────────────────
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'combo', Component: ComboList },
      { path: 'combo/:id', Component: ComboDetail },
      { path: 'products', Component: ProductList },
      { path: 'products/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'checkout', Component: Checkout },
      { path: 'order-success', Component: OrderSuccess },
      { path: 'account', Component: Account },
      { path: 'account/orders', Component: OrderHistory },
      { path: 'account/orders/:id', Component: OrderDetail },
      { path: 'guide', Component: Guide },
      { path: 'guide/:id', Component: GuideDetail },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'calendar', Component: CalendarPage },
      { path: '*', Component: NotFound },
    ],
  },
]);