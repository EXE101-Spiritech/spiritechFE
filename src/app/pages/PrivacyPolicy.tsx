import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";
import { ContentRenderer } from "../components/ContentRenderer";

const CONTENT = `# CHÍNH SÁCH BẢO MẬT (PRIVACY POLICY)
**Hệ thống:** Spiritech Platform
**Phiên bản:** 1.0.2
**Ngày cập nhật:** 07/06/2026
**Căn cứ pháp lý:** Tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân (PDPD) tại Việt Nam.

---

## 1. Mục đích và Phạm vi thu thập dữ liệu
Spiritech thu thập dữ liệu phân tích hệ thống (Telemetry) và thông tin cơ bản nhằm mục đích duy nhất là vận hành ứng dụng, tối ưu hóa trải nghiệm người dùng và thực hiện nghĩa vụ hợp đồng thương mại. Dữ liệu bao gồm:
*   **Thông tin tài khoản cá nhân:** Họ tên, địa chỉ email, số điện thoại đăng ký.
*   **Dữ liệu tương tác hệ thống (Telemetry):** Lịch sử tìm kiếm, hành vi điều hướng, tỷ lệ khởi tạo đơn hàng và tỷ lệ bỏ giỏ hàng.
*   **Dữ liệu sử dụng tính năng AI:** Số phiên làm việc, số lượng tin nhắn gửi đi, số lượng Token tiêu thụ và chi phí tài nguyên tương ứng.

## 2. Cam kết an toàn dữ liệu tài chính (Zero-Storage Policy)
Để loại bỏ hoàn toàn rủi ro bảo mật thông tin tài chính của khách hàng cá nhân:
*   Hệ thống của Spiritech **KHÔNG** lưu trữ, **KHÔNG** ghi nhận và **KHÔNG** xử lý bất kỳ thông tin nhạy cảm nào liên quan đến số tài khoản ngân hàng, mã PIN, số thẻ tín dụng hoặc thông tin xác thực giao dịch của người dùng trên cơ sở dữ liệu.
*   Toàn bộ luồng giao dịch nạp tiền và thanh toán được ủy quyền hoàn toàn cho cổng thanh toán đối tác (PayOS). PayOS chịu trách nhiệm mã hóa và bảo mật luồng tiền theo tiêu chuẩn bảo mật quốc tế.

## 3. Thời gian lưu trữ dữ liệu
*   Thông tin tài khoản và nhật ký sử dụng AI được lưu trữ an toàn trong suốt thời gian tài khoản còn hoạt động trên hệ thống.
*   Dữ liệu Telemetry hành vi (nhật ký nhấp chuột, dữ liệu giỏ hàng) sẽ được tổng hợp, mã hóa ẩn danh hoặc tự động xóa bỏ sau khi hết thời hạn đối soát vận hành nhằm giảm tải hệ thống lưu trữ.

## 4. Quyền của chủ thể dữ liệu
Theo Nghị định 13/2023/NĐ-CP, người dùng có toàn quyền:
*   Yêu cầu truy xuất, chỉnh sửa thông tin cá nhân hiện có.
*   Yêu cầu rút lại sự chấp thuận xử lý dữ liệu hoặc yêu cầu xóa bỏ tài khoản hoàn toàn khỏi hệ thống (lưu ý: việc này đồng nghĩa với việc chấm dứt quyền sử dụng dịch vụ trả phí đi kèm).

## 5. Đơn vị kiểm soát và xử lý dữ liệu
Mọi yêu cầu, thắc mắc hoặc khiếu nại liên quan đến an toàn thông tin dữ liệu, vui lòng gửi về bộ phận kỹ thuật và vận hành hạ tầng của Spiritech qua email quản trị viên hệ thống.`;

export default function PrivacyPolicy() {
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
            <span className="text-white">Chính sách bảo mật</span>
          </nav>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#e6bb0c]" />
            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "white",
                fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
              }}
            >
              Chính sách bảo mật
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
