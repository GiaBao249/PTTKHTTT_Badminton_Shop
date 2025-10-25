import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import HomePage from "./HomePage/HomePage";
import ProductsPage from "./ProductsPage/ProductsPage";
import Footer from "./Components/Footer";
import ProductItem from "./ProductsPage/ProductItem";
import { Navigate } from "react-router-dom";
const App = () => {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ProductsPage" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductItem />} />
        <Route
          path="/ProductItem"
          element={<Navigate to="/ProductsPage" replace />}
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
