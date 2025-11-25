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
import RequirePermission from "./Admin/RequirePermission";
import AdminLayout from "./Admin/AdminLayout";
import Dashboard from "./Admin/Pages/Dashboard";
import Products from "./Admin/Pages/Products";
import Orders from "./Admin/Pages/Orders";
import Invoices from "./Admin/Pages/Invoices";
import Customers from "./Admin/Pages/Customers";
import PurchaseOrders from "./Admin/Pages/PurchaseOrders";
import Permissions from "./Admin/Pages/Permissions";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import OrderResultCheckout from "./Components/OrderResultCheckout";
import VNPayReturn from "./Components/VNPayReturn";
import VietQRPayment from "./Components/VietQRPayment";
import VietQRTestCallback from "./Components/VietQRTestCallback";

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
          <Route 
            index 
            element={
              <RequirePermission 
                permission="dashboard:read" 
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Dashboard />
              </RequirePermission>
            } 
          />
          <Route 
            path="products" 
            element={
              <RequirePermission 
                permission="product:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem sản phẩm. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Products />
              </RequirePermission>
            } 
          />
          <Route 
            path="orders" 
            element={
              <RequirePermission 
                permission="order:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem đơn hàng. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Orders />
              </RequirePermission>
            } 
          />
          <Route 
            path="invoices" 
            element={
              <RequirePermission 
                permission="invoice:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem hóa đơn. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Invoices />
              </RequirePermission>
            } 
          />
          <Route 
            path="purchase-orders" 
            element={
              <RequirePermission 
                permission="purchase_order:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem phiếu nhập. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <PurchaseOrders />
              </RequirePermission>
            } 
          />
          <Route 
            path="customers" 
            element={
              <RequirePermission 
                permission="customer:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền xem khách hàng. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Customers />
              </RequirePermission>
            } 
          />
          <Route 
            path="permissions" 
            element={
              <RequirePermission 
                permission="permission:read"
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                      <p className="text-gray-600">Bạn không có quyền quản lý phân quyền. Vui lòng liên hệ quản trị viên.</p>
                    </div>
                  </div>
                }
              >
                <Permissions />
              </RequirePermission>
            } 
          />
        </Route>
      </Route>
      <Route element={<OrderResultCheckout />}>
        <Route path="/result-order/:id" element={<OrderResultCheckout />} />
      </Route>
      <Route path="/payment/vnpay/success" element={<VNPayReturn />} />
      <Route path="/payment/vnpay/fail" element={<VNPayReturn />} />
      <Route path="/payment/vietqr/:orderId" element={<VietQRPayment />} />
      <Route
        path="/payment/vietqr/:orderId/test-callback"
        element={<VietQRTestCallback />}
      />
    </Routes>
  );
};

export default App;
