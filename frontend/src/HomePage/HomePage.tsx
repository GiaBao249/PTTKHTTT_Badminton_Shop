import Carousel from "../Components/Carousel";
import Category from "../Components/Category";
import HotProducts from "../Components/HotProducts";
import FeaturedProducts from "../Components/FeaturedProducts";
import Service from "../Components/Service";

const HomePage = () => {
  return (
    <div>
      <Carousel />
      <Category />
      <HotProducts />
      <FeaturedProducts />
      <Service />
    </div>
  );
};

export default HomePage;
