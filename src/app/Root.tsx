import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages that should not show footer
const NO_FOOTER_PATHS = ['/login', '/register', '/reset-password'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function Root() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          {showFooter && <Footer />}
          <ChatBot />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}