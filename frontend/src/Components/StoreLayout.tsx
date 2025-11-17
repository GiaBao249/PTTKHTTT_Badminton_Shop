import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import BackToTopButton from "./BackToTop";

const StoreLayout = () => {
  return (
    <div className="App">
      <Header />
      <ScrollToTop />
      <Outlet />
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default StoreLayout;
