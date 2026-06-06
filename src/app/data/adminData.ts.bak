// Admin Panel Mock Data

export interface AdminOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'pending' | 'paid' | 'completed';
  items: { name: string; qty: number; price: number }[];
  shipping: {
    name: string;
    address: string;
    phone: string;
    method: 'standard' | 'express';
  };
}

export interface AdminEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  registeredUsers: number;
  image: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'active' | 'disabled';
  ordersCount: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const adminOrders: AdminOrder[] = [
  {
    id: 'DH002341',
    customer: 'Nguyễn Thị Lan',
    date: '21/03/2026',
    total: 40000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Nguyễn Thị Lan', address: '15 Trần Hưng Đạo, Q.1, TP.HCM', phone: '0901234567', method: 'express' },
  },
  {
    id: 'DH002340',
    customer: 'Trần Văn Minh',
    date: '20/03/2026',
    total: 40000,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Trần Văn Minh', address: '88 Lý Tự Trọng, Q.3, TP.HCM', phone: '0912345678', method: 'standard' },
  },
  {
    id: 'DH002339',
    customer: 'Phạm Thị Hương',
    date: '19/03/2026',
    total: 80000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 2, price: 40000 }],
    shipping: { name: 'Phạm Thị Hương', address: '22 Nguyễn Huệ, Q.1, TP.HCM', phone: '0978123456', method: 'express' },
  },
  {
    id: 'DH002338',
    customer: 'Lê Quang Hùng',
    date: '18/03/2026',
    total: 40000,
    paymentStatus: 'paid',
    orderStatus: 'paid',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Lê Quang Hùng', address: '55 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM', phone: '0934567890', method: 'standard' },
  },
  {
    id: 'DH002337',
    customer: 'Vũ Thị Mai',
    date: '17/03/2026',
    total: 40000,
    paymentStatus: 'failed',
    orderStatus: 'pending',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Vũ Thị Mai', address: '10 Hoàng Diệu, Q.4, TP.HCM', phone: '0956789012', method: 'standard' },
  },
  {
    id: 'DH002336',
    customer: 'Đỗ Minh Tuấn',
    date: '16/03/2026',
    total: 80000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 2, price: 40000 }],
    shipping: { name: 'Đỗ Minh Tuấn', address: '35 Bà Triệu, Hoàn Kiếm, Hà Nội', phone: '0967890123', method: 'express' },
  },
  {
    id: 'DH002335',
    customer: 'Hoàng Thị Thu',
    date: '15/03/2026',
    total: 40000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Hoàng Thị Thu', address: '7 Lê Thánh Tôn, Q.1, TP.HCM', phone: '0901111222', method: 'standard' },
  },
  {
    id: 'DH002334',
    customer: 'Bùi Văn Long',
    date: '14/03/2026',
    total: 40000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Bùi Văn Long', address: '99 Võ Thị Sáu, Q.3, TP.HCM', phone: '0922333444', method: 'standard' },
  },
  {
    id: 'DH002333',
    customer: 'Ngô Thị Phượng',
    date: '13/03/2026',
    total: 120000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 3, price: 40000 }],
    shipping: { name: 'Ngô Thị Phượng', address: '123 Giải Phóng, Hai Bà Trưng, Hà Nội', phone: '0945555666', method: 'express' },
  },
  {
    id: 'DH002332',
    customer: 'Đinh Thanh Tùng',
    date: '12/03/2026',
    total: 40000,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    items: [{ name: 'Combo Cúng Giỗ Đầy Đủ', qty: 1, price: 40000 }],
    shipping: { name: 'Đinh Thanh Tùng', address: '45 Phan Đăng Lưu, Q.Phú Nhuận, TP.HCM', phone: '0933777888', method: 'standard' },
  },
];

