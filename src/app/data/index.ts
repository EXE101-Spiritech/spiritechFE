export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
}

export interface Combo {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  items: string[];
  occasion: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  usageGuide: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'combo';
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  paymentMethod: 'cod' | 'bank';
  estimatedDelivery: string;
}

export const CATEGORIES = ['Tất cả', 'Nhang - Nến', 'Hoa - Cây cảnh', 'Vàng mã', 'Bát hương - Lư hương', 'Đồ thờ', 'Trái cây'];
export const OCCASIONS = ['Tất cả', 'Rằm tháng 7', 'Đầu năm', 'Ông Công Ông Táo', 'Cúng giỗ', 'Tân gia', 'Cô hồn', 'Thần tài'];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Nhang',
    price: 49000,
    image: 'https://images.unsplash.com/photo-1595884534413-0f3cbb0fca16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmNlbnNlJTIwc3RpY2tzJTIwcmVkJTIwcGluayUyMGJ1bmRsZSUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzc0MjY4NDI3fDA&ixlib=rb-4.1.0&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1595884534413-0f3cbb0fca16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmNlbnNlJTIwc3RpY2tzJTIwcmVkJTIwcGluayUyMGJ1bmRsZSUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzc0MjY4NDI3fDA&ixlib=rb-4.1.0&q=80&w=600'],
    description: 'Nhang thờ cúng thơm dịu, nguyên liệu thiên nhiên, phù hợp cho mọi dịp lễ giỗ và thờ cúng gia tiên.',
    category: 'Nhang - Nến',
    rating: 4.8,
    reviews: 134,
    badge: 'Bán chạy',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Đèn Ly',
    price: 37000,
    image: 'https://images.unsplash.com/photo-1628707350151-867b4530f403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGdsYXNzJTIwb2lsJTIwbGFtcCUyMGNhbmRsZSUyMGhvbGRlcnxlbnwxfHx8fDE3NzQyNjc2ODR8MA&ixlib=rb-4.1.0&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1628707350151-867b4530f403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGdsYXNzJTIwb2lsJTIwbGFtcCUyMGNhbmRsZSUyMGhvbGRlcnxlbnwxfHx8fDE3NzQyNjc2ODR8MA&ixlib=rb-4.1.0&q=80&w=600'],
    description: 'Đèn ly thờ cúng, cốc thủy tinh nhỏ gọn, dùng dầu ăn hoặc dầu đèn, thắp sáng bàn thờ suốt ngày đêm.',
    category: 'Nhang - Nến',
    rating: 4.7,
    reviews: 89,
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Lư Hương',
    price: 73000,
    image: 'https://images.unsplash.com/photo-1764426381611-3b89a9726801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9uemUlMjBpbmNlbnNlJTIwYnVybmVyJTIwYWx0YXJ8ZW58MXx8fHwxNzc0MjY3Njg0fDA&ixlib=rb-4.1.0&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1764426381611-3b89a9726801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9uemUlMjBpbmNlbnNlJTIwYnVybmVyJTIwYWx0YXJ8ZW58MXx8fHwxNzc0MjY3Njg0fDA&ixlib=rb-4.1.0&q=80&w=600'],
    description: 'Lư hương thờ cúng chất liệu bền đẹp, thiết kế truyền thống, phù hợp đặt trên bàn thờ gia tiên.',
    category: 'Bát hương - Lư hương',
    rating: 4.9,
    reviews: 76,
    badge: 'Cao cấp',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Đèn Cầy Size Lớn (1kg)',
    price: 97000,
    image: 'https://images.unsplash.com/photo-1732252140500-a38a877e218c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHJlZCUyMHBpbGxhciUyMGNhbmRsZXxlbnwxfHx8fDE3NzQyNjc2ODV8MA&ixlib=rb-4.1.0&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1732252140500-a38a877e218c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHJlZCUyMHBpbGxhciUyMGNhbmRsZXxlbnwxfHx8fDE3NzQyNjc2ODV8MA&ixlib=rb-4.1.0&q=80&w=600'],
    description: 'Đèn cầy thờ cúng size lớn 1kg, cháy bền lâu, không chảy sáp, màu đỏ truyền thống trang nghiêm.',
    category: 'Nhang - Nến',
    rating: 4.8,
    reviews: 112,
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Đèn Cầy Size Nhỏ (500g)',
    price: 49000,
    image: 'https://images.unsplash.com/photo-1701987432961-831aa2aa9b34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMHdoaXRlJTIwY2FuZGxlJTIwd2F4fGVufDF8fHx8MTc3NDI2NzY4NHww&ixlib=rb-4.1.0&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1701987432961-831aa2aa9b34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMHdoaXRlJTIwY2FuZGxlJTIwd2F4fGVufDF8fHx8MTc3NDI2NzY4NHww&ixlib=rb-4.1.0&q=80&w=600'],
    description: 'Đèn cầy thờ cúng size nhỏ 500g, tiện lợi, phù hợp bàn thờ nhỏ hoặc cúng hàng ngày.',
    category: 'Nhang - Nến',
    rating: 4.6,
    reviews: 95,
    inStock: true,
  },
];

