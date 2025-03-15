import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Login from "./pages/Login"; // ✅ Import Login
import Register from "./pages/Register"; // ✅ Import Register
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} /> {/* ✅ Add Login */}
        <Route path="/register" element={<Register />} /> {/* ✅ Add Register */}
      </Routes>
    </>
  );
}

export default App;
