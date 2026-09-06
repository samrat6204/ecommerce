import ProductPage from "./pages/product";
import Login from "./pages/login";
import Register from "./pages/register";
import { Navigate,Route,Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;