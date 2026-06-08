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
  OrdersByStatus,
  UserEngagement,
  AIUsage,
} from "@/shared/types";

const RANGE_OPTIONS = [
  { label: "7 ngày", value: 7 },
  { label: "14 ngày", value: 14 },
  { label: "30 ngày", value: 30 },
];

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: "#d97706",
  paid: "#2563eb",
  confirmed: "#16a34a",
  fulfilling: "#7c3aed",
  shipped: "#cc323f",
  delivered: "#16a34a",
  cancelled: "#6b7280",
  refunded: "#6b7280",
  failed: "#dc2626",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  confirmed: "Đã xác nhận",
  fulfilling: "Đang chuẩn bị",
  shipped: "Đã giao",
  delivered: "Đã nhận",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn",
  failed: "Thất bại",
};

function MetricCard({ icon: Icon, label, value, sub, color, bgColor }: any) {
  return (
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
}

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
  const [range, setRange] = useState(14);
  const [revData, setRevData] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus | null>(
    null,
  );
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [aiUsage, setAIUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setDash)
      .catch(() => {});
    adminApi
      .revenue(14)
      .then(setRevenue)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.revenue(range).catch(() => null),
      adminApi.ordersByStatus().catch(() => null),
      adminApi.userEngagement(range).catch(() => null),
      adminApi.aiUsage(range).catch(() => null),
    ])
      .then(([r, obs, ue, ai]) => {
        if (r) {
          setRevData(
            (r.by_date || []).map((d: any) => ({
              date: d.date.slice(5, 10),
              revenue: d.revenue_vnd,
              orders: d.orders,
            })),
          );
        }

        if (obs) setOrdersByStatus(obs);
        if (ue) setEngagement(ue);
        if (ai) setAIUsage(ai);
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
      value: totalOrders.toLocaleString(),
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
  ];

  if (loading && !dash)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
    >
      {/* Header + Range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl text-gray-900 font-semibold"
            style={{ fontFamily: "Lora, serif" }}
          >
            Bảng điều khiển
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Tổng quan hoạt động kinh doanh
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

      {/* Metric cards */}
      {dash && (
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
            value={
              formatCurrency(dash.total_revenue_vnd).replace("₫", "") + "₫"
            }
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
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Revenue chart */}
      {revData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3
            className="font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Lora, serif" }}
          >
            Xu hướng doanh thu
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={revData}
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
                dot={{ r: 3, fill: "#cc323f" }}
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
        </div>
      )}

      {/* User Engagement */}
      {engagement && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3
            className="font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Lora, serif" }}
          >
            Tương tác người dùng
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Xem sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement.product_views.total}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {engagement.product_views.daily_avg.toFixed(1)}/ngày
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Tìm kiếm</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement.searches.total}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {engagement.searches.zero_result_rate.toFixed(0)}% không kết quả
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Thêm vào giỏ</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement.add_to_carts.total}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {engagement.add_to_carts.daily_avg.toFixed(1)}/ngày
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Bỏ giỏ hàng</p>
              <p className="text-2xl font-bold" style={{ color: "#d97706" }}>
                {engagement.cart_abandonment.rate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {engagement.cart_abandonment.abandoned_count} bỏ /{" "}
                {engagement.cart_abandonment.completed_count} hoàn tất
              </p>
            </div>
          </div>
          {engagement.searches.top_queries.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Top tìm kiếm
              </p>
              <div className="flex flex-wrap gap-2">
                {engagement.searches.top_queries.map((q: any, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    "{q.query}" ({q.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Usage */}
      {aiUsage && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3
            className="font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Lora, serif" }}
          >
            Sử dụng AI
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Phiên</p>
              <p className="text-2xl font-bold text-gray-900">
                {aiUsage.sessions.total}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {aiUsage.sessions.active} đang hoạt động
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Tin nhắn</p>
              <p className="text-2xl font-bold text-gray-900">
                {aiUsage.messages.total}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {aiUsage.messages.daily_avg.toFixed(1)}/ngày
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {(
                  aiUsage.tokens.input_tokens + aiUsage.tokens.output_tokens
                ).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {aiUsage.tokens.input_tokens.toLocaleString()} input /{" "}
                {aiUsage.tokens.output_tokens.toLocaleString()} output
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Chi phí AI</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(aiUsage.tokens.total_cost_cents / 10000).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {aiUsage.tokens.output_tokens.toLocaleString()} output tokens
              </p>
            </div>
          </div>
          {(aiUsage.tools || []).length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Chi tiết công cụ AI
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{ background: "#faf9f8" }}
                      className="border-b border-gray-100"
                    >
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">
                        Công cụ
                      </th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium">
                        Lần gọi
                      </th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium">
                        Lỗi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(aiUsage.tools || []).map((t: any) => (
                      <tr key={t.tool_name}>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                          {t.tool_name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-900">
                          {t.count}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className={
                              t.failures > 0
                                ? "text-red-500 font-medium"
                                : "text-gray-400"
                            }
                          >
                            {t.failures}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
