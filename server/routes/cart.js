const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

function withProductDetails(cart) {
  const products = readData("products.json");
  return cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product: product
        ? {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          }
        : null,
    };
  });
}

// GET /api/cart - all cart items, enriched with product details
router.get("/", (req, res) => {
  const cart = readData("cart.json");
  res.json(withProductDetails(cart));
});

// POST /api/cart - add item { productId, size, color, quantity }
router.post("/", (req, res) => {
  const { productId, size, color, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "productId and quantity are required" });
  }

  const products = readData("products.json");
  const product = products.find((p) => p.id === Number(productId));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = readData("cart.json");
  const existing = cart.find(
    (item) => item.productId === Number(productId) && item.size === size && item.color === color
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.push({
      id: crypto.randomUUID(),
      productId: Number(productId),
      size: size || null,
      color: color || null,
      quantity: Number(quantity),
    });
  }

  writeData("cart.json", cart);
  res.status(201).json(withProductDetails(cart));
});

// PUT /api/cart/:id - update quantity
router.put("/:id", (req, res) => {
  const { quantity } = req.body;
  const cart = readData("cart.json");
  const item = cart.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  item.quantity = Number(quantity);
  writeData("cart.json", cart);
  res.json(withProductDetails(cart));
});

// DELETE /api/cart/:id - remove item
router.delete("/:id", (req, res) => {
  let cart = readData("cart.json");
  cart = cart.filter((i) => i.id !== req.params.id);
  writeData("cart.json", cart);
  res.json(withProductDetails(cart));
});

module.exports = router;
