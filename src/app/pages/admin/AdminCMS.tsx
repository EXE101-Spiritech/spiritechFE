import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";
import { adminApi } from "@/features/admin/api";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

const EMPTY_FORM = {
  slug: "",
  title: "",
  content: "",
  excerpt: "",
  image_url: "",
  author: "Admin",
  status: "draft" as const,
};

const STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Nháp", color: "#6b7280", bg: "#f3f4f6" },
  published: { label: "Đã xuất bản", color: "#16a34a", bg: "#f0fdf4" },
  archived: { label: "Lưu trữ", color: "#d97706", bg: "#fffbeb" },
};

export default function AdminCMS() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listBlogs()
      .then((r: any) => setPosts(Array.isArray(r) ? r : r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
      content: p.content || "",
      excerpt: p.excerpt || "",
      image_url: p.image_url || "",
      author: p.author || "Admin",
      status: p.status as any,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const slug =
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const data = { ...form, slug };

    try {
      if (editingId) {
        await adminApi.updateBlog(editingId, data);
      } else {
        await adminApi.createBlog(data);
      }
      load();
    } catch {
      /* ignore */
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteBlog(id);
    } catch {
      /* ignore */
    }
    setPosts((p) => p.filter((x) => x.id !== id));
    setDeleteId(null);
  };

  const activeCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-6 h-6 border-2 border-[#cc323f] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "Lora, serif" }}
          >
            Bài viết
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts.length} bài viết
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
        >
          <Plus size={16} /> Viết bài mới
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Tổng số</p>
          <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Đã xuất bản</p>
          <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Bản nháp</p>
          <p className="text-2xl font-semibold text-gray-500">{draftCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {(["all", "published", "draft"] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 text-sm transition-colors ${i > 0 ? "border-l border-gray-200" : ""}`}
              style={
                filterStatus === s
                  ? { background: "#cc323f", color: "#fff" }
                  : { color: "#6b7280" }
              }
            >
              {s === "all"
                ? "Tất cả"
                : s === "published"
                  ? "Đã xuất bản"
                  : "Nháp"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "#faf9f8" }}
                className="border-b border-gray-100"
              >
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">
                  Bài viết
                </th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden md:table-cell">
                  Trạng thái
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium hidden lg:table-cell">
                  Ngày tạo
                </th>
                <th className="text-center px-5 py-3.5 text-gray-500 font-medium">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {p.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {p.excerpt?.slice(0, 60)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-400 font-mono text-xs">
                      {p.slug}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden md:table-cell">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        color: STATUS_STYLES[p.status]?.color,
                        background: STATUS_STYLES[p.status]?.bg,
                      }}
                    >
                      {p.status === "published" ? (
                        <>
                          <Eye size={11} className="mr-1" />{" "}
                          {STATUS_STYLES[p.status]?.label}
                        </>
                      ) : p.status === "draft" ? (
                        <>
                          <EyeOff size={11} className="mr-1" /> Nháp
                        </>
                      ) : (
                        STATUS_STYLES[p.status]?.label
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {p.created_at?.slice(0, 10)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Chưa có bài viết nào.
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3
                className="font-semibold text-gray-900"
                style={{ fontFamily: "Lora, serif" }}
              >
                {editingId ? "Chỉnh sửa bài viết" : "Viết bài mới"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Nhập tiêu đề..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="Tự động từ tiêu đề"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as any }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tóm tắt
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, excerpt: e.target.value }))
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  placeholder="Mô tả ngắn..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nội dung (HTML)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none font-mono"
                  placeholder="<h1>Nội dung bài viết...</h1>"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  URL hình ảnh
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image_url: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tác giả
                </label>
                <input
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #cc323f, #902131)",
                }}
              >
                {editingId ? "Lưu thay đổi" : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3
              className="font-semibold text-gray-900 mb-1"
              style={{ fontFamily: "Lora, serif" }}
            >
              Xóa bài viết?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Bài viết sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "#cc323f" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
