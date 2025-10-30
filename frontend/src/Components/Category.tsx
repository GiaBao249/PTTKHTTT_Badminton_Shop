import img1 from "../assets/c1.jpg";
const Category = () => {
  const categories = [
    {
      title: "Vợt cầu lông",
      img: img1,
      subtitle: "Vợt chất lượng cao, chuyên nghiệp",
    },
    {
      title: "Giày cầu lông",
      img: img1,
      subtitle: "Thoải mái, êm ái, linh hoạt, bao vệ đôi chân",
    },
    {
      title: "Quả cầu",
      img: img1,
      subtitle: "Nhẹ, bền, chất lượng cao",
    },
    {
      title: "Áo cầu lông",
      img: img1,
      subtitle: "Thoải mái, dễ chịu, thoáng mát",
    },
    {
      title: "Phụ kiện cầu lông",
      img: img1,
      subtitle: "Túi xách, bình nước, các vật dụng đi kèm ...",
    },
  ];
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 mb-8 md:mb-10">
          <h2 className="font-bold text-4xl text-gray-900">
            Danh mục sản phẩm
          </h2>
          <p className="font-normal text-lg md:text-xl text-gray-600 mt-4">
            Tìm kiếm sản phẩm phù hợp với bạn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 xl:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl
                 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)]
                 ring-1 ring-black/5 hover:ring-black/10
                 transition-all duration-500 hover:-translate-y-1.5 bg-gray-100 dark:bg-gray-900"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={category.img}
                  alt={category.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/65" />
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 px-4 md:px-5 pb-4 md:pb-5 text-white">
                <h3 className="text-lg md:text-xl font-bold">
                  {category.title}
                </h3>
                <p className="text-sm md:text-base text-white/90">
                  {category.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;
