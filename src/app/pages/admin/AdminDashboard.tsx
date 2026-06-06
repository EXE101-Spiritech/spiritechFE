import { useState, useEffect } from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../data/index";
import { adminApi } from "@/features/admin/api";
import type {
  AdminDashboard,
  RevenueResponse,
  RevenueDataPoint,
} from "@/shared/types";

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
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bgColor }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <TrendingUp size={14} className="text-green-400" />
    </div>
    <p className="text-2xl font-semibold text-gray-900 mb-0.5">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && (
      <p className="text-xs mt-1" style={{ color }}>
        {sub}
      </p>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-semibold" style={{ color: "#cc323f" }}>
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-gray-500">{payload[1]?.value} đơn</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load independently so one failure doesn't block the other
    adminApi
      .dashboard()
      .then(setDash)
      .catch(() => {});
    adminApi
      .revenue(14)
      .then(setRevenue)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="text-center py-20 text-gray-400">
        Không thể tải dữ liệu.
      </div>
    );
  }

  const chartData =
    revenue?.by_date?.map((d) => ({
      date: d.date.slice(5, 10),
      revenue: d.revenue_vnd,
      orders: d.orders,
    })) || [];

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
    >
      <div>
        <h2
          className="text-xl text-gray-900 font-semibold"
          style={{ fontFamily: "Lora, serif" }}
        >
          Bảng điều khiển 🕯️
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Tổng quan hoạt động kinh doanh
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          icon={ShoppingCart}
          label="Tổng đơn hàng"
          value={dash.total_orders.toLocaleString()}
          color="#cc323f"
          bgColor="rgba(204,50,63,0.1)"
        />
        <MetricCard
          icon={DollarSign}
          label="Doanh thu đã thu"
          sub="Từ payment captured"
          value={formatCurrency(dash.total_revenue_vnd).replace("₫", "") + "₫"}
          color="#16a34a"
          bgColor="rgba(22,163,74,0.1)"
        />
        <MetricCard
          icon={Package}
          label="Sản phẩm"
          value={dash.total_products.toString()}
          color="#2563eb"
          bgColor="rgba(37,99,235,0.1)"
        />
        <MetricCard
          icon={Calendar}
          label="Đơn đang xử lý"
          sub="paid + confirmed + fulfilling"
          value={dash.pending_orders.toString()}
          color="#d97706"
          bgColor="rgba(217,119,6,0.1)"
        />
        <MetricCard
          icon={Users}
          label="Người dùng"
          value={dash.total_users.toString()}
          color="#7c3aed"
          bgColor="rgba(124,58,237,0.1)"
        />
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                Doanh thu 14 ngày gần nhất
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                Xu hướng bán hàng theo ngày
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
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
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#cc323f"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#cc323f", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#cc323f" }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#e6bb0c"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-0.5 rounded-full inline-block"
                style={{ background: "#cc323f" }}
              />
              <span className="text-xs text-gray-400">Doanh thu</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-0.5 rounded-full inline-block border-t-2 border-dashed"
                style={{ background: "#e6bb0c" }}
              />
              <span className="text-xs text-gray-400">Số đơn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
