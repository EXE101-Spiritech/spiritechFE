import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { formatCurrency } from "../../data/index";
import { adminApi } from "@/features/admin/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

const RANGE_OPTIONS = [
  { label: "7 ngày", value: 7 },
  { label: "14 ngày", value: 14 },
  { label: "30 ngày", value: 30 },
];

const SalesTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-500 mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          <p style={{ color: "#cc323f" }}>
            💰 {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p style={{ color: "#e6bb0c" }}>
            📦 {payload[1]?.value || 0} đơn hàng
          </p>
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
        <p style={{ color: "#cc323f" }}>
          {formatCurrency(payload[0]?.value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [range, setRange] = useState(14);
  const [revData, setRevData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.revenue(range), adminApi.topProducts(30, 10)])
      .then(([r, tp]) => {
        const chartData = r.by_date.map((d) => ({
          date: d.date.slice(5, 10),
          revenue: d.revenue_vnd,
          orders: d.orders,
        }));
        setRevData(chartData);

        const topData = tp.map((p) => ({
          name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name,
          revenue: p.revenue_vnd,
        }));
        setTopProducts(topData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const totalRevenue = revData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statCards = [
    {
      label: `Doanh thu (${range} ngày)`,
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "#cc323f",
      bg: "rgba(204,50,63,0.08)",
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "#2563eb",
      bg: "rgba(37,99,235,0.08)",
    },
    {
      label: "Giá trị đơn TB",
      value: formatCurrency(avgOrderValue),
      icon: TrendingUp,
      color: "#16a34a",
      bg: "rgba(22,163,74,0.08)",
    },
    {
      label: "Sản phẩm bán chạy",
      value: topProducts.length.toString(),
      icon: TrendingUp,
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.08)",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Thống kê & Báo cáo
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Phân tích dữ liệu bán hàng
          </p>
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 text-sm transition-colors ${i > 0 ? "border-l border-gray-200" : ""}`}
              style={
                range === opt.value
                  ? { background: "#cc323f", color: "#fff" }
                  : { color: "#6b7280" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {card.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Sales Trend Chart */}
      {revData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="mb-5">
            <h3
              className="font-semibold text-gray-900"
              style={{ fontFamily: "Lora, serif" }}
            >
              Xu hướng doanh thu
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {range} ngày gần nhất
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={revData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<SalesTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#cc323f"
                strokeWidth={2.5}
                name="revenue"
                dot={{ r: 3, fill: "#cc323f", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#cc323f" }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#e6bb0c"
                strokeWidth={2}
                name="orders"
                dot={false}
                strokeDasharray="5 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products Chart */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-5">
            <h3
              className="font-semibold text-gray-900"
              style={{ fontFamily: "Lora, serif" }}
            >
              Sản phẩm bán chạy nhất
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Doanh thu theo sản phẩm
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {topProducts.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      index === 0
                        ? "#cc323f"
                        : index === 1
                          ? "#902131"
                          : index < 4
                            ? "#e6bb0c"
                            : "#e2d5c8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
