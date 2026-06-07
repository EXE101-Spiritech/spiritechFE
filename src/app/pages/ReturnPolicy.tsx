import { Link } from "react-router";
import { RotateCcw } from "lucide-react";
import { ContentRenderer } from "../components/ContentRenderer";

const CONTENT = `# CHÍNH SÁCH ĐỔI TRẢ VÀ HOÀN TIỀN (REFUND POLICY)
**Hệ thống:** Spiritech Platform
**Phiên bản:** 1.0.2
**Ngày cập nhật:** 07/06/2026

---

## 1. Nguyên tắc hoàn tiền bảo mật tối đa
Nhằm loại bỏ hoàn toàn việc lưu trữ thông tin thẻ hoặc số tài khoản ngân hàng trái phép trên cơ sở dữ liệu hệ thống, Spiritech không thiết lập tính năng tự động hoàn tiền trực tiếp thông qua mã nguồn ứng dụng backend.
*   Mọi quy trình đổi trả và hoàn tiền đều được xử lý bằng **quy trình vận hành thủ công ngoại băng (Out-of-band Manual Workflow)** bởi đội ngũ quản trị viên tài chính của Spiritech.
*   Hệ thống cam kết an toàn tuyệt đối khi không thu thập, không lưu lại số tài khoản của khách hàng vào database sau khi quy trình hoàn tiền kết thúc.

## 2. Điều kiện áp dụng đổi trả, hoàn tiền
Khách hàng cá nhân (B2C) được quyền yêu cầu hoàn tiền trong các trường hợp sau:
*   Hệ thống xảy ra lỗi kỹ thuật nghiêm trọng tại tầng lõi (Core Backend) dẫn đến việc đơn hàng đã chuyển khoản thành công (có biên lai xác nhận) nhưng hệ thống không kích hoạt tính năng hoặc không cộng số lượng Token AI tương ứng sau 24 giờ.
*   Khách hàng mua nhầm gói dịch vụ và có yêu cầu hủy, hoàn tiền trong vòng 03 ngày kể từ ngày giao dịch thành công, với điều kiện tổng số lượng Token AI trong tài khoản chưa được tiêu thụ quá 5%.

## 3. Quy trình xử lý hoàn tiền thủ công (Manual Step-by-Step)
Khi phát sinh nhu cầu hoàn tiền, Khách hàng vui lòng thực hiện theo các bước sau:

*   **Bước 1:** Gửi yêu cầu hỗ trợ đến email chính thức của Spiritech. Tiêu đề email ghi rõ: \`[Yêu cầu hoàn tiền] - Mã đơn hàng (Ví dụ: SPTECH_ORDER_1002)\`.
*   **Bước 2:** Đính kèm ảnh chụp biên lai giao dịch ngân hàng thành công (hiển thị rõ nội dung chuyển khoản tự động có chứa mã đối soát giao dịch và mã tham chiếu từ PayOS).
*   **Bước 3:** Quản trị viên hệ thống đối chiếu mã đơn hàng trên email với bảng cơ sở dữ liệu PostgreSQL nội bộ và lịch sử giao dịch trên trang quản trị PayOS.
*   **Bước 4:** Sau khi xác thực thông tin trùng khớp, quản trị viên sẽ thực hiện lệnh chuyển khoản thủ công bằng ứng dụng ngân hàng trực tiếp về đúng số tài khoản và tên chủ tài khoản đã thực hiện giao dịch gốc.
*   **Bước 5:** Trạng thái đơn hàng trên hệ thống sẽ được cập nhật thủ công thành \`REFUNDED\` (Đã hoàn tiền). Hệ thống đồng thời khóa quyền truy cập hoặc khấu trừ số lượng Token tương ứng của gói dịch vụ đó.

## 4. Thời gian xử lý
Khoản tiền hoàn trả sẽ được chuyển về tài khoản gốc của Khách hàng trong vòng từ 03 đến 05 ngày làm việc, tùy thuộc vào thời gian xử lý đối soát nội bộ và chu kỳ làm việc của hệ thống liên ngân hàng.`;

export default function ReturnPolicy() {
  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="py-10" style={{ backgroundColor: "#902131" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-white/60 text-sm mb-3">
            <Link to="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Chính sách đổi trả</span>
          </nav>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-[#e6bb0c]" />
            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "white",
                fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
              }}
            >
              Chính sách đổi trả
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div
            className="text-gray-600 leading-relaxed"
            style={{ fontSize: "17px" }}
          >
            <ContentRenderer
              content={CONTENT}
              className="leading-loose [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-6 [&_li]:mb-2 [&_hr]:my-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
