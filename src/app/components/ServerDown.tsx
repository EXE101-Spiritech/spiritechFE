import { Server, RefreshCw } from "lucide-react";

interface Props {
  onRetry: () => void;
  retrying: boolean;
}

export function ServerDown({ onRetry, retrying }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#f8fafc", fontFamily: "Be Vietnam Pro, sans-serif" }}
    >
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "#fef2f2" }}>
          <Server size={40} style={{ color: "#dc2626" }} />
        </div>

        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: "#0f172a", fontFamily: "Lora, serif" }}
        >
          Máy chủ không phản hồi
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Không thể kết nối đến máy chủ Spiritech. Vui lòng kiểm tra kết nối
          mạng và thử lại sau vài phút.
        </p>

        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:shadow-md disabled:opacity-50"
          style={{ background: "#cc323f" }}
        >
          <RefreshCw size={18} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Đang thử lại..." : "Thử lại"}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Nếu tình trạng kéo dài, vui lòng liên hệ hỗ trợ.
        </p>
      </div>
    </div>
  );
}
