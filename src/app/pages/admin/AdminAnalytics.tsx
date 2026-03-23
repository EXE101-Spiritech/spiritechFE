import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts';
import { salesData, topProductsData, adminOrders } from '../../data/adminData';
import { formatCurrency } from '../../data/index';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';

const RANGE_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '14 ngày', value: 14 },
  { label: '30 ngày', value: 30 },
];

const SalesTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-500 mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          <p style={{ color: '#cc323f' }}>💰 {formatCurrency(payload[0]?.value || 0)}</p>
          <p style={{ color: '#e6bb0c' }}>📦 {payload[1]?.value || 0} đơn hàng</p>
        </div>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-800 font-medium mb-1">{label}</p>
        <p style={{ color: '#cc323f' }}>{formatCurrency(payload[0]?.value || 0)}</p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [range, setRange] = useState(14);

  const displayData = salesData.slice(-range);

  const totalRevenue = displayData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = displayData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevRevenue = salesData.slice(-range * 2, -range).reduce((s, d) => s + d.revenue, 0);
  const revGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const completedOrders = adminOrders.filter(o => o.orderStatus === 'completed').length;

  const statCards = [
    {
      label: `Doanh thu (${range} ngày)`,
      value: formatCurrency(totalRevenue),
      growth: revGrowth,
      icon: DollarSign,
      color: '#cc323f',
      bg: 'rgba(204,50,63,0.08)',
    },
    {
      label: 'Tổng đơn hàng',
      value: totalOrders.toString(),
      growth: 8.3,
      icon: ShoppingCart,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
    },
    {
      label: 'Giá trị đơn TB',
      value: formatCurrency(avgOrderValue),
      growth: 4.1,
      icon: TrendingUp,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.08)',
    },
    {
      label: 'Đơn hoàn thành',
      value: completedOrders.toString(),
      growth: 12.5,
      icon: TrendingUp,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.08)',
    },
  ];

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Thống kê & Báo cáo</h2>
          <p className="text-sm text-gray-500 mt-0.5">Phân tích dữ liệu bán hàng của Spiritech</p>
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 text-sm transition-colors ${i > 0 ? 'border-l border-gray-200' : ''}`}
              style={range === opt.value ? { background: '#cc323f', color: '#fff' } : { color: '#6b7280' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(card.growth).toFixed(1)}%
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 truncate">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="mb-5">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
            Xu hướng doanh thu
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">{range} ngày gần nhất</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={displayData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid key="lc-grid" strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis key="lc-xaxis" dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis key="lc-yaxis" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip key="lc-tooltip" content={<SalesTooltip />} />
            <Legend
              key="lc-legend"
              formatter={(val) => val === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '16px' }}
            />
            <Line
              key="lc-revenue"
              type="monotone" dataKey="revenue" stroke="#cc323f" strokeWidth={2.5} name="revenue"
              dot={{ r: 3, fill: '#cc323f', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#cc323f' }}
            />
            <Line
              key="lc-orders"
              type="monotone" dataKey="orders" stroke="#e6bb0c" strokeWidth={2} name="orders"
              dot={false} strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-5">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
            Sản phẩm bán chạy nhất
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">Doanh thu theo sản phẩm (tháng 3/2026)</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid key="bc-grid" strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis key="bc-xaxis" type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
            <YAxis key="bc-yaxis" type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={130} />
            <Tooltip key="bc-tooltip" content={<BarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar key="bc-bar" dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {topProductsData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={index === 0 ? '#cc323f' : index === 1 ? '#902131' : index < 4 ? '#e6bb0c' : '#e2d5c8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#cc323f' }} />
            <span className="text-xs text-gray-400">#1 Bán chạy nhất</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#e6bb0c' }} />
            <span className="text-xs text-gray-400">Top 3-4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#e2d5c8' }} />
            <span className="text-xs text-gray-400">Còn lại</span>
          </div>
        </div>
      </div>
    </div>
  );
}