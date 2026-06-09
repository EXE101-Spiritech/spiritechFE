import { useState, useEffect, useMemo } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../data/index";
import { adminApi } from "@/features/admin/api";
import type { AdminDashboard, UserEngagement, AIUsage } from "@/shared/types";

const RANGE_OPTIONS = [
  { label: "7 ngày", value: 7 },
  { label: "14 ngày", value: 14 },
  { label: "30 ngày", value: 30 },
  { label: "45 ngày", value: 45 },
  { label: "60 ngày", value: 60 },
  { label: "90 ngày", value: 90 },
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

type Tab = "overview" | "imports";

// ─── Mock Import Data ────────────────────────────────────────────────────────────

interface ImportRecord {
  date: string;
  dateLabel: string;
  product_count: number;
  total_value_vnd: number;
  categories: { name: string; count: number; value: number }[];
}

const CATEGORIES = [
  "Tinh dầu",
  "Trầm hương",
  "Nhang vòng",
  "Nhang nụ",
  "Quà tặng",
  "Phụ kiện",
];

function generateMockImportData(days: number): ImportRecord[] {
  const records: ImportRecord[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateLabel = d.toISOString().slice(5, 10);
    const date = d.toISOString().slice(0, 10);

    const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
    const pseudoRand = (min: number, max: number) => {
      const r = ((seed * 9301 + 49297) % 233280) / 233280;
      return Math.floor(min + r * (max - min));
    };

    const catCount = pseudoRand(2, 5);
    const shuffled = [...CATEGORIES].sort(() => (seed % 3) - 1);
    const categories = shuffled.slice(0, catCount).map((name) => {
      const count = pseudoRand(10, 80);
      const unitPrice = pseudoRand(15000, 80000);
      return { name, count, value: count * unitPrice };
    });

    const product_count = categories.reduce((s, c) => s + c.count, 0);
    const total_value_vnd = categories.reduce((s, c) => s + c.value, 0);

    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    records.push({
      date,
      dateLabel,
      product_count,
      total_value_vnd,
      categories,
    });
  }
  return records;
}

const ImportTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-semibold" style={{ color: "#2563eb" }}>
          Nhập: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-gray-500">{payload[1]?.value} sản phẩm</p>
      </div>
    );
  }
  return null;
};