export const combos: Combo[] = [
  {
    id: 'c4',
    name: 'Combo Cúng Giỗ Đầy Đủ',
    price: 67000,
    originalPrice: 80000,
    image: 'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    images: [
      'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    description: 'Bộ lễ vật cúng giỗ đầy đủ và trang trọng, thể hiện lòng thành kính với người đã khuất.',
    items: [
      'Nhang trầm hương (2 bó)',
      'Nến thờ (4 cặp)',
      'Hoa cúng tươi (3 bó)',
      'Giấy tiền vàng mã (2 bộ lớn)',
      'Quần áo giấy',
      'Rượu cúng (1 chai)',
      'Trái cây (7 loại)',
      'Muối gạo',
    ],
    occasion: 'Cúng giỗ',
    rating: 4.9,
    reviews: 98,
    badge: 'Cao cấp',
    inStock: true,
    usageGuide: 'Cúng giỗ thường tổ chức vào ngày giỗ theo lịch âm. Bày mâm cúng trang trọng với đầy đủ lễ vật, đọc văn khấn và mời hương linh về thụ lộc.',
  },
];

export const guideArticles = [
  {
    id: 'g1',
    title: 'Hướng Dẫn Cúng Rằm Tháng 7 Đúng Phong Tục',
    excerpt: 'Rằm tháng 7 là dịp lễ quan trọng trong văn hóa Việt Nam. Tìm hiểu cách cúng đúng cách để bày tỏ lòng thành kính.',
    content: 'Rằm tháng 7 (15/7 âm lịch) là ngày Vu Lan báo hiếu...',
    image: 'https://images.unsplash.com/photo-1656911051207-f36a904da6d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: null,
    relatedComboName: null,
    date: '10/07/2025',
    readTime: '5 phút',
    category: 'Nghi lễ',
  },
  {
    id: 'g2',
    title: 'Cách Bày Mâm Cúng Ông Công Ông Táo Chuẩn Nhất',
    excerpt: 'Lễ cúng Ông Công Ông Táo ngày 23 tháng Chạp cần chuẩn bị những gì? Hướng dẫn chi tiết từng bước.',
    content: 'Ông Công Ông Táo (Táo Quân) là vị thần cai quản bếp núc...',
    image: 'https://images.unsplash.com/photo-1769656123728-0f21b088e9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: null,
    relatedComboName: null,
    date: '15/12/2025',
    readTime: '7 phút',
    category: 'Nghi lễ',
  },
  {
    id: 'g3',
    title: 'Ý Nghĩa Và Cách Thắp Nhang Đúng Cách',
    excerpt: 'Thắp nhang là nghi thức quan trọng trong thờ cúng. Tìm hiểu ý nghĩa và những điều nên và không nên khi thắp nhang.',
    content: 'Nhang (hương) từ lâu đã là vật phẩm không thể thiếu...',
    image: 'https://images.unsplash.com/photo-1763386872951-676419afb0cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: null,
    relatedComboName: null,
    date: '05/01/2026',
    readTime: '4 phút',
    category: 'Kiến thức',
  },
  {
    id: 'g4',
    title: 'Lễ Cúng Tân Gia - Những Điều Cần Biết',
    excerpt: 'Chuyển vào nhà mới cần chuẩn bị những lễ vật gì? Hướng dẫn cúng tân gia đầy đủ theo phong tục Việt Nam.',
    content: 'Lễ cúng tân gia là nghi lễ quan trọng khi chuyển về nhà mới...',
    image: 'https://images.unsplash.com/photo-1713914565881-a0a806d97909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: null,
    relatedComboName: null,
    date: '20/01/2026',
    readTime: '6 phút',
    category: 'Nghi lễ',
  },
  {
    id: 'g5',
    title: 'Hướng Dẫn Chọn Nhang Thờ Phù Hợp',
    excerpt: 'Trên thị trường có nhiều loại nhang thờ khác nhau. Làm sao chọn đúng loại phù hợp với nhu cầu của bạn?',
    content: 'Nhang thờ có nhiều loại như nhang trầm, nhang vòng, nhang thẻ...',
    image: 'https://images.unsplash.com/photo-1724709166242-babd3cf2a9b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: null,
    relatedComboName: null,
    date: '15/02/2026',
    readTime: '3 phút',
    category: 'Kiến thức',
  },
  {
    id: 'g6',
    title: 'Cúng Giỗ - Phong Tục Thờ Cúng Tổ Tiên Người Việt',
    excerpt: 'Cúng giỗ là nét văn hóa đặc sắc của người Việt. Tìm hiểu về ý nghĩa và cách thực hiện lễ giỗ đúng truyền thống.',
    content: 'Lễ giỗ (kỵ nhật) là ngày tưởng nhớ người đã khuất...',
    image: 'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    relatedComboId: 'c4',
    relatedComboName: 'Combo Cúng Giỗ Đầy Đủ',
    date: '01/02/2026',
    readTime: '8 phút',
    category: 'Văn hóa',
  },
];

