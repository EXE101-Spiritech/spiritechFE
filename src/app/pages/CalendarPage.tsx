import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Calendar, X, ShoppingBag } from 'lucide-react';

// ─── Dữ liệu ngày cúng / lễ (dùng chung với ChatBot) ────────────────────────
const RITUAL_DAYS: Record<string, { label: string; type: 'ram' | 'mung1' | 'le' | 'than_tai' }> = {
  '2026-02-07': { label: 'Vía Thần Tài (Mùng 10 tháng Giêng)', type: 'than_tai' },
  '2026-02-12': { label: 'Rằm tháng Giêng', type: 'ram' },
  '2026-02-28': { label: 'Mùng 1 tháng 2 ÂL', type: 'mung1' },
  '2026-03-14': { label: 'Rằm tháng 2 ÂL', type: 'ram' },
  '2026-03-29': { label: 'Mùng 1 tháng 3 ÂL', type: 'mung1' },
  '2026-04-05': { label: 'Tiết Thanh Minh', type: 'le' },
  '2026-04-12': { label: 'Rằm tháng 3 ÂL', type: 'ram' },
  '2026-04-27': { label: 'Mùng 1 tháng 4 ÂL', type: 'mung1' },
  '2026-05-11': { label: 'Rằm tháng 4 ÂL', type: 'ram' },
  '2026-05-27': { label: 'Mùng 1 tháng 5 ÂL', type: 'mung1' },
  '2026-06-05': { label: 'Tết Đoan Ngọ (5/5 ÂL)', type: 'le' },
  '2026-06-11': { label: 'Rằm tháng 5 ÂL', type: 'ram' },
  '2026-06-26': { label: 'Mùng 1 tháng 6 ÂL', type: 'mung1' },
  '2026-07-10': { label: 'Rằm tháng 6 ÂL', type: 'ram' },
  '2026-07-26': { label: 'Mùng 1 tháng 7 ÂL', type: 'mung1' },
  '2026-08-09': { label: 'Rằm tháng 7 ÂL — Lễ Vu Lan', type: 'le' },
  '2026-08-24': { label: 'Mùng 1 tháng 8 ÂL', type: 'mung1' },
  '2026-09-07': { label: 'Rằm tháng 8 ÂL — Tết Trung Thu', type: 'le' },
  '2026-09-22': { label: 'Mùng 1 tháng 9 ÂL', type: 'mung1' },
  '2026-10-06': { label: 'Rằm tháng 9 ÂL', type: 'ram' },
  '2026-10-22': { label: 'Mùng 1 tháng 10 ÂL', type: 'mung1' },
  '2026-11-05': { label: 'Rằm tháng 10 ÂL — Lễ Hạ Nguyên', type: 'le' },
  '2026-11-21': { label: 'Mùng 1 tháng 11 ÂL', type: 'mung1' },
  '2026-12-05': { label: 'Rằm tháng 11 ÂL', type: 'ram' },
  '2026-12-21': { label: 'Mùng 1 tháng 12 ÂL', type: 'mung1' },
  '2027-01-04': { label: 'Rằm tháng 12 ÂL', type: 'ram' },
  '2027-01-12': { label: 'Ông Công Ông Táo (23 tháng Chạp)', type: 'le' },
};

const COLORS = {
  ram:      { solid: '#1d4ed8', hover: '#1e3a8a', light: '#dbeafe', label: 'Ngày Rằm' },
  mung1:    { solid: '#cc323f', hover: '#b02030', light: '#fecaca', label: 'Mùng 1' },
  le:       { solid: '#7c3aed', hover: '#6d28d9', light: '#ede9fe', label: 'Ngày lễ lớn' },
  than_tai: { solid: '#c77d00', hover: '#a86a00', light: '#fef3c7', label: 'Vía Thần Tài' },
};

