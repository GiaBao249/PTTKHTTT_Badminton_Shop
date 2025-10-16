import { Shield, Truck, Award, Headphones } from "lucide-react";
const Service = () => {
  const serviceData = [
    {
      icon: "Shield",
      title: "100% Authentic",
      description:
        "All products are genuine and sourced directly from authorized distributors.",
    },
    {
      icon: "Truck",
      title: "Free Delivery",
      description:
        "Enjoy free delivery on all orders over $50 within the continental US.",
    },
    {
      icon: "Award",
      title: "Warranty Included",
      description:
        "Comprehensive warranty coverage on all rackets and equipment",
    },
    {
      icon: "Headphones",
      title: "24/7 Customer Support",
      description:
        "Our support team is available 24/7 to assist you with any inquiries.",
    },
  ];
  return (
    <section className="py-12 md:py-16 border border-y-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center">Why Choose N&B?</h2>
        <p className="text-xl text-center text-gray-600 mt-4">
          Your trusted badminton equipment partner
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
