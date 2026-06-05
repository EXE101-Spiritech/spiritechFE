import {
  streamChat,
  createChatSession,
  getChatMessages,
} from "@/features/chat/api";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, Link } from "react-router";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  RotateCcw,
  ChevronUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Dữ liệu ngày cúng / lễ ─────────────────────────────────────────────────
const RITUAL_DAYS: Record<
  string,
  { label: string; type: "ram" | "mung1" | "le" | "than_tai" }
> = {
  // Tháng Giêng AL 2026
  "2026-02-07": {
    label: "Vía Thần Tài (Mùng 10 tháng Giêng)",
    type: "than_tai",
  },
  "2026-02-12": { label: "Rằm tháng Giêng", type: "ram" },
  // Tháng 2 AL 2026
  "2026-02-28": { label: "Mùng 1 tháng 2 ÂL", type: "mung1" },
  "2026-03-14": { label: "Rằm tháng 2 ÂL", type: "ram" },
  // Tháng 3 AL 2026
  "2026-03-29": { label: "Mùng 1 tháng 3 ÂL", type: "mung1" },
  "2026-04-05": { label: "Tiết Thanh Minh", type: "le" },
  "2026-04-12": { label: "Rằm tháng 3 ÂL", type: "ram" },
  // Tháng 4 AL 2026
  "2026-04-27": { label: "Mùng 1 tháng 4 ÂL", type: "mung1" },
  "2026-05-11": { label: "Rằm tháng 4 ÂL", type: "ram" },
  // Tháng 5 AL 2026
  "2026-05-27": { label: "Mùng 1 tháng 5 ÂL", type: "mung1" },
  "2026-06-05": { label: "Tết Đoan Ng (5/5 ÂL)", type: "le" },
  "2026-06-11": { label: "Rằm tháng 5 ÂL", type: "ram" },
  // Tháng 6 AL 2026
  "2026-06-26": { label: "Mùng 1 tháng 6 ÂL", type: "mung1" },
  "2026-07-10": { label: "Rằm tháng 6 ÂL", type: "ram" },
  // Tháng 7 AL 2026
  "2026-07-26": { label: "Mùng 1 tháng 7 ÂL", type: "mung1" },
  "2026-08-09": { label: "Rằm tháng 7 ÂL — Lễ Vu Lan", type: "le" },
  // Tháng 8 AL 2026
  "2026-08-24": { label: "Mùng 1 tháng 8 ÂL", type: "mung1" },
  "2026-09-07": { label: "Rằm tháng 8 ÂL — Tết Trung Thu", type: "le" },
  // Tháng 9 AL 2026
  "2026-09-22": { label: "Mùng 1 tháng 9 ÂL", type: "mung1" },
  "2026-10-06": { label: "Rằm tháng 9 ÂL", type: "ram" },
  // Tháng 10 AL 2026
  "2026-10-22": { label: "Mùng 1 tháng 10 ÂL", type: "mung1" },
  "2026-11-05": { label: "Rằm tháng 10 ÂL — Lễ Hạ Nguyên", type: "le" },
  // Tháng 11 AL 2026
  "2026-11-21": { label: "Mùng 1 tháng 11 ÂL", type: "mung1" },
  "2026-12-05": { label: "Rằm tháng 11 ÂL", type: "ram" },
  // Tháng 12 AL 2026
  "2026-12-21": { label: "Mùng 1 tháng 12 ÂL", type: "mung1" },
  "2027-01-04": { label: "Rằm tháng 12 ÂL", type: "ram" },
  "2027-01-12": { label: "Ông Công Ông Táo (23 tháng Chạp)", type: "le" },
};

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: Date;
  quickReplies?: string[];
}

const QUICK_REPLIES_INIT = [
  "Xem combo cúng rằm 🕯️",
  "Phí vận chuyển bao nhiêu?",
  "Cách đặt hàng",
  "Chính sách đổi trả",
];