export const adminEvents: AdminEvent[] = [
  {
    id: 'ev001',
    name: 'Lễ Vu Lan Báo Hiếu 2026',
    description: 'Sự kiện Vu Lan lớn nhất trong năm, tổ chức nghi lễ dâng hương và cầu siêu cho người đã khuất. Mở cửa cho tất cả mọi người tham gia.',
    date: '30/08/2026',
    location: 'Chùa Vĩnh Nghiêm, Q.3, TP.HCM',
    capacity: 500,
    registeredUsers: 342,
    image: 'https://images.unsplash.com/photo-1656911051207-f36a904da6d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  },
  {
    id: 'ev002',
    name: 'Workshop: Cách Bày Mâm Cúng Đúng Chuẩn',
    description: 'Buổi workshop thực hành hướng dẫn cách bày mâm cúng theo từng dịp lễ truyền thống. Có phần hỏi đáp và tặng combo mẫu.',
    date: '15/04/2026',
    location: 'Trụ sở Spiritech, 100 Nguyễn Trãi, Q.1, TP.HCM',
    capacity: 50,
    registeredUsers: 47,
    image: 'https://images.unsplash.com/photo-1763386872951-676419afb0cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  },
  {
    id: 'ev003',
    name: 'Triển Lãm Đồ Thờ Cúng Truyền Thống',
    description: 'Triển lãm giới thiệu các sản phẩm đồ thờ cúng truyền thống từ ba miền Bắc - Trung - Nam. Có bán hàng trực tiếp và online.',
    date: '05/05/2026',
    location: 'Nhà Văn Hóa Thanh Niên, Q.1, TP.HCM',
    capacity: 200,
    registeredUsers: 89,
    image: 'https://images.unsplash.com/photo-1713914565881-a0a806d97909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  },
  {
    id: 'ev004',
    name: 'Lễ Cúng Rằm Tháng 4 Cộng Đồng',
    description: 'Cùng nhau tổ chức lễ cúng Rằm tháng 4 theo phong tục truyền thống. Spiritech cung cấp toàn bộ lễ vật và hướng dẫn nghi thức.',
    date: '11/05/2026',
    location: 'Online + Trụ sở Spiritech',
    capacity: 300,
    registeredUsers: 156,
    image: 'https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  },
  {
    id: 'ev005',
    name: 'Khóa Học: Nhận Biết Nhang Sạch - Nhang Độc Hại',
    description: 'Khóa học 2 buổi giúp người tiêu dùng phân biệt nhang thiên nhiên và nhang hóa học, bảo vệ sức khỏe gia đình.',
    date: '22/04/2026',
    location: 'Zoom Online',
    capacity: 100,
    registeredUsers: 73,
    image: 'https://images.unsplash.com/photo-1724709166242-babd3cf2a9b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  },
];

export const adminUsers: AdminUser[] = [
  { id: 'U001', email: 'nguyen***@gmail.com', phone: '090***7890', registrationDate: '15/01/2026', status: 'active', ordersCount: 5 },
  { id: 'U002', email: 'tran***@yahoo.com', phone: '091***3456', registrationDate: '18/01/2026', status: 'active', ordersCount: 3 },
  { id: 'U003', email: 'pham***@gmail.com', phone: '097***1234', registrationDate: '22/01/2026', status: 'active', ordersCount: 8 },
  { id: 'U004', email: 'le.***@hotmail.com', phone: '093***6789', registrationDate: '28/01/2026', status: 'active', ordersCount: 2 },
  { id: 'U005', email: 'vu_***@gmail.com', phone: '095***9012', registrationDate: '02/02/2026', status: 'disabled', ordersCount: 1 },
  { id: 'U006', email: 'do.***@gmail.com', phone: '096***0123', registrationDate: '05/02/2026', status: 'active', ordersCount: 6 },
  { id: 'U007', email: 'hoang***@gmail.com', phone: '090***1122', registrationDate: '10/02/2026', status: 'active', ordersCount: 4 },
  { id: 'U008', email: 'bui_***@gmail.com', phone: '092***3344', registrationDate: '14/02/2026', status: 'active', ordersCount: 2 },
  { id: 'U009', email: 'ngo.***@gmail.com', phone: '094***5566', registrationDate: '19/02/2026', status: 'active', ordersCount: 7 },
  { id: 'U010', email: 'dinh***@gmail.com', phone: '093***7788', registrationDate: '25/02/2026', status: 'disabled', ordersCount: 0 },
  { id: 'U011', email: 'mai.***@gmail.com', phone: '091***9900', registrationDate: '01/03/2026', status: 'active', ordersCount: 3 },
  { id: 'U012', email: 'thanh***@gmail.com', phone: '098***1122', registrationDate: '07/03/2026', status: 'active', ordersCount: 1 },
];

export const inventoryItems: InventoryItem[] = [
  { productId: 'c4', productName: 'Combo Cúng Giỗ Đầy Đủ', sku: 'CGD-C04', category: 'Combo', stock: 19, lowStockThreshold: 10 },
];

// Generate 30 days of sales data ending today (21/03/2026)
export const salesData: SalesDataPoint[] = [
  { date: '20/02', revenue: 3200000, orders: 4 },
  { date: '21/02', revenue: 2800000, orders: 3 },
  { date: '22/02', revenue: 4100000, orders: 5 },
  { date: '23/02', revenue: 5600000, orders: 7 },
  { date: '24/02', revenue: 3900000, orders: 5 },
  { date: '25/02', revenue: 7200000, orders: 9 },
  { date: '26/02', revenue: 8100000, orders: 10 },
  { date: '27/02', revenue: 4500000, orders: 6 },
  { date: '28/02', revenue: 3700000, orders: 5 },
  { date: '01/03', revenue: 6200000, orders: 8 },
  { date: '02/03', revenue: 5400000, orders: 7 },
  { date: '03/03', revenue: 4800000, orders: 6 },
  { date: '04/03', revenue: 9200000, orders: 12 },
  { date: '05/03', revenue: 7600000, orders: 9 },
  { date: '06/03', revenue: 5100000, orders: 6 },
  { date: '07/03', revenue: 8900000, orders: 11 },
  { date: '08/03', revenue: 6300000, orders: 8 },
  { date: '09/03', revenue: 4200000, orders: 5 },
  { date: '10/03', revenue: 5800000, orders: 7 },
  { date: '11/03', revenue: 7100000, orders: 9 },
  { date: '12/03', revenue: 3300000, orders: 4 },
  { date: '13/03', revenue: 6500000, orders: 8 },
  { date: '14/03', revenue: 4900000, orders: 6 },
  { date: '15/03', revenue: 8400000, orders: 10 },
  { date: '16/03', revenue: 6800000, orders: 8 },
  { date: '17/03', revenue: 5200000, orders: 7 },
  { date: '18/03', revenue: 9500000, orders: 12 },
  { date: '19/03', revenue: 7300000, orders: 9 },
  { date: '20/03', revenue: 8700000, orders: 11 },
  { date: '21/03', revenue: 6100000, orders: 8 },
];

export const topProductsData = [
  { name: 'Combo Cúng Giỗ Đầy Đủ', revenue: 8200000 },
];

export const cmsContent = {
  homepage: `Chào mừng đến với Spiritech - Nền tảng đồ cúng tâm linh hàng đầu Việt Nam.

Chúng tôi cung cấp đầy đủ các sản phẩm và combo đồ cúng chất lượng cao, được giao hàng nhanh chóng đến tận nhà. Với hơn 10.000 khách hàng tin tưởng, Spiritech cam kết mang đến những sản phẩm tốt nhất, giúp bạn thực hiện các nghi lễ tâm linh một cách trang trọng và đúng phong tục.`,
  about: `Spiritech được thành lập năm 2023 với sứ mệnh bảo tồn và phát huy các giá trị văn hóa tâm linh truyền thống của người Việt Nam.

Chúng tôi tin rằng mỗi nghi lễ là một cách để kết nối với nguồn cội, tưởng nhớ tổ tiên và cầu nguyện cho gia đình. Spiritech cung cấp đầy đủ từ các sản phẩm đơn lẻ đến các combo mâm cúng hoàn chỉnh, kèm theo hướng dẫn chi tiết để giúp bạn thực hiện đúng phong tục.`,
  events: `Spiritech thường xuyên tổ chức các sự kiện giáo dục và cộng đồng về văn hóa tâm linh Việt Nam.

Từ các buổi workshop thực hành, triển lãm đồ thờ, đến các lễ cúng cộng đồng - chúng tôi tạo ra không gian để mọi người cùng học hỏi, chia sẻ và gìn giữ bản sắc văn hóa dân tộc. Đăng ký tham gia các sự kiện sắp tới để không bỏ lỡ những trải nghiệm ý nghĩa.`,
};