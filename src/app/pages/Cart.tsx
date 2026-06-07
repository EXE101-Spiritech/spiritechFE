import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const shipping = 30000;
  const grandTotal = totalPrice + shipping;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div
        style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4"
      >
        <div className="text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#fdf4f3" }}
          >
            <ShoppingBag
              className="w-12 h-12"
              style={{ color: "rgba(204,50,63,0.3)" }}
            />
          </div>
          <h2
            style={{
              fontFamily: "Lora, serif",
              color: "#0f172a",
              fontSize: "1.5rem",
            }}
            className="mb-2"
          >
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/combo"
              className="text-white px-6 py-3 rounded-full transition-colors"
              style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
            >
              Xem Combo
            </Link>
            <Link
              to="/products"
              className="border px-6 py-3 rounded-full transition-colors hover:bg-[#fdf4f3]"
              style={{
                borderColor: "#cc323f",
                color: "#cc323f",
                fontWeight: 600,
              }}
            >
              Xem Sản Phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "white",
              fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
            }}
          >
            Giỏ Hàng
          </h1>
          <p className="text-white/70 mt-1">
            {items.length} sản phẩm trong giỏ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm flex gap-4 items-start"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ color: "#cc323f", backgroundColor: "#fdf4f3" }}
                      >
                        {item.type === "combo" ? "Combo" : "Sản phẩm"}
                      </span>
                      <h4
                        className="mt-1 mb-0.5"
                        style={{ fontFamily: "Lora, serif", color: "#0f172a" }}
                      >
                        {item.name}
                      </h4>
                      <p style={{ color: "#cc323f", fontWeight: 700 }}>
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId || item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.variantId || item.id,
                            item.quantity - 1,
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        className="w-10 text-center text-sm"
                        style={{ fontWeight: 600 }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.variantId || item.id,
                            item.quantity + 1,
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: "#0f172a", fontWeight: 700 }}
                    >
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
              <h3
                style={{
                  fontFamily: "Lora, serif",
                  color: "#0f172a",
                  fontSize: "1.2rem",
                }}
                className="mb-4"
              >
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản
                    phẩm)
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(shipping)}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    Tổng cộng
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#cc323f",
                      fontSize: "1.2rem",
                    }}
                  >
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full text-white py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ab2534";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#cc323f";
                }}
              >
                Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/products"
                className="mt-3 w-full block text-center text-sm hover:underline"
                style={{ color: "#cc323f" }}
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
