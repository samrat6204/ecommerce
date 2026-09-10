
import Login from "./pages/login";
import Register from "./pages/Register";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./component/navbar";
import Category from "./pages/Category";
import AddProduct from "./pages/AddProduct";
import ProductPage from "./pages/product";

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


        </Routes>


      </main>
    </div>
  );
}

export default App;