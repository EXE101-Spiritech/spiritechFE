import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { HealthProvider } from "./context/HealthContext";

// Pages that should not show footer or chat
const NO_FOOTER_PATHS = ["/login", "/register", "/reset-password"];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function Root() {
  const location = useLocation();
  const isAuthPage = NO_FOOTER_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <HealthProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <ChatBot />}
          </div>
        </CartProvider>
      </AuthProvider>
    </HealthProvider>
  );
}
