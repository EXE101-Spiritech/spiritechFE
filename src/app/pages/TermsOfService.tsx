import { Link } from "react-router";
import { FileText } from "lucide-react";
import { ContentRenderer } from "../components/ContentRenderer";

const CONTENT = `# ĐIỀU KHOẢN DỊCH VỤ (TERMS OF SERVICE)
**Hệ thống:** Spiritech Platform
**Phiên bản:** 1.0.2
**Ngày cập nhật:** 07/06/2026

---

## 1. Chấp thuận điều khoản
Bằng việc hoàn tất quy trình đăng ký tài khoản và kích hoạt thanh toán trên hệ thống Spiritech, người dùng (sau đây gọi là Khách hàng) đồng ý ràng buộc và tuân thủ toàn bộ các quy định được nêu trong văn bản này. Nếu không đồng ý với bất kỳ điều khoản nào, Khách hàng có quyền ngừng truy cập hệ thống ngay lập tức.

## 2. Quy định về tài khoản cá nhân (B2C)
*   Mỗi tài khoản được cấp phát trên hệ thống chỉ thuộc quyền sở hữu của một cá nhân duy nhất. Khách hàng chịu trách nhiệm tự bảo mật thông tin cấu hình xác thực cá nhân.
*   Khách hàng không được phép chia sẻ token truy cập, tài khoản hoặc can thiệp bằng mã độc, công cụ tự động (bots) làm ảnh hưởng đến độ ổn định và hiệu năng chịu tải (high-concurrency) của hệ thống Core Monolith thuộc Spiritech.

## 3. Quy định thanh toán và Giao dịch thương mại
*   Spiritech áp dụng hình thức khóa mã VietQR động thông qua cổng thanh toán PayOS.
*   Khi Khách hàng thực hiện quét mã QR, cú pháp chuyển khoản và số tiền sẽ được khóa cố định theo mã định danh duy nhất của đơn hàng (\`SPTECH_ORDER_XXXX\`). Khách hàng không được cố ý thay đổi nội dung chuyển khoản tự động này nhằm đảm bảo tính chính xác của luồng đối soát tự động trên hệ thống.
*   Mọi giao dịch thanh toán thành công sẽ được hệ thống ghi nhận ngay khi có tín hiệu Webhook xác nhận từ PayOS và số dư tính năng hoặc quyền truy cập của Khách hàng sẽ được kích hoạt tự động.

## 4. Chính sách sử dụng tài nguyên AI (Fair Use Policy)
*   Khách hàng sử dụng các tính năng liên quan đến AI (Tác tử thông minh, xử lý ngôn ngữ) sẽ tiêu thụ tài nguyên dựa trên số lượng Token (Input/Output).
*   Spiritech cam kết duy trì tính minh bạch về chi phí AI bằng cách hiển thị trực quan số lượng Token tiêu thụ thực tế trên giao diện bảng điều khiển của Khách hàng. Hệ thống có quyền tạm ngưng cung cấp dịch vụ nếu phát hiện hành vi cố tình spam hoặc lạm dụng API gây nghẽn hạ tầng chung.

## 5. Giới hạn trách nhiệm pháp lý
Spiritech nỗ lực tối đa để đảm bảo hệ thống vận hành liên tục 24/7. Tuy nhiên, chúng tôi không chịu trách nhiệm cho các trường hợp gián đoạn dịch vụ do sự cố hạ tầng đám mây của bên thứ ba, nghẽn mạng viễn thông diện rộng từ phía ngân hàng hoặc các trường hợp bất khả kháng theo quy định của pháp luật.`;

export default function TermsOfService() {
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
            <span className="text-white">Điều khoản dịch vụ</span>
          </nav>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#e6bb0c]" />
            <h1
              style={{
                fontFamily: "Lora, serif",
                color: "white",
                fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
              }}
            >
              Điều khoản dịch vụ
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
