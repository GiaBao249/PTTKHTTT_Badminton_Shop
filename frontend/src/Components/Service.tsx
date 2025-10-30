import { Shield, Truck, Award, Headphones } from "lucide-react";
const Service = () => {
  const serviceData = [
    {
      icon: "Shield",
      title: "100% Chính hãng",
      description:
        "Tất cả sản phẩm đều chính hãng, nhập trực tiếp từ nhà phân phối uỷ quyền.",
    },
    {
      icon: "Truck",
      title: "Miễn phí giao hàng",
      description:
        "Miễn phí giao hàng cho đơn từ 350.000đ (áp dụng khu vực nội thành).",
    },
    {
      icon: "Award",
      title: "Bảo hành đầy đủ",
      description: "Chính sách bảo hành rõ ràng cho vợt và thiết bị đi kèm.",
    },
    {
      icon: "Headphones",
      title: "Hỗ trợ 24/7",
      description:
        "Đội ngũ hỗ trợ luôn sẵn sàng 24/7 để giải đáp mọi thắc mắc của bạn.",
    },
  ];
  return (
    <section className="py-12 md:py-16 border border-y-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center">Vì sao chọn N&B?</h2>
        <p className="text-xl text-center text-gray-600 mt-4">
          Đối tác đáng tin cậy về thiết bị cầu lông của bạn
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {serviceData.map((service, index) => (
          <div className="flex flex-col items-center gap-1" key={index}>
            <p className="text-center">
              {service.icon === "Shield" && (
                <Shield size={32} className="text-gray-800" />
              )}
              {service.icon === "Truck" && (
                <Truck size={32} className="text-gray-800" />
              )}
              {service.icon === "Award" && (
                <Award size={32} className="text-gray-800" />
              )}
              {service.icon === "Headphones" && (
                <Headphones size={32} className="text-gray-800" />
              )}
            </p>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Service;
