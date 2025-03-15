import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // ✅ Ensure it's imported

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">E-Shop</Link>

        {/* Mobile Toggle */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/cart">Cart</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
          </ul>
        </div>

        {/* Right-Side Icons */}
        <div className="navbar-icons">
          <Link to="/search" className="icon"><i className="fas fa-search"></i></Link>
          <Link to="/cart" className="icon"><i className="fas fa-shopping-cart"></i></Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
