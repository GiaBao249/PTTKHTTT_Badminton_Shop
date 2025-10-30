import { Copyright, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <section className="pt-12 pb-5 md:pt-16 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">N&B</h2>
            <p className="text-gray-600 text-sm">
              Cửa hàng cầu lông uy tín. Sản phẩm chất lượng, dịch vụ tận tâm,
              giao hàng nhanh chóng.
            </p>
            <div className="flex flex-row gap-6 items-center">
              <a href="#">
                <Facebook size={18} />
              </a>
              <a href="#">
                <Instagram size={18} />
              </a>
              <a href="#">
                <Twitter size={18} />
              </a>
              <a href="#">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-bold text-sm">Liên kết nhanh</p>
            <p className="font-normal text-sm">Về chúng tôi</p>
            <p className="font-normal text-sm">Giao hàng & Đổi trả</p>
            <p className="font-normal text-sm">Chính sách bảo mật</p>
            <p className="font-normal text-sm">Điều khoản sử dụng</p>
            <p className="font-normal text-sm">Câu hỏi thường gặp</p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-bold text-sm">Liên hệ</p>
            <p className="font-normal text-sm">123 Đường Cầu Lông</p>
            <p className="font-normal text-sm">TP. Hồ Chí Minh, Việt Nam</p>
            <p className="font-normal text-sm">+84 123 456 789</p>
            <p className="font-normal text-sm">info@nbbadminton.com</p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-bold text-sm">Nhận bản tin</p>
            <p className="font-normal text-sm">
              Đăng ký để nhận ưu đãi và cập nhật mới.
            </p>
            <div className="flex flex-row gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="placeholder:text-sm w-full h-10 pl-4 pr-4 rounded-l-lg border border-black/10 bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <button className="text-sm h-10 w-32 px-4 rounded-r-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-1 mt-10 border-t border-gray-200 pt-6">
          <Copyright size={16} className="mt-0.5" />
          <p className="text-sm">2025 N&B Badminton Shop. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
