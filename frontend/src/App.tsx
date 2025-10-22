import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import HomePage from "./HomePage/HomePage";
import ProductsPage from "./ProductsPage/ProductsPage";
import Footer from "./Components/Footer";
const App = () => {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ProductsPage" element={<ProductsPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
