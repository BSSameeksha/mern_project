import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  // ✅ Function to add product to cart
  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="products-container">
      <h2 className="products-title">Explore Our Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price}</p>
            <button onClick={() => addToCart(product)} className="add-to-cart-btn">Add to Cart</button>
            <Link to={`/products/${product._id}`} className="view-details-btn">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