export const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
    content: 'Combo cúng giỗ rất đầy đủ và trang trọng, nhang thơm dịu, không hắc. Giao hàng nhanh chóng, đóng gói cẩn thận. Sẽ tiếp tục ủng hộ shop!',
    rating: 5,
    product: 'Combo Cúng Giỗ Đầy Đủ',
    date: '15/01/2026',
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
    content: 'Mâm cúng giỗ rất đầy đủ và trang trọng. Đặt hàng buổi sáng, chiều đã nhận được hàng. Cảm ơn shop đã tư vấn nhiệt tình!',
    rating: 5,
    product: 'Combo Cúng Giỗ Đầy Đủ',
    date: '10/08/2025',
  },
  {
    id: 3,
    name: 'Phạm Thị Hương',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
    content: 'Combo giỗ rất đẹp và đầy đủ. Hoa cúng tươi và thơm, lễ vật chỉnh chu. Cả gia đình đều hài lòng. Nhà mình sẽ đặt mỗi năm!',
    rating: 5,
    product: 'Combo Cúng Giỗ Đầy Đủ',
    date: '22/11/2025',
  },
  {
    id: 4,
    name: 'Lê Quang Hùng',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
    content: 'Giá cả hợp lý, sản phẩm đúng mô tả. Tôi đặt combo cúng giỗ cho bố, mọi người trong gia đình đều khen. Rất hài lòng!',
    rating: 4,
    product: 'Combo Cúng Giỗ Đầy Đủ',
    date: '05/12/2025',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'DH001234',
    date: '18/02/2026',
    status: 'delivered',
    items: [
      { id: 'c4', type: 'combo', name: 'Combo Cúng Giỗ Đầy Đủ', price: 40000, image: 'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100', quantity: 1 },
    ],
    total: 70000,
    shippingInfo: { name: 'Nguyễn Văn A', phone: '0912345678', address: '123 Lê Lợi, Q.1, TP.HCM', notes: '' },
    paymentMethod: 'cod',
    estimatedDelivery: '20/02/2026',
  },
  {
    id: 'DH001189',
    date: '10/01/2026',
    status: 'delivered',
    items: [
      { id: 'c4', type: 'combo', name: 'Combo Cúng Giỗ Đầy Đủ', price: 40000, image: 'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100', quantity: 2 },
    ],
    total: 110000,
    shippingInfo: { name: 'Nguyễn Văn A', phone: '0912345678', address: '123 Lê Lợi, Q.1, TP.HCM', notes: 'Giao giờ hành chính' },
    paymentMethod: 'bank',
    estimatedDelivery: '12/01/2026',
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const getStatusLabel = (status: Order['status']): string => {
  const labels = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
  };
  return labels[status];
};

export const getStatusColor = (status: Order['status']): string => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50',
    processing: 'text-blue-600 bg-blue-50',
    shipping: 'text-orange-600 bg-orange-50',
    delivered: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
  };
  return colors[status];
};