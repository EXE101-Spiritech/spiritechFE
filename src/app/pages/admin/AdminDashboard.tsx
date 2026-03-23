import { ShoppingCart, DollarSign, Package, Calendar, Users, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { salesData, adminOrders, adminEvents, adminUsers } from '../../data/adminData';
import { products, combos, formatCurrency } from '../../data/index';

const recentSales = salesData.slice(-14);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
        <Icon size={20} style={{ color }} />
      </div>
      <TrendingUp size={14} className="text-green-400" />
    </div>
    <p className="text-2xl font-semibold text-gray-900 mb-0.5">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-semibold" style={{ color: '#cc323f' }}>
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-gray-500">{payload[1]?.value} đơn</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = adminOrders.length + 10;
  const activeProducts = products.filter(p => p.inStock).length + combos.filter(c => c.inStock).length;
  const upcomingEvents = adminEvents.length;
  const totalUsers = adminUsers.length;

  const recentOrders = adminOrders.slice(0, 5);

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      completed: { label: 'Hoàn thành', color: '#16a34a', bg: '#f0fdf4' },
      paid: { label: 'Đã thanh toán', color: '#2563eb', bg: '#eff6ff' },
      pending: { label: 'Chờ xử lý', color: '#d97706', bg: '#fffbeb' },
    };
    const s = map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{ color: s.color, background: s.bg }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      {/* Greeting */}
      <div>
        <h2 className="text-xl text-gray-900 font-semibold" style={{ fontFamily: 'Lora, serif' }}>
          Xin chào, Admin! 👋
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Hôm nay là Thứ Bảy, 21 tháng 3, 2026. Đây là tổng quan hoạt động của bạn.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={totalOrders.toString()}
          sub="+8 hôm nay"
          color="#cc323f"
          bgColor="rgba(204,50,63,0.1)"
        />
        <MetricCard
          icon={DollarSign}
          label="Doanh thu tháng"
          value={formatCurrency(totalRevenue).replace('₫', '')}
          sub="+12% so với tháng trước"
          color="#16a34a"
          bgColor="rgba(22,163,74,0.1)"
        />
        <MetricCard
          icon={Package}
          label="Sản phẩm hoạt động"
          value={activeProducts.toString()}
          sub="4 sắp hết hàng"
          color="#2563eb"
          bgColor="rgba(37,99,235,0.1)"
        />
        <MetricCard
          icon={Calendar}
          label="Sự kiện sắp tới"
          value={upcomingEvents.toString()}
          sub="1 diễn ra trong 30 ngày"
          color="#d97706"
          bgColor="rgba(217,119,6,0.1)"
        />
        <MetricCard
          icon={Users}
          label="Người dùng"
          value={totalUsers.toString()}
          sub="+3 tuần này"
          color="#7c3aed"
          bgColor="rgba(124,58,237,0.1)"
        />
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
                Doanh thu 14 ngày gần nhất
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">Xu hướng bán hàng theo ngày</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={recentSales} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="xaxis" dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip key="tooltip" content={<CustomTooltip />} />
              <Line
                key="revenue"
                type="monotone" dataKey="revenue" stroke="#cc323f" strokeWidth={2.5}
                dot={{ r: 3, fill: '#cc323f', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#cc323f' }}
              />
              <Line
                key="orders"
                type="monotone" dataKey="orders" stroke="#e6bb0c" strokeWidth={2}
                dot={false} strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 rounded-full inline-block" style={{ background: '#cc323f' }} />
              <span className="text-xs text-gray-400">Doanh thu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 rounded-full inline-block border-t-2 border-dashed" style={{ background: '#e6bb0c' }} />
              <span className="text-xs text-gray-400">Số đơn</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
              Đơn hàng gần đây
            </h3>
            <a href="/admin/orders" className="text-xs hover:underline" style={{ color: '#cc323f' }}>
              Xem tất cả →
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">#{order.id}</p>
                  <p className="text-xs text-gray-400 truncate">{order.customer}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  {statusBadge(order.orderStatus)}
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}