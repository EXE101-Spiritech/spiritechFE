import {
  streamChat,
  createChatSession,
  getChatMessages,
} from "@/features/chat/api";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ContentRenderer } from "./ContentRenderer";
import { Solar } from "lunar-javascript";
import { getCookie, setCookie, removeCookie } from "@/shared/api/cookies";
import { getAccessToken } from "@/shared/api/axiosClient";

// ─── Calendar helpers ────────────────────────────────────────────────────────
function getLunarMonthName(m: number): string {
  return (
    ["Giêng", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Chạp"][
      m - 1
    ] || String(m)
  );
}

const LUNAR_FESTIVALS_MAP: Record<string, { type: string; label: string }> = {
  "1-1": { type: "tet", label: "Mùng 1 Tết" },
  "1-2": { type: "tet", label: "Mùng 2 Tết" },
  "1-3": { type: "tet", label: "Mùng 3 Tết" },
  "1-10": { type: "than-tai", label: "Vía Thần Tài" },
  "1-15": { type: "nguyen-tieu", label: "Tết Nguyên Tiêu" },
  "3-10": { type: "hung-vuong", label: "Giỗ Tổ Hùng Vương" },
  "5-5": { type: "doan-ngo", label: "Tết Đoan Ngọ" },
  "7-15": { type: "vu-lan", label: "Lễ Vu Lan" },
  "8-15": { type: "trung-thu", label: "Tết Trung Thu" },
  "10-15": { type: "ha-nguyen", label: "Tết Hạ Nguyên" },
  "12-23": { type: "ong-tao", label: "Ông Công Ông Táo" },
};

const CAL_COLORS: Record<string, string> = {
  tet: "#dc2626",
  "than-tai": "#c77d00",
  "nguyen-tieu": "#7c3aed",
  "hung-vuong": "#059669",
  "doan-ngo": "#dc2626",
  "vu-lan": "#7c3aed",
  "trung-thu": "#d97706",
  "ha-nguyen": "#0891b2",
  "ong-tao": "#92400e",
  ram: "#1d4ed8",
  "mung-1": "#cc323f",
};

function getRitual(
  yr: number,
  mo: number,
  day: number,
): { type: string; label: string } | null {
  const solar = Solar.fromYmd(yr, mo, day);
  const lunar = solar.getLunar();
  const lMonth = lunar.getMonth();
  const lDay = lunar.getDay();

  const festKey = `${lMonth}-${lDay}`;
  const festival = LUNAR_FESTIVALS_MAP[festKey];
  if (festival) return festival;

  if (lDay === 15)
    return { type: "ram", label: `Rằm tháng ${getLunarMonthName(lMonth)}` };
  if (lDay === 1)
    return {
      type: "mung-1",
      label: `Mùng 1 tháng ${getLunarMonthName(lMonth)}`,
    };

  if (lMonth === 12 && (lDay === 29 || lDay === 30)) {
    const next = Solar.fromYmd(yr, mo, day).nextDay(1).getLunar();
    if (next.getMonth() === 1 && next.getDay() === 1)
      return { type: "giao-thua", label: "Giao Thừa" };
  }

  return null;
}