// ─── Component ───────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dash, setDash] = useState<AdminDashboard | null>(null);

  const [range, setRange] = useState(14);
  const [revData, setRevData] = useState<any[]>([]);

  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [aiUsage, setAIUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setDash)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.revenue({ days: range, period: "daily" }).catch(() => null),
      adminApi.userEngagement(range).catch(() => null),
      adminApi.aiUsage(range).catch(() => null),
    ])
      .then(([r, ue, ai]) => {
        if (r && Array.isArray(r)) {
          // Build a map of API data keyed by date
          const dataMap = new Map<
            string,
            { revenue: number; orders: number }
          >();
          r.forEach((d: any) => {
            dataMap.set(d.date, {
              revenue: d.revenue_vnd || 0,
              orders: d.orders || 0,
            });
          });

          // Fill in all dates in range with zeros for missing ones
          const filled: { date: string; revenue: number; orders: number }[] =
            [];
          const today = new Date();
          for (let i = range - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const existing = dataMap.get(key);
            filled.push({
              date: key.slice(5, 10),
              revenue: existing?.revenue || 0,
              orders: existing?.orders || 0,
            });
          }
          setRevData(filled);
        }

        if (ue) setEngagement(ue);
        if (ai) setAIUsage(ai);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  // ─── Mock import data (regenerates when range changes) ──────────────
  const [importData, setImportData] = useState<ImportRecord[]>([]);
  useEffect(() => {
    setImportData(generateMockImportData(range));
  }, [range]);

  const importSummary = useMemo(() => {
    if (importData.length === 0) return null;
    const totalValue = importData.reduce((s, r) => s + r.total_value_vnd, 0);
    const totalProducts = importData.reduce((s, r) => s + r.product_count, 0);
    const days = importData.length;
    return { totalValue, totalProducts, avgDaily: totalValue / days };
  }, [importData]);

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
      {/* Tab bar + Range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setTab("overview")}
            className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
              tab === "overview"
                ? "bg-[#cc323f] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setTab("imports")}
            className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
              tab === "imports"
                ? "bg-[#cc323f] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Nhập kho
          </button>
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

      {tab === "overview" && (
        <>
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
                sub="Từ cổng PAYOS"
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
                    domain={[0, "auto"]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}tr`
                        : `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#cc323f"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "#cc323f" }}
                    animationDuration={300}
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
                  <p className="text-xs text-gray-500 mb-1">Lượt xem trang</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(engagement.page_views?.total ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(engagement.page_views?.daily_avg ?? 0).toFixed(1)}/ngày
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Tìm kiếm</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagement.searches?.total ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(engagement.searches?.zero_result_rate ?? 0).toFixed(0)}%
                    không kết quả
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Thêm vào giỏ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {engagement.add_to_carts?.total ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(engagement.add_to_carts?.daily_avg ?? 0).toFixed(1)}/ngày
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Bỏ giỏ hàng</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#d97706" }}
                  >
                    {(engagement.cart_abandonment?.rate ?? 0).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {engagement.cart_abandonment?.abandoned_count ?? 0} bỏ /{" "}
                    {engagement.cart_abandonment?.completed_count ?? 0} hoàn tất
                  </p>
                </div>
              </div>
              {engagement.searches.top_queries.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Top tìm kiếm
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {engagement.searches.top_queries.map(
                      (q: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                        >
                          "{q.query}" ({q.count})
                        </span>
                      ),
                    )}
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
                  <p className="text-xs text-gray-500 mb-1">Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(
                      (aiUsage.tokens?.input_tokens ?? 0) +
                      (aiUsage.tokens?.output_tokens ?? 0)
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(aiUsage.tokens?.input_tokens ?? 0).toLocaleString()} input
                    / {(aiUsage.tokens?.output_tokens ?? 0).toLocaleString()}{" "}
                    output
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Chi phí AI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {((aiUsage.tokens?.total_cost_cents ?? 0) / 1000).toFixed(
                      2,
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(aiUsage.tokens?.output_tokens ?? 0).toLocaleString()}{" "}
                    output tokens
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
        </>
      )}

      {tab === "imports" && (
        <>
          {/* Summary cards */}
          {importSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tổng giá trị nhập</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(importSummary.totalValue)}
                </p>
                <p className="text-xs text-green-600 mt-1">{range} ngày qua</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Sản phẩm đã nhập</p>
                <p className="text-2xl font-bold text-gray-900">
                  {importSummary.totalProducts.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Trung bình{" "}
                  {Math.round(
                    importSummary.totalProducts / importData.length,
                  ).toLocaleString()}{" "}
                  sản phẩm/ngày
                </p>
              </div>
            </div>
          )}

          {/* Import bar chart */}
          {importData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3
                className="font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Lora, serif" }}
              >
                Giá trị nhập kho theo ngày
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={importData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}tr`
                        : `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<ImportTooltip />} />
                  <Bar
                    dataKey="total_value_vnd"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    animationDuration={400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detail table */}
          {importData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3
                className="font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "Lora, serif" }}
              >
                Chi tiết nhập kho
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{ background: "#faf9f8" }}
                      className="border-b border-gray-100"
                    >
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">
                        Ngày
                      </th>
                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium">
                        SL sản phẩm
                      </th>
                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium">
                        Tổng giá trị
                      </th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">
                        Danh mục
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importData.map((rec) => (
                      <tr key={rec.date} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                          {rec.dateLabel}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {rec.product_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(rec.total_value_vnd)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {rec.categories.map((cat) => (
                              <span
                                key={cat.name}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                              >
                                {cat.name}{" "}
                                <span className="text-blue-400">
                                  {cat.count}
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Dữ liệu mô phỏng — thay thế bằng dữ liệu thực từ API sau
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
