import Header from "./Components/Header";
import Carousel from "./Components/Carousel";
import Category from "./Components/Category";
import FeaturedProducts from "./Components/FeaturedProducts";
import HotProducts from "./Components/HotProducts";
import Footer from "./Components/Footer";
import Service from "./Components/service";
const App = () => {
  return (
    <div>
      <Header />
      <Carousel />
      <Category />
      <FeaturedProducts />
      <HotProducts />
      <Service />
      <Footer />
    </div>
  );
};

export default App;