function getUpcoming(
  count: number = 5,
): { key: string; type: string; label: string }[] {
  const today = new Date();
  const results: { key: string; type: string; label: string }[] = [];
  for (let i = 0; i < 365 && results.length < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const r = getRitual(d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (r) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      results.push({ key, ...r });
    }
  }
  return results;
}

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
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

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
      return getCookie(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const loadedRef = useRef(false);
  const [lastToken, setLastToken] = useState<string | null>(() =>
    getAccessToken(),
  );

  // Reset session when user changes
  useEffect(() => {
    const currentToken = getAccessToken();
    if (lastToken && currentToken !== lastToken) {
      removeCookie(SESSION_KEY);
      setSessionId(null);
      setMessages([]);
    }
    setLastToken(currentToken);
  }, [isLoggedIn]);

  // On mount: restore past messages from API if session exists
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (sessionId && isLoggedIn) {
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
  const [calOpen, setCalOpen] = useState(false);
  const [calViewDate, setCalViewDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

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
      if (!isLoggedIn) return;
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
          setCookie(SESSION_KEY, newSessionId, 86400 * 30);
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
      removeCookie(SESSION_KEY);
    } catch {}
    if (!isLoggedIn) {
      setMessages([]);
      return;
    }
    createChatSession()
      .then(({ session_id }) => {
        setSessionId(session_id);
        try {
          setCookie(SESSION_KEY, session_id, 86400 * 30);
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
            onClick={() => {
              setCalOpen(true);
              setCalViewDate(new Date());
            }}
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

      {/* ── Calendar Popup ── */}
      {calOpen &&
        (() => {
          const today = new Date();
          const yr = calViewDate.getFullYear();
          const mo = calViewDate.getMonth();
          const firstDow = new Date(yr, mo, 1).getDay();
          const startOffset = (firstDow + 6) % 7;
          const daysInMonth = new Date(yr, mo + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array(startOffset).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          const dayKey = (day: number) =>
            `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const prevMonth = () =>
            setCalViewDate(
              (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
            );
          const nextMonth = () =>
            setCalViewDate(
              (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
            );

          const upcoming = getUpcoming(4);

          return (
            <div
              className="fixed bottom-2 right-36 z-50"
              style={{
                width: "min(320px, calc(100vw - 32px))",
                fontFamily: "Be Vietnam Pro, sans-serif",
              }}
            >
              <div
                style={{
                  borderRadius: "0.75rem",
                  overflow: "visible",
                  boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
                  border: "1px solid rgba(204,50,63,0.18)",
                  backgroundColor: "white",
                }}
              >
                {/* Header */}
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
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {
                      [
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
                      ][mo]
                    }{" "}
                    {yr}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCalOpen(false)}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 text-white/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* DOW */}
                <div className="grid grid-cols-7 px-2 pt-2">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                    <div
                      key={d}
                      className="text-center"
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: i >= 5 ? "#cc323f" : "#94a3b8",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div
                  className="grid grid-cols-7 px-2 pb-2"
                  style={{ gap: "4px 0" }}
                >
                  {cells.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const key = dayKey(day);
                    const ritual = getRitual(yr, mo + 1, day);
                    const isToday =
                      key ===
                      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                    const isHovered = hoveredDay === key;

                    let bg = "transparent";
                    let textCol = "#1e293b";
                    let fw = 400;

                    if (ritual) {
                      const c = CAL_COLORS[ritual.type] || "#1d4ed8";
                      bg = c;
                      textCol = "white";
                      fw = 700;
                    }
                    if (isToday) {
                      bg = "#fef3c7";
                      textCol = "#92400e";
                      fw = 700;
                    }

                    return (
                      <div
                        key={key}
                        className="relative flex items-center justify-center"
                        style={{ height: "32px" }}
                      >
                        <div
                          onMouseEnter={() => ritual && setHoveredDay(key)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className="flex items-center justify-center rounded-full transition-all"
                          style={{
                            width: "28px",
                            height: "28px",
                            backgroundColor: bg,
                            cursor: ritual ? "pointer" : "default",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: fw,
                              color: textCol,
                            }}
                          >
                            {day}
                          </span>
                        </div>
                        {/* Tooltip */}
                        {isHovered && ritual && (
                          <div
                            className="absolute z-20 pointer-events-none"
                            style={{
                              bottom: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "#1e293b",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "0.6rem",
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                              }}
                            >
                              {ritual.label}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend & upcoming */}
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    padding: "6px 10px",
                  }}
                >
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1.5">
                    {[
                      { c: "#cc323f", l: "Mùng 1" },
                      { c: "#1d4ed8", l: "Rằm" },
                      { c: "#7c3aed", l: "Lễ" },
                      { c: "#c77d00", l: "Lễ lớn" },
                    ].map((l) => (
                      <div key={l.l} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: l.c }}
                        />
                        <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>
                          {l.l}
                        </span>
                      </div>
                    ))}
                  </div>
                  {upcoming.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        Sắp tới:
                      </p>
                      {upcoming.map((u) => (
                        <div key={u.key} className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: CAL_COLORS[u.type] || "#1d4ed8",
                            }}
                          />
                          <span
                            style={{ fontSize: "0.7rem", color: "#475569" }}
                          >
                            {u.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] md:w-[460px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            height: "min(520px, 70vh)",
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
                  className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
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
                    <ContentRenderer content={msg.text} />
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
