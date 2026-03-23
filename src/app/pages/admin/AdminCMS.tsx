import { useState, useRef } from 'react';
import { Bold, Italic, Link, Image, Eye, Save, Check } from 'lucide-react';
import { cmsContent as initialContent } from '../../data/adminData';

const TABS = [
  { key: 'homepage', label: 'Trang chủ', icon: '🏠' },
  { key: 'about', label: 'Giới thiệu', icon: '📖' },
  { key: 'events', label: 'Sự kiện', icon: '📅' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState<TabKey>('homepage');
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState<Record<TabKey, boolean>>({ homepage: false, about: false, events: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    setSaved(s => ({ ...s, [activeTab]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [activeTab]: false })), 2500);
  };

  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const replacement = prefix + selected + suffix;
    const newValue = el.value.slice(0, start) + replacement + el.value.slice(end);
    setContent(c => ({ ...c, [activeTab]: newValue }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const currentContent = content[activeTab];

  const renderPreview = (text: string) => {
    // Simple formatting: **bold**, *italic*, [link](url), newlines
    let html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline" style="color:#cc323f">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
    return `<p class="mb-3">${html}</p>`;
  };

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Lora, serif' }}>Quản lý Nội dung</h2>
        <p className="text-sm text-gray-500 mt-0.5">Chỉnh sửa nội dung hiển thị trên website</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mục nội dung</p>
            </div>
            <nav className="p-2 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPreview(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left"
                  style={activeTab === tab.key
                    ? { background: 'rgba(204,50,63,0.08)', color: '#cc323f' }
                    : { color: '#6b7280' }}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  {saved[tab.key] && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-medium mb-1">💡 Hỗ trợ Markdown</p>
                <p className="text-amber-600">**đậm** *nghiêng* [link](url)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-base">{TABS.find(t => t.key === activeTab)?.icon}</span>
                <span className="font-medium text-gray-800 text-sm">{TABS.find(t => t.key === activeTab)?.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(p => !p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${preview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Eye size={13} /> {preview ? 'Đang xem trước' : 'Xem trước'}
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                  style={{ background: saved[activeTab] ? '#16a34a' : '#cc323f' }}
                >
                  {saved[activeTab] ? <><Check size={13} /> Đã lưu</> : <><Save size={13} /> Lưu</>}
                </button>
              </div>
            </div>

            {/* Toolbar */}
            {!preview && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => wrapSelection('**')}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors font-bold text-sm"
                  title="In đậm (Ctrl+B)"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => wrapSelection('*')}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors text-sm"
                  title="In nghiêng (Ctrl+I)"
                >
                  <Italic size={14} />
                </button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button
                  onClick={() => wrapSelection('[', '](url)')}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Chèn liên kết"
                >
                  <Link size={14} />
                </button>
                <button
                  onClick={() => {
                    const url = prompt('URL hình ảnh:');
                    if (url) {
                      const el = textareaRef.current;
                      if (!el) return;
                      const start = el.selectionStart;
                      const ins = `![hình ảnh](${url})`;
                      const newVal = el.value.slice(0, start) + ins + el.value.slice(start);
                      setContent(c => ({ ...c, [activeTab]: newVal }));
                    }
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                  title="Chèn hình ảnh"
                >
                  <Image size={14} />
                </button>
                <div className="ml-auto text-xs text-gray-400">
                  {currentContent.length} ký tự
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-5">
              {preview ? (
                <div
                  className="min-h-[320px] text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview(currentContent) }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={currentContent}
                  onChange={e => setContent(c => ({ ...c, [activeTab]: e.target.value }))}
                  className="w-full min-h-[320px] text-sm text-gray-700 leading-relaxed resize-none focus:outline-none"
                  placeholder="Nhập nội dung tại đây..."
                  style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Lần chỉnh sửa gần nhất: hôm nay, 21/03/2026
              </p>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: saved[activeTab] ? '#16a34a' : 'linear-gradient(135deg, #cc323f, #902131)' }}
              >
                {saved[activeTab] ? <><Check size={15} /> Đã lưu!</> : <><Save size={15} /> Lưu thay đổi</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
