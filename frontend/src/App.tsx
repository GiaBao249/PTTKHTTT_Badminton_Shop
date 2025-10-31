import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import HomePage from "./HomePage/HomePage";
import ProductsPage from "./ProductsPage/ProductsPage";
import Footer from "./Components/Footer";
import ProductItem from "./ProductsPage/ProductItem";
import ScrollToTop from "./Components/ScrollToTop";
import BackToTopButton from "./Components/BackToTop";
import CheckOut from "./Components/CheckOut";
import LoginForm from "./Auth/LoginForm";
import RegisterForm from "./Auth/RegisterForm";
// import Cart from "./Cart/Cart";
const App = () => {
  return (
    <div className="App">
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products-page" element={<ProductsPage />} />
        {/* <Route path="/cart-page" element={<Cart />} /> */}
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/products-page/product/:id" element={<ProductItem />} />
      </Routes>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default App;
