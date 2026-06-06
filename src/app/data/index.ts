export interface CartItem {
  id: string;
  type: "product" | "combo";
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipping" | "delivered" | "cancelled";
  items: CartItem[];
  total: number;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  paymentMethod: "cod" | "bank";
  estimatedDelivery: string;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getStatusLabel = (status: Order["status"]): string => {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: Order["status"]): string => {
  const colors: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50",
    processing: "text-blue-600 bg-blue-50",
    shipping: "text-orange-600 bg-orange-50",
    delivered: "text-green-600 bg-green-50",
    cancelled: "text-red-600 bg-red-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
};
