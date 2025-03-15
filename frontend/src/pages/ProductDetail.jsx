import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css"; 


const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(response => setProduct(response.data))
      .catch(error => console.error("Error fetching product details:", error));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details-container">
      <img src={product.image} alt={product.name} className="product-details-image" />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p className="product-price">${product.price}</p>
    </div>
  );
};

export default ProductDetails;
