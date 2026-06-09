import { Link } from "react-router";
import { Heart, ShieldCheck, Leaf, Users, ArrowRight } from "lucide-react";
import teamImage from "figma:asset/fae88b824be23ef1292d63828d73339f70ab8ed4.png";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1713914565881-a0a806d97909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";
const STORY_IMG =
  "https://images.unsplash.com/photo-1608124392129-2bd5c122f851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";

export default function About() {
  return (
    <div
      style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
      className="min-h-screen bg-white"
    >
      {/* Hero */}
      <div
        className="relative py-36 text-center"
        style={{
          backgroundImage: `url(${ABOUT_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(58,14,22,0.95) 0%, rgba(144,33,49,0.75) 60%, rgba(58,14,22,0.90) 100%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1
            style={{
              fontFamily: "Lora, serif",
              color: "#e6bb0c",
              fontSize: "clamp(2rem, 7vw, 4.5rem)",
              lineHeight: 1.15,
            }}
          >
            SpiriTech
          </h1>
          <p
            className="mt-5"
            style={{
              color: "white",
              fontSize: "clamp(0.95rem, 2.2vw, 1.25rem)",
              lineHeight: 1.7,
            }}
          >
            Hành trình gìn giữ và lan tỏa văn hóa thờ cúng truyền thống Việt Nam
          </p>
        </div>
      </div>

      {/* Brand Story */}
      <section className="py-16" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: "#cc323f", fontWeight: 600 }}
            >
              Câu chuyện của chúng tôi
            </p>
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              }}
            >
              Khởi nguồn từ tình yêu văn hóa dân tộc
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-lg h-80 lg:h-[420px]">
              <img
                src={STORY_IMG}
                alt="Câu chuyện của chúng tôi"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  SpiriTech được thành lập năm 2026 bởi một nhóm những người con
                  đất Việt với tình yêu sâu sắc đối với văn hóa thờ cúng truyền
                  thống. Chúng tôi nhận thấy nhiều gia đình đang gặp khó khăn
                  trong việc chuẩn bị đầy đủ lễ vật theo đúng phong tục do cuộc
                  sống hiện đại bận rộn.
                </p>
                <p>
                  Từ đó, chúng tôi ra đời với sứ mệnh trở thành người bạn đồng
                  hành tin cậy, giúp các gia đình Việt dễ dàng thực hiện nghi lễ
                  thờ cúng một cách trang trọng và đúng phong tục, dù bận rộn
                  đến đâu.
                </p>
                <p>
                  Mỗi sản phẩm chúng tôi cung cấp đều được lựa chọn kỹ lưỡng từ
                  các nghệ nhân làng nghề truyền thống, đảm bảo chất lượng và
                  giá trị văn hóa. Chúng tôi tự hào là cầu nối giữa các làng
                  nghề truyền thống và người tiêu dùng hiện đại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}

      {/* Values */}
      <section className="py-16" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-1"
              style={{ color: "#cc323f", fontWeight: 600 }}
            >
              Cam kết
            </p>
            <h2
              style={{
                fontFamily: "Lora, serif",
                color: "#0f172a",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              }}
            >
              Giá Trị Cốt Lõi
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Tâm huyết",
                desc: "Mỗi sản phẩm được lựa chọn với tất cả tình yêu và sự hiểu biết về văn hóa tâm linh Việt Nam.",
              },
              {
                icon: ShieldCheck,
                title: "Chất lượng",
                desc: "Cam kết 100% hàng chính hãng, nguồn gốc rõ ràng, an toàn cho người sử dụng và môi trường.",
              },
              {
                icon: Leaf,
                title: "Thiên nhiên",
                desc: "Ưu tiên sản phẩm từ thiên nhiên, không hóa chất độc hại, thân thiện với môi trường.",
              },
              {
                icon: Users,
                title: "Cộng đồng",
                desc: "Hỗ trợ các làng nghề truyền thống, tạo việc làm cho nghệ nhân và bảo tồn di sản văn hóa.",
              },
            ].map((val) => (
              <div
                key={val.title}
                className="bg-white rounded-2xl p-6 shadow-sm text-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#fdf4f3" }}
                >
                  <val.icon className="w-7 h-7" style={{ color: "#cc323f" }} />
                </div>
                <h3
                  style={{ fontFamily: "Lora, serif", color: "#0f172a" }}
                  className="mb-2"
                >
                  {val.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm uppercase tracking-widest mb-1"
            style={{ color: "#cc323f", fontWeight: 600 }}
          >
            Đội ngũ
          </p>
          <h2
            style={{
              fontFamily: "Lora, serif",
              color: "#0f172a",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
            className="mb-3"
          >
            Những Con Người Tâm Huyết
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10">
            Đội ngũ chúng tôi gồm những người yêu văn hóa Việt, chuyên gia về
            phong tục thờ cúng và những nghệ nhân làng nghề truyền thống.
          </p>
          <div className="max-w-3xl mx-auto w-full">
            <img
              src={ABOUT_IMG}
              alt="Đội ngũ SpiriTech"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-12 text-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <h2
            style={{
              fontFamily: "Lora, serif",
              color: "#0f172a",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
            className="mb-4"
          >
            Khám Phá Sản Phẩm Của Chúng Tôi
          </h2>
          <p className="text-gray-500 mb-6">
            Hàng loạt các sản phẩm chất lượng, chuẩn văn hóa, giao tận nơi nội
            thành.
          </p>
          <Link
            to="/products"
            onClick={() => window.scrollTo({ top: 0 })}
            className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full transition-colors"
            style={{ backgroundColor: "#cc323f", fontWeight: 600 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ab2534";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#cc323f";
            }}
          >
            Xem Sản Phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
