import { useState } from 'react';
import { Search, UserX, UserCheck, Users, ShieldCheck, ShieldOff } from 'lucide-react';
import { adminUsers as initialUsers } from '../../data/adminData';
import type { AdminUser } from '../../data/adminData';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');

  const toggleStatus = (id: string) => {
    setUsers(us => us.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u
    ));
  };

  const filtered = users.filter(u => {
    const matchSearch = u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = users.filter(u => u.status === 'active').length;
  const disabledCount = users.filter(u => u.status === 'disabled').length;

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Người dùng</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} tài khoản đã đăng ký</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Tổng cộng</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Đang hoạt động</span>
          </div>
          <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <ShieldOff size={16} className="text-red-500" />
            <span className="text-xs text-gray-500">Đã vô hiệu</span>
          </div>
          <p className="text-2xl font-semibold text-red-500">{disabledCount}</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-4">
        <span className="text-lg mt-0.5">🔒</span>
        <div>
          <p className="text-sm font-medium text-blue-800">Bảo vệ thông tin cá nhân</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Thông tin nhạy cảm (email, SĐT) được ẩn một phần để bảo vệ quyền riêng tư người dùng theo quy định.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo ID hoặc email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {(['all', 'active', 'disabled'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 text-sm transition-colors ${i > 0 ? 'border-l border-gray-200' : ''}`}
              style={filterStatus === s ? { background: '#cc323f', color: '#fff' } : { color: '#6b7280' }}
            >
              {s === 'all' ? 'Tất cả' : s === 'active' ? '✅ Hoạt động' : '🚫 Vô hiệu'}
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
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">User ID</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">Số điện thoại</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">Ngày đăng ký</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden lg:table-cell">Đơn hàng</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Trạng thái</th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr
                  key={user.id}
                  className={`transition-colors ${user.status === 'disabled' ? 'bg-gray-50/60 opacity-70' : 'hover:bg-gray-50/50'}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">{user.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: user.status === 'active' ? 'linear-gradient(135deg, #cc323f, #902131)' : '#9ca3af' }}>
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-mono text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-gray-500 text-sm hidden sm:table-cell">{user.phone}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{user.registrationDate}</td>
                  <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                      style={{ background: user.ordersCount > 0 ? 'rgba(204,50,63,0.1)' : '#f3f4f6', color: user.ordersCount > 0 ? '#cc323f' : '#9ca3af' }}>
                      {user.ordersCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={user.status === 'active'
                        ? { background: '#f0fdf4', color: '#16a34a' }
                        : { background: '#f3f4f6', color: '#9ca3af' }
                      }
                    >
                      {user.status === 'active' ? '● Hoạt động' : '● Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={user.status === 'active'
                        ? { borderColor: '#fca5a5', color: '#dc2626', background: '#fff' }
                        : { borderColor: '#86efac', color: '#16a34a', background: '#fff' }
                      }
                    >
                      {user.status === 'active'
                        ? <><UserX size={12} /> Vô hiệu</>
                        : <><UserCheck size={12} /> Kích hoạt</>
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Không tìm thấy người dùng nào.</div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">Hiển thị {filtered.length}/{users.length} tài khoản</p>
          <p className="text-xs text-gray-400">Cập nhật: 21/03/2026</p>
        </div>
      </div>
    </div>
  );
}