const SESSION_KEY = "spiritech_chat_session";
function defaultGreeting(): Message[] {
  return [
    {
      id: "0",
      role: "bot",
      text: "Xin chào! 🙏 Chào mừng đến với **Góc An Nhiên**.\n\nTôi là **Trợ lý An Tâm**, sẵn sàng giúp bạn về:\n• Sản phẩm & combo đồ cúng\n• Tư vấn nghi lễ cúng bái\n• Đặt hàng & vận chuyển\n\nBạn cần giúp gì hôm nay?",
      time: new Date(),
      quickReplies: QUICK_REPLIES_INIT,
    },
  ];
}

function formatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: "inherit" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function BubbleText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="text-sm" style={{ lineHeight: "1.6" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line → small spacer
        if (trimmed === "") {
          return <div key={i} style={{ height: "6px" }} />;
        }

        // Bullet line: starts with •
        if (trimmed.startsWith("•")) {
          return (
            <div
              key={i}
              className="flex gap-1.5"
              style={{ marginTop: i > 0 ? "3px" : "0" }}
            >
              <span
                style={{ color: "#cc323f", flexShrink: 0, marginTop: "1px" }}
              >
                •
              </span>
              <span>{formatText(trimmed.slice(1).trim())}</span>
            </div>
          );
        }

        // Numbered emoji line: starts with 1️⃣ 2️⃣ etc.
        if (/^[1-9]️⃣/.test(trimmed)) {
          return (
            <div
              key={i}
              className="flex gap-2 items-start"
              style={{ marginTop: i > 0 ? "5px" : "0" }}
            >
              <span style={{ flexShrink: 0 }}>{trimmed.slice(0, 3)}</span>
              <span>{formatText(trimmed.slice(3).trim())}</span>
            </div>
          );
        }

        // Sub-detail line: starts with — (em dash)
        if (trimmed.startsWith("—")) {
          return (
            <div
              key={i}
              className="flex gap-1.5 items-baseline"
              style={{ marginTop: "2px", paddingLeft: "10px" }}
            >
              <span
                style={{ color: "#cc323f", flexShrink: 0, fontSize: "11px" }}
              >
                ›
              </span>
              <span style={{ color: "#64748b" }}>
                {formatText(trimmed.slice(1).trim())}
              </span>
            </div>
          );
        }

        // Callout line: starts with 👉
        if (trimmed.startsWith("👉")) {
          return (
            <p
              key={i}
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                backgroundColor: "rgba(204,50,63,0.07)",
                borderRadius: "8px",
                borderLeft: "3px solid #cc323f",
                color: "#3a0e16",
              }}
            >
              {formatText(trimmed.slice(2).trim())}
            </p>
          );
        }

        // Section header: ends with ":" and no bullet (e.g. "Lễ vật cần chuẩn bị:")
        if (
          trimmed.endsWith(":") &&
          !trimmed.startsWith("") &&
          trimmed.length < 60
        ) {
          return (
            <p
              key={i}
              style={{
                marginTop: i > 0 ? "8px" : "0",
                fontWeight: 600,
                color: "#3a0e16",
              }}
            >
              {formatText(trimmed)}
            </p>
          );
        }

        // Normal line
        return (
          <p
            key={i}
            style={{
              marginTop: i > 0 ? "4px" : "0",
              fontWeight: 400,
              color: "#1e293b",
            }}
          >
            {formatText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export function ChatBot() {
  const location = useLocation();

  // Pages where the calendar popup is allowed
  const CALENDAR_ALLOWED_PATHS = ["/", "/guide", "/about"];
  const showCalendar = CALENDAR_ALLOWED_PATHS.some((p) =>
    p === "/"
      ? location.pathname === "/"
      : location.pathname === p || location.pathname.startsWith(p + "/"),
  );

  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(true);
  const [calViewDate, setCalViewDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [calEditMode, setCalEditMode] = useState(false);
  const [calInputMo, setCalInputMo] = useState(0);
  const [calInputYr, setCalInputYr] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text: "Xin chào! 🙏 Chào mừng đến với **Góc An Nhiên**.\n\nTôi là **Trợ lý An Tâm**, sẵn sàng giúp bạn về:\n• Sản phẩm & combo đồ cúng\n• Tư vấn nghi lễ cúng bái\n• Đặt hàng & vận chuyển\n\nBạn cần giúp gì hôm nay?",
      time: new Date(),
      quickReplies: QUICK_REPLIES_INIT,
    },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const loadedRef = useRef(false);

  // On mount: restore past messages from API if session exists
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (sessionId) {
      getChatMessages(sessionId)
        .then((msgs: any) => {
          if (msgs && msgs.length > 0) {
            setMessages(
              msgs.map((m: any, i: number) => ({
                id: i.toString(),
                role: m.role === "user" ? "user" : "bot",
                text: m.content || "",
                time: new Date(),
              })),
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const currentRef = messagesEndRef.current;
    if (currentRef) {
      currentRef.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    const currentRef = inputRef.current;
    if (currentRef) {
      currentRef.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(e.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
        time: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);
      setStreaming(true);

      // Accumulate streaming content
      let accumulated = "";
      const botId = (Date.now() + 1).toString();

      const botMsg: Message = {
        id: botId,
        role: "bot",
        text: "",
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

      try {
        const newSessionId = await streamChat(
          text.trim(),
          sessionId,
          (event) => {
            if (event.content) {
              accumulated = event.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, text: accumulated } : m,
                ),
              );
            }
          },
        );
        setSessionId(newSessionId);
        try {
          localStorage.setItem(SESSION_KEY, newSessionId);
        } catch {}
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  text: "Tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
                }
              : m,
          ),
        );
      } finally {
        setTyping(false);
        setStreaming(false);
      }
    },
    [sessionId, streaming],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    createChatSession()
      .then(({ session_id }) => {
        setSessionId(session_id);
        try {
          localStorage.setItem(SESSION_KEY, session_id);
        } catch {}
      })
      .catch(() => {});
    setMessages([
      {
        id: Date.now().toString(),
        role: "bot",
        text: "Cuộc trò chuyện mới đã bắt đầu! 🙏\n\nTôi là **Trợ lý An Tâm** của **Góc An Nhiên**, luôn sẵn sàng hỗ trợ bạn về sản phẩm, đặt hàng và nghi lễ cúng bái.\n\nBạn cần giúp gì ạ?",
        time: new Date(),
        quickReplies: QUICK_REPLIES_INIT,
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-14 right-6 z-50 flex flex-col items-end gap-2">
        {/* Scroll to top — nằm trên cùng của nhóm, luôn hiện khi cuộn > 300px */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "#902131",
            opacity: scrolled ? 1 : 0,
            pointerEvents: scrolled ? "auto" : "none",
            transform: scrolled
              ? "translateY(0) scale(1)"
              : "translateY(8px) scale(0.85)",
            boxShadow: "0 4px 20px rgba(144,33,49,0.4)",
          }}
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {!open && (
          <div
            className="bg-white rounded-full px-3 py-1.5 text-xs shadow-lg flex items-center gap-1.5 animate-bounce mt-2"
            style={{
              color: "#cc323f",
              fontFamily: "Be Vietnam Pro, sans-serif",
              fontWeight: 600,
            }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            {isLoggedIn ? "Trợ lý An Tâm" : "Đăng nhập để trò chuyện"}
          </div>
        )}
        <button
          ref={toggleBtnRef}
          onClick={() => {
            if (isLoggedIn) {
              setOpen((o) => !o);
            } else {
              setGuestOpen(true);
            }
          }}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: "#cc323f" }}
          aria-label="Chat support"
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
        {/* Calendar toggle */}
        {!calOpen && (
          <button
            onClick={() => setCalOpen(true)}
            className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #cc323f, #e8566a)",
              boxShadow: "0 4px 16px rgba(204,50,63,0.5)",
            }}
            aria-label="Mở lịch cúng"
          >
            <Calendar className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Calendar Widget — desktop only ── */}
      <div className="">
        {(() => {
          const today = new Date();
          const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const yr = calViewDate.getFullYear();
          const mo = calViewDate.getMonth();
          const firstDow = new Date(yr, mo, 1).getDay(); // 0=Sun
          const startOffset = (firstDow + 6) % 7; // Mon-first
          const daysInMonth = new Date(yr, mo + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array(startOffset).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
          const MONTH_VI = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ];

          const prevMonth = () =>
            setCalViewDate(
              (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
            );
          const nextMonth = () =>
            setCalViewDate(
              (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
            );

          const dayKey = (day: number) =>
            `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          // Collect upcoming ritual days (next 60 days) for the legend list
          const upcoming = Object.entries(RITUAL_DAYS)
            .filter(([k]) => k >= todayKey)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(0, 4);

          return (
            <>
              {/* Calendar popup */}
              <div
                className="fixed bottom-2 right-28 z-50"
                style={{
                  width: "248px",
                  fontFamily: "Be Vietnam Pro, sans-serif",
                }}
              >
                {calOpen && (
                  <div
                    style={{
                      borderRadius: "0.75rem",
                      overflow: "visible",
                      boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
                      border: "1px solid rgba(204,50,63,0.18)",
                    }}
                  >
                    {/* Header — drag handle */}
                    <div
                      className="flex items-center justify-between px-3 py-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #3a0e16 0%, #cc323f 100%)",
                        borderTopLeftRadius: "0.75rem",
                        borderTopRightRadius: "0.75rem",
                      }}
                    >
                      <button
                        onClick={prevMonth}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white flex-shrink-0"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Month/Year — click to edit */}
                      {calEditMode ? (
                        <div className="flex items-center gap-1 flex-1 justify-center">
                          <select
                            value={calInputMo}
                            onChange={(e) => {
                              const newMo = Number(e.target.value);
                              setCalInputMo(newMo);
                              setCalViewDate(new Date(calInputYr, newMo, 1));
                            }}
                            className="rounded px-1 outline-none cursor-pointer"
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "rgba(255,255,255,0.15)",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.35)",
                              appearance: "none",
                              WebkitAppearance: "none",
                              paddingRight: "4px",
                              paddingTop: "2px",
                              paddingBottom: "2px",
                            }}
                          >
                            {[
                              "T1",
                              "T2",
                              "T3",
                              "T4",
                              "T5",
                              "T6",
                              "T7",
                              "T8",
                              "T9",
                              "T10",
                              "T11",
                              "T12",
                            ].map((m, i) => (
                              <option
                                key={i}
                                value={i}
                                style={{
                                  background: "#3a0e16",
                                  color: "white",
                                }}
                              >
                                {m}
                              </option>
                            ))}
                          </select>
                          <select
                            value={calInputYr}
                            onChange={(e) => {
                              const newYr = Number(e.target.value);
                              setCalInputYr(newYr);
                              setCalViewDate(new Date(newYr, calInputMo, 1));
                            }}
                            className="rounded px-1 outline-none cursor-pointer"
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "rgba(255,255,255,0.15)",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.35)",
                              appearance: "none",
                              WebkitAppearance: "none",
                              paddingRight: "4px",
                              paddingTop: "2px",
                              paddingBottom: "2px",
                            }}
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
                              (y) => (
                                <option
                                  key={y}
                                  value={y}
                                  style={{
                                    background: "#3a0e16",
                                    color: "white",
                                  }}
                                >
                                  {y}
                                </option>
                              ),
                            )}
                          </select>
                          <button
                            onClick={() => setCalEditMode(false)}
                            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white flex-shrink-0"
                            aria-label="Đóng chọn tháng năm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCalInputMo(mo);
                            setCalInputYr(yr);
                            setCalEditMode(true);
                          }}
                          className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-white/15 transition-colors group"
                          title="Chọn tháng / năm"
                        >
                          <span
                            style={{
                              fontFamily: "Lora, serif",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              color: "white",
                            }}
                          >
                            {MONTH_VI[mo]} {yr}
                          </span>
                          <svg
                            className="w-3 h-3 text-white/60 group-hover:text-white transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
                            />
                          </svg>
                        </button>
                      )}

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={nextMonth}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCalOpen(false)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                          aria-label="Đóng lịch"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div
                      className="bg-white px-2 pt-2 pb-2"
                      style={{
                        borderBottomLeftRadius: "0.75rem",
                        borderBottomRightRadius: "0.75rem",
                        overflowX: "visible",
                      }}
                    >
                      {/* DOW row */}
                      <div className="grid grid-cols-7 mb-0.5">
                        {DOW.map((d, i) => (
                          <div
                            key={d}
                            className="text-center"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              color: i >= 5 ? "#cc323f" : "#94a3b8",
                              padding: "2px 0",
                            }}
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Days grid */}
                      <div
                        className="grid grid-cols-7"
                        style={{ gap: "2px 0" }}
                      >
                        {cells.map((day, idx) => {
                          if (!day) return <div key={idx} />;
                          const key = dayKey(day);
                          const ritual = RITUAL_DAYS[key];
                          const isToday = key === todayKey;
                          const isPast = key < todayKey;
                          const isHovered = hoveredDay === key;

                          const COLORS = {
                            ram: {
                              solid: "#1d4ed8",
                              hover: "#1e3a8a",
                              light: "#dbeafe",
                            }, // xanh dương — Rằm
                            mung1: {
                              solid: "#cc323f",
                              hover: "#b02030",
                              light: "#fecaca",
                            }, // đỏ brand   — Mùng 1
                            le: {
                              solid: "#7c3aed",
                              hover: "#6d28d9",
                              light: "#ede9fe",
                            }, // tím        — Lễ lớn
                            than_tai: {
                              solid: "#c77d00",
                              hover: "#a86a00",
                              light: "#fef3c7",
                            }, // vàng gold  — Thần Tài
                          };

                          let bgColor = "transparent";
                          let textColor = isPast ? "#9ca3af" : "#1e293b";
                          let borderStyle = "none";
                          let fontWeight = 400;

                          if (isToday && !ritual) {
                            bgColor = "#fef3c7";
                            borderStyle = "2px solid #e6bb0c";
                            textColor = "#92400e";
                            fontWeight = 700;
                          }
                          if (ritual) {
                            const c = COLORS[ritual.type];
                            if (isPast) {
                              bgColor = c.light;
                              textColor = "#6b7280";
                              fontWeight = 500;
                            } else {
                              bgColor = isHovered ? c.hover : c.solid;
                              textColor = "white";
                              fontWeight = 700;
                            }
                          }

                          return (
                            <div
                              key={key}
                              className="relative flex items-center justify-center"
                              style={{ height: "28px" }}
                              onMouseEnter={() =>
                                ritual && !isPast && setHoveredDay(key)
                              }
                              onMouseLeave={() => setHoveredDay(null)}
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150"
                                style={{
                                  backgroundColor: bgColor,
                                  border: borderStyle,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight,
                                    color: textColor,
                                    lineHeight: 1,
                                  }}
                                >
                                  {day}
                                </span>
                              </div>

                              {/* Tooltip */}
                              {isHovered && ritual && !isPast && (
                                <div
                                  className="absolute z-20 pointer-events-none"
                                  style={{
                                    bottom: "calc(100% + 4px)",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    whiteSpace: "nowrap",
                                    backgroundColor: "#1e293b",
                                    color: "white",
                                    borderRadius: "6px",
                                    padding: "3px 8px",
                                    fontSize: "0.62rem",
                                    fontWeight: 600,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                  }}
                                >
                                  {ritual.label}
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "100%",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      width: 0,
                                      height: 0,
                                      borderLeft: "4px solid transparent",
                                      borderRight: "4px solid transparent",
                                      borderTop: "4px solid #1e293b",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend — grid 7 cols để chấm thẳng hàng với lưới lịch */}
                      <div
                        className="grid grid-cols-7 w-full mt-2 pt-1.5"
                        style={{ boxShadow: "inset 0 1px 0 #f1f5f9" }}
                      >
                        {[
                          {
                            color: "#cc323f",
                            label: "Mùng 1",
                            gridColumn: "1 / span 2",
                          },
                          {
                            color: "#1d4ed8",
                            label: "Rằm",
                            gridColumn: "3 / span 1",
                          },
                          {
                            color: "#7c3aed",
                            label: "Ngày lễ",
                            gridColumn: "4 / span 2",
                          },
                          {
                            color: "#c77d00",
                            label: "Thần Tài",
                            gridColumn: "6 / span 2",
                          },
                        ].map((l) => (
                          <div
                            key={l.label}
                            className="flex items-center justify-center gap-1"
                            style={{ gridColumn: l.gridColumn }}
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: l.color }}
                            />
                            <span
                              style={{
                                fontSize: "0.6rem",
                                color: "#6b7280",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {l.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>{" "}
            </>
          );
        })()}
      </div>

      {/* Guest login prompt */}
      {guestOpen && !isLoggedIn && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl bg-white text-center p-8"
          style={{
            fontFamily: "Be Vietnam Pro, sans-serif",
            border: "1px solid rgba(204,50,63,0.15)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #902131, #cc323f)" }}
          >
            <span className="text-2xl">🤖</span>
          </div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-2"
            style={{ fontFamily: "Lora, serif" }}
          >
            Trợ lý An Tâm
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Vui lòng đăng nhập để trò chuyện với trợ lý mua sắm thông minh của
            Spiritech.
          </p>
          <Link
            to="/login"
            onClick={() => setGuestOpen(false)}
            className="block w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #cc323f, #902131)" }}
          >
            Đăng nhập ngay
          </Link>
          <button
            onClick={() => setGuestOpen(false)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Để sau
          </button>
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            height: "520px",
            fontFamily: "Be Vietnam Pro, sans-serif",
            border: "1px solid rgba(204,50,63,0.15)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #902131 0%, #cc323f 100%)",
            }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                Trợ Lý An Tâm
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/80 text-xs">
                  Online · Phản hồi ngay
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                title="Cuộc trò chuyện mới"
              >
                <RotateCcw className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ backgroundColor: "#f8fafc" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === "bot" ? "" : "bg-gray-200"}`}
                  style={
                    msg.role === "bot" ? { backgroundColor: "#cc323f" } : {}
                  }
                >
                  {msg.role === "bot" ? (
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </div>

                <div
                  className={`flex flex-col gap-1.5 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className="px-3 py-2.5 rounded-2xl"
                    style={
                      msg.role === "bot"
                        ? {
                            backgroundColor: "white",
                            borderBottomLeftRadius: "4px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            color: "#0f172a",
                          }
                        : {
                            backgroundColor: "#cc323f",
                            borderBottomRightRadius: "4px",
                            color: "white",
                          }
                    }
                  >
                    <BubbleText text={msg.text} />
                  </div>
                  <span className="text-xs text-gray-400 px-1">
                    {msg.time.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {/* Quick replies */}
                  {msg.role === "bot" && msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {msg.quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(qr)}
                          className="text-xs px-2.5 py-1 rounded-full border transition-all hover:text-white"
                          style={{
                            borderColor: "#cc323f",
                            color: "#cc323f",
                            backgroundColor: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#cc323f";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.color = "#cc323f";
                          }}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "#cc323f" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div
                  className="px-3 py-3 bg-white rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1"
                  style={{ borderBottomLeftRadius: "4px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ backgroundColor: "white", borderTop: "1px solid #f1f5f9" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 text-sm px-3 py-2 rounded-full outline-none transition-all bg-gray-50"
              style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#cc323f";
                e.target.style.boxShadow = "0 0 0 3px rgba(204,50,63,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#cc323f" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
