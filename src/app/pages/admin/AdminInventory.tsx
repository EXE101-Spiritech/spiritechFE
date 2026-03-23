import { useState } from 'react';
import { Minus, Plus, AlertTriangle, Search, RefreshCw, PackageCheck } from 'lucide-react';
import { inventoryItems as initialItems } from '../../data/adminData';
import type { InventoryItem } from '../../data/adminData';

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'ok'>('all');
  const [restockModal, setRestockModal] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  const adjust = (id: string, delta: number) => {
    setItems(items => items.map(i => i.productId === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i));
  };

  const restock = () => {
    if (!restockModal) return;
    setItems(items => items.map(i => i.productId === restockModal.productId ? { ...i, stock: i.stock + restockQty } : i));
    setRestockModal(null);
    setRestockQty(50);
  };

  const lowCount = items.filter(i => i.stock < i.lowStockThreshold).length;

  const filtered = items.filter(i => {
    const matchSearch = i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());
    const isLow = i.stock < i.lowStockThreshold;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'low' ? isLow : !isLow);
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Kho hàng</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} mặt hàng trong kho</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <PackageCheck size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Tổng mặt hàng</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500">Sắp hết hàng</span>
          </div>
          <p className="text-2xl font-semibold" style={{ color: lowCount > 0 ? '#d97706' : '#16a34a' }}>{lowCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Đủ hàng</span>
          </div>
          <p className="text-2xl font-semibold text-green-600">{items.length - lowCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SKU..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {(['all', 'low', 'ok'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 text-sm transition-colors ${i > 0 ? 'border-l border-gray-200' : ''}`}
              style={filterStatus === s ? { background: '#cc323f', color: '#fff' } : { color: '#6b7280' }}
            >
              {s === 'all' ? 'Tất cả' : s === 'low' ? '⚠️ Sắp hết' : '✅ Đủ hàng'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#faf9f8' }} className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Sản phẩm</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">SKU</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">Danh mục</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Tồn kho</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Trạng thái</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Điều chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => {
                const isLow = item.stock < item.lowStockThreshold;
                const isOut = item.stock === 0;
                return (
                  <tr
                    key={item.productId}
                    className={`transition-colors ${isLow ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
                        <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden sm:table-cell">{item.sku}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fdf8f0', color: '#902131' }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-base font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                        {item.stock}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">/ ngưỡng {item.lowStockThreshold}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">Hết hàng</span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                          <AlertTriangle size={10} /> Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">Còn hàng</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => adjust(item.productId, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          onClick={() => { setRestockModal(item); setRestockQty(50); }}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                          style={{ background: '#cc323f' }}
                        >
                          Nhập
                        </button>
                        <button
                          onClick={() => adjust(item.productId, 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Không có mặt hàng nào.</div>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Nhập hàng</h3>
              <button onClick={() => setRestockModal(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <span className="text-sm">✕</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{restockModal.productName}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Tồn hiện tại:</span>
              <span className="font-semibold">{restockModal.stock}</span>
            </div>
            <label className="block text-sm text-gray-700 mb-1.5">Số lượng nhập thêm</label>
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setRestockQty(q => Math.max(1, q - 10))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <Minus size={14} />
              </button>
              <input
                type="number" value={restockQty} min={1}
                onChange={e => setRestockQty(Math.max(1, +e.target.value))}
                className="flex-1 text-center border border-gray-200 rounded-xl py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <button onClick={() => setRestockQty(q => q + 10)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <Plus size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Sau nhập: <span className="font-semibold text-gray-900">{restockModal.stock + restockQty}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRestockModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={restock}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: '#cc323f' }}>
                Xác nhận nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
