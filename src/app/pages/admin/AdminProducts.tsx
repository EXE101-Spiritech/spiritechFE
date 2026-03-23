import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Eye, EyeOff } from 'lucide-react';
import { products as initialProducts, combos as initialCombos, CATEGORIES, formatCurrency } from '../../data/index';

interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'hidden';
  image: string;
  description: string;
}

const toAdminProducts = (): AdminProduct[] => [
  ...initialProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, stock: Math.floor(Math.random() * 150) + 5, status: 'active' as const, image: p.image, description: p.description })),
  ...initialCombos.map(c => ({ id: c.id, name: c.name, category: 'Combo', price: c.price, stock: Math.floor(Math.random() * 60) + 5, status: 'active' as const, image: c.image, description: c.description })),
];

const EMPTY_FORM: Omit<AdminProduct, 'id'> = {
  name: '',
  category: 'Nhang - Nến',
  price: 0,
  stock: 0,
  status: 'active',
  image: '',
  description: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>(toAdminProducts);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Tất cả');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AdminProduct, 'id'>>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allCats = ['Tất cả', ...CATEGORIES.filter(c => c !== 'Tất cả'), 'Combo'];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tất cả' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, status: p.status, image: p.image, description: p.description });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    if (editingId) {
      setProducts(ps => ps.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      const newId = 'p' + Date.now();
      setProducts(ps => [...ps, { id: newId, ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(ps => ps.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const toggleStatus = (id: string) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'hidden' : 'active' } : p));
  };

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Sản phẩm</h2>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #cc323f, #902131)' }}
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <select
          value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
        >
          {allCats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#faf9f8' }} className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Sản phẩm</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">Danh mục</th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium">Giá</th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">Tồn kho</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Trạng thái</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                      <p className="font-medium text-gray-800 line-clamp-2 text-sm">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs" style={{ background: '#fdf8f0', color: '#902131' }}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium" style={{ color: '#cc323f' }}>
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-600 hidden md:table-cell">
                    <span className={p.stock < 10 ? 'text-red-500 font-medium' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleStatus(p.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      style={p.status === 'active' ? { background: '#f0fdf4', color: '#16a34a' } : { background: '#f3f4f6', color: '#6b7280' }}>
                      {p.status === 'active' ? <><Eye size={11} /> Hiển thị</> : <><EyeOff size={11} /> Ẩn</>}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm nào.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tên sản phẩm *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Nhập tên sản phẩm..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Danh mục</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                    {allCats.filter(c => c !== 'Tất cả').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'hidden' }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                    <option value="active">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Giá bán (₫) *</label>
                  <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Số lượng tồn kho</label>
                  <input type="number" value={form.stock || ''} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">URL hình ảnh</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Mô tả sản phẩm</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả chi tiết sản phẩm..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #cc323f, #902131)' }}>
                {editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lora, serif' }}>Xóa sản phẩm?</h3>
              <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: '#cc323f' }}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}