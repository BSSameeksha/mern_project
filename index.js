import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json()); // Middleware for parsing JSON

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// =========================
// 1️⃣ User Schema & Model
// =========================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

// ===========================
// 2️⃣ Product Schema & Model
// ===========================
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// ===========================
// 3️⃣ JWT Authentication Middleware
// ===========================
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// ===========================
// 4️⃣ User Authentication Routes
// ===========================

// Register User
app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = new User({ name, email, password });
  await user.save();
  res.status(201).json({ message: "User registered successfully" });
});

// Login User
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// ===========================
// 5️⃣ CRUD Operations for Products
// ===========================

// ✅ Get all products
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ✅ Get a product by ID
app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// ✅ Create a new product (Protected: Admin only)
app.post("/api/products", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const { name, price, description, image, category } = req.body;
  const product = new Product({ name, price, description, image, category });
  await product.save();
  res.status(201).json(product);
});

// ✅ Update a product by ID (Protected: Admin only)
app.put("/api/products/:id", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
  res.json(updatedProduct);
});

// ✅ Delete a product by ID (Protected: Admin only)
app.delete("/api/products/:id", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted successfully" });
});

// ===========================
// 6️⃣ Start the Server
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
