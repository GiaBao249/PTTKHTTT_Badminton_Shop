import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import img1 from "../assets/c1.jpg";
import img2 from "../assets/c2.jpg";
import img4 from "../assets/c4.jpg";

const slides = [
  {
    image: img4,
    title: "Unleash Your Power",
    subtitle: "Premium rackets engineered for champions",
    cta: "Shop Now",
    align: "center",
  },
  {
    image: img1,
    title: "Elevate Your Game",
    subtitle: "Professional-grade equipment for serious players",
    cta: "Explore Collection",
    align: "center",
  },
  {
    image: img2,
    title: "Victory Starts Here",
    subtitle: "Get up to 30% off on selected rackets",
    cta: "Shop Deals",
    align: "center",
  },
];

const Carousel = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative w-full">
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 grid place-items-center bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white hover:scale-110 transition-all duration-300 rounded-full shadow-lg group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 grid place-items-center bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white hover:scale-110 transition-all duration-300 rounded-full shadow-lg group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        // pagination={{
        //   clickable: true,
        //   bulletClass: "swiper-pagination-bullet !bg-white/60 !w-3 !h-3",
        //   bulletActiveClass: "swiper-pagination-bullet-active !bg-white !w-8",
        // }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={800}
        loop={true}
        slidesPerView={1}
        className="w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="!h-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="block w-full h-full object-cover scale-105 animate-[ken-burns_20s_ease-in-out_infinite]"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-start text-left">
              <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-4 md:space-y-6 animate-[slide-up_0.8s_ease-out]">
                  <h2 className="font-bold text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-2xl leading-tight">
                    {slide.title}
                  </h2>
                  <p className="font-light text-lg md:text-2xl lg:text-3xl text-white/90 drop-shadow-lg max-w-2xl">
                    {slide.subtitle}
                  </p>
                  <button className="mt-4 md:mt-8 px-8 md:px-10 py-3 md:py-4 bg-white text-gray-900 font-semibold text-base md:text-lg rounded-full hover:bg-gray-100 hover:scale-110 transition-all duration-300 shadow-2xl flex items-center gap-2 group">
                    {slide.cta}
                    <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>
        {`
          @keyframes ken-burns {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(1.1);
            }
          }

          .swiper-slide-active img {
            animation: ken-burns 10s ease-out forwards;
          }

          .swiper-slide:not(.swiper-slide-active) img {
            animation: none;
            transform: scale(1);
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Carousel;
