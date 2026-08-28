const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

// GET /api/products - list products with optional filters
// query: section, category, type, minPrice, maxPrice, size, sort, page, limit
router.get("/", (req, res) => {
  const { section, category, type, minPrice, maxPrice, size, sort, page, limit, onSale } = req.query;
  let products = readData("products.json");

  if (section) {
    products = products.filter((p) => p.section === section);
  }
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (type) {
    products = products.filter((p) => p.type === type);
  }
  if (onSale === "true") {
    products = products.filter((p) => p.discount != null);
  }
  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }
  if (size) {
    products = products.filter((p) => p.sizes.includes(size));
  }

  if (sort === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  const total = products.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || total || 1);
  const start = (pageNum - 1) * pageSize;
  const paginated = limit ? products.slice(start, start + pageSize) : products;

  res.json({
    products: paginated,
    total,
    page: pageNum,
    totalPages: limit ? Math.max(1, Math.ceil(total / pageSize)) : 1,
  });
});

// GET /api/products/:id - single product
router.get("/:id", (req, res) => {
  const products = readData("products.json");
  const product = products.find((p) => p.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

// POST /api/products - create product
router.post("/", (req, res) => {
  const { name, price, category, type, section, discount, description, image, sizes, colors } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Name, price and category are required" });
  }

  const products = readData("products.json");
  const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const newProduct = {
    id: nextId,
    name,
    price: Number(price),
    originalPrice: discount ? Math.round(Number(price) / (1 - Number(discount) / 100)) : Number(price),
    discount: discount ? Number(discount) : null,
    rating: 4.5,
    reviewsCount: 0,
    category: category || "casual",
    type: type || "t-shirts",
    section: section || "new-arrivals",
    image: image || "/images/products/product-1.png",
    description: description || "",
    colors: Array.isArray(colors) ? colors : colors ? colors.split(",").map((c) => c.trim()) : ["#000000"],
    sizes: Array.isArray(sizes) ? sizes : sizes ? sizes.split(",").map((s) => s.trim()) : ["Small", "Medium", "Large"],
  };

  products.push(newProduct);
  writeData("products.json", products);

  res.status(201).json(newProduct);
});

// PUT /api/products/:id - update product
router.put("/:id", (req, res) => {
  const products = readData("products.json");
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updated = {
    ...products[index],
    ...req.body,
    id,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
  };

  products[index] = updated;
  writeData("products.json", products);

  res.json(updated);
});

// DELETE /api/products/:id - delete product
router.delete("/:id", (req, res) => {
  const products = readData("products.json");
  const id = Number(req.params.id);
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  writeData("products.json", filtered);
  res.json({ message: "Product deleted successfully" });
});

module.exports = router;

