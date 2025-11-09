import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import StoreLayout from "./Components/StoreLayout";
import HomePage from "./HomePage/HomePage";
import ProductsPage from "./ProductsPage/ProductsPage";
import ProductItem from "./ProductsPage/ProductItem";
import CheckOut from "./Components/CheckOut";
import LoginForm from "./Auth/LoginForm";
import RegisterForm from "./Auth/RegisterForm";
import Cart from "./Cart/Cart";
import AccountPage from "./Account/AccountPage";
import RequireAdmin from "./Admin/RequireAdmin";
import AdminLayout from "./Admin/AdminLayout";
import Dashboard from "./Admin/Pages/Dashboard";
import Products from "./Admin/Pages/Products";
import Orders from "./Admin/Pages/Orders";
import Customers from "./Admin/Pages/Customers";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import OrderResultCheckout from "./Components/OrderResultCheckout";

const App = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.role === "admin" && !location.pathname.startsWith("/admin")) {
      if (location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, isLoading, location.pathname, navigate]);
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products-page" element={<ProductsPage />} />
        <Route path="/cart-page" element={<Cart />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/products-page/product/:id" element={<ProductItem />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
        </Route>
      </Route>
      <Route element={<OrderResultCheckout />}>
        <Route path="/result-order/:id" element={<OrderResultCheckout />} />
      </Route>
    </Routes>
  );
};

export default App;