const MONTH_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const DOW_FULL = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const DOW_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const RITUAL_NOTES: Record<string, string[]> = {
  ram:      ['Mâm ngũ quả', 'Nhang trầm', 'Nến đỏ', 'Hoa tươi', 'Vàng mã'],
  mung1:    ['Nhang, nến', 'Trái cây', 'Hoa cúc vàng', 'Vàng tiền âm phủ'],
  le:       ['Lễ vật theo tục lệ', 'Nhang trầm', 'Mâm cỗ chay / mặn', 'Hoa tươi'],
  than_tai: ['Mâm lễ Thần Tài', 'Heo quay', 'Trái cây', 'Nhang trầm', 'Vàng thỏi'],
};

function formatDateVN(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = DOW_FULL[(date.getDay() + 6) % 7];
  return `${dow}, ${d}/${m}/${y}`;
}

export default function CalendarPage() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [inputMo, setInputMo] = useState(today.getMonth());
  const [inputYr, setInputYr] = useState(today.getFullYear());

  const yr = viewDate.getFullYear();
  const mo = viewDate.getMonth();

  const firstDow = new Date(yr, mo, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayKey = (day: number) =>
    `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Upcoming ritual days from today
  const upcoming = Object.entries(RITUAL_DAYS)
    .filter(([k]) => k >= todayKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 8);

  const selectedRitual = selectedDay ? RITUAL_DAYS[selectedDay] : null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#fdf8f8', fontFamily: 'Be Vietnam Pro, sans-serif' }}
    >
      {/* Page Header */}
      <div
        className="py-8 px-4"
        style={{ background: 'linear-gradient(135deg, #3a0e16 0%, #902131 60%, #cc323f 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(230,187,12,0.2)', border: '1.5px solid rgba(230,187,12,0.5)' }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#e6bb0c' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Lora, serif', color: '#e6bb0c', fontSize: '1.5rem', fontWeight: 700 }}>
                Lịch Ngày Cúng
              </h1>
              <p className="text-white/70 text-sm">Lịch âm – ngày rằm, mùng 1 & lễ lớn trong năm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid #f1e5e5' }}>
          {/* Calendar Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #3a0e16 0%, #cc323f 100%)' }}
          >
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {editMode ? (
              <div className="flex items-center gap-2">
                <select
                  value={inputMo}
                  onChange={e => {
                    const newMo = Number(e.target.value);
                    setInputMo(newMo);
                    setViewDate(new Date(inputYr, newMo, 1));
                  }}
                  className="rounded-lg px-2 py-1 outline-none cursor-pointer text-sm"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  {MONTH_VI.map((m, i) => (
                    <option key={i} value={i} style={{ background: '#3a0e16' }}>{m}</option>
                  ))}
                </select>
                <select
                  value={inputYr}
                  onChange={e => {
                    const newYr = Number(e.target.value);
                    setInputYr(newYr);
                    setViewDate(new Date(newYr, inputMo, 1));
                  }}
                  className="rounded-lg px-2 py-1 outline-none cursor-pointer text-sm"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y} style={{ background: '#3a0e16' }}>{y}</option>
                  ))}
                </select>
                <button
                  onClick={() => setEditMode(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setInputMo(mo); setInputYr(yr); setEditMode(true); }}
                className="flex items-center gap-1.5 hover:bg-white/15 px-3 py-1 rounded-lg transition-colors"
              >
                <span style={{ fontFamily: 'Lora, serif', fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>
                  {MONTH_VI[mo]} {yr}
                </span>
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                </svg>
              </button>
            )}

            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* DOW row */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {DOW_SHORT.map((d, i) => (
              <div
                key={d}
                className="text-center py-1"
                style={{ fontSize: '0.72rem', fontWeight: 700, color: i >= 5 ? '#cc323f' : '#94a3b8' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-3 pb-3" style={{ gap: '4px 0' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const key = dayKey(day);
              const ritual = RITUAL_DAYS[key];
              const isToday = key === todayKey;
              const isPast = key < todayKey;
              const isSelected = selectedDay === key;

              let bg = 'transparent';
              let textCol = isPast ? '#9ca3af' : '#1e293b';
              let border = 'none';
              let fw = 400;

              if (isToday && !ritual) {
                bg = '#fef3c7';
                border = '2px solid #e6bb0c';
                textCol = '#92400e';
                fw = 700;
              }
              if (ritual) {
                const c = COLORS[ritual.type];
                if (isPast) {
                  bg = c.light;
                  textCol = '#6b7280';
                  fw = 500;
                } else {
                  bg = isSelected ? c.hover : c.solid;
                  textCol = 'white';
                  fw = 700;
                }
              }
              if (isSelected && !ritual) {
                border = '2px solid #cc323f';
              }

              return (
                <div
                  key={key}
                  className="flex items-center justify-center"
                  style={{ height: '44px' }}
                >
                  <button
                    onClick={() => setSelectedDay(isSelected ? null : key)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 active:scale-95"
                    style={{
                      backgroundColor: bg,
                      border,
                      cursor: ritual ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: fw, color: textCol, lineHeight: 1 }}>
                      {day}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 px-4 py-3"
            style={{ borderTop: '1px solid #f1f5f9' }}
          >
            {Object.entries(COLORS).map(([key, c]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.solid }} />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDay && selectedRitual && (
          <div
            className="rounded-2xl overflow-hidden shadow-md"
            style={{ border: `2px solid ${COLORS[selectedRitual.type].solid}` }}
          >
            <div
              className="px-4 py-3"
              style={{ backgroundColor: COLORS[selectedRitual.type].solid }}
            >
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                📅 {formatDateVN(selectedDay)}
              </p>
              <p className="text-white/90 text-base mt-0.5" style={{ fontFamily: 'Lora, serif', fontWeight: 700 }}>
                {selectedRitual.label}
              </p>
            </div>
            <div className="bg-white px-4 py-4">
              <p className="text-sm mb-2" style={{ color: '#64748b', fontWeight: 600 }}>Lễ vật thường dùng:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {RITUAL_NOTES[selectedRitual.type].map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: COLORS[selectedRitual.type].light,
                      color: COLORS[selectedRitual.type].solid,
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to="/combo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
                style={{ backgroundColor: '#cc323f', color: 'white', fontWeight: 600 }}
              >
                <ShoppingBag className="w-4 h-4" />
                Mua combo cho ngày này
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming events */}
        <div>
          <h2 className="mb-3" style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', fontWeight: 700, color: '#3a0e16' }}>
            Ngày lễ sắp tới
          </h2>
          <div className="space-y-2">
            {upcoming.map(([key, ritual]) => {
              const [y, m, d] = key.split('-').map(Number);
              const date = new Date(y, m - 1, d);
              const diffDays = Math.ceil((date.getTime() - today.setHours(0, 0, 0, 0)) / 86400000);
              const c = COLORS[ritual.type];

              return (
                <button
                  key={key}
                  onClick={() => {
                    setViewDate(new Date(y, m - 1, 1));
                    setSelectedDay(key);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:shadow-sm active:scale-[0.99]"
                  style={{ backgroundColor: 'white', border: '1px solid #f1e5e5' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: c.light }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: c.solid, lineHeight: 1 }}>
                      T{m}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: c.solid, lineHeight: 1.1 }}>
                      {d}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ fontWeight: 600, color: '#1e293b' }}>
                      {ritual.label}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {DOW_FULL[(date.getDay() + 6) % 7]}, {d}/{m}/{y}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: diffDays <= 7 ? '#fef2f2' : '#f8fafc',
                        color: diffDays <= 7 ? '#cc323f' : '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {diffDays === 0 ? 'Hôm nay' : diffDays === 1 ? 'Ngày mai' : `${diffDays} ngày`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg, #3a0e16 0%, #902131 100%)' }}
        >
          <p style={{ fontFamily: 'Lora, serif', color: '#e6bb0c', fontWeight: 700, fontSize: '1.05rem' }}>
            Chuẩn bị lễ vật đầy đủ cho ngày quan trọng?
          </p>
          <p className="text-white/70 text-sm mt-1 mb-4">
            Chọn combo trọn gói — giao tận nơi trước ngày cúng
          </p>
          <Link
            to="/combo"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm transition-colors"
            style={{ backgroundColor: '#e6bb0c', color: '#3a0e16', fontWeight: 700 }}
          >
            <ShoppingBag className="w-4 h-4" />
            Xem combo đồ cúng
          </Link>
        </div>
      </div>
    </div>
  );
}
