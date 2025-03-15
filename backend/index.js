import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json()); 


mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);


const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);


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



app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


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



app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});


app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});


app.post("/api/products", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const { name, price, description, image, category } = req.body;
  const product = new Product({ name, price, description, image, category });
  await product.save();
  res.status(201).json(product);
});


app.put("/api/products/:id", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
  res.json(updatedProduct);
});


app.delete("/api/products/:id", verifyToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted successfully" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
