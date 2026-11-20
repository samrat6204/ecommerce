
import Login from "./pages/login";
import Register from "./pages/Register";
// Main app with all routes
// task completed
// updated: 2026-10-05
// new work begin
// last updated: 2026-11-19
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./component/navbar";
import Footer from "./component/Footer";
import Category from "./pages/Category";
import AddProduct from "./pages/AddProduct";
import ProductPage from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminRoute from "./component/AdminRoute";
import AdminCategories from "./pages/AdminCategories";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/category"
            element={<Category />}
          />

          <Route
            path="/add-product"
            element={<AddProduct />}
          />

          <Route 
          path="/products"
          element={<ProductPage/>}
          />


          <Route
          path="/admin/categories"
          element={
          <AdminRoute>
           <AdminCategories />
          </AdminRoute>
           }
          />

          <Route
            path="/cart"
            element={<Cart />}
          />
          <Route path="/checkout" element={<Checkout />} />
           <Route path="/order-success/:orderId" element={<OrderSuccess />} />

        </Routes>


      </main>
      <Footer />
    </div>
  );
}

export default App;