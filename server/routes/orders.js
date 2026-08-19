const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

// POST /api/orders - place an order from the current cart
// body: { fullName, phone, address, city, paymentMethod }
router.post("/", (req, res) => {
  const { fullName, phone, address, city, paymentMethod } = req.body;

  if (!fullName || !phone || !address || !city) {
    return res.status(400).json({ message: "fullName, phone, address and city are required" });
  }

  const cart = readData("cart.json");
  if (cart.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  const products = readData("products.json");
  const items = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      name: product ? product.name : "Unknown product",
      price: product ? product.price : 0,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    };
  });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + 15;

  const order = {
    id: crypto.randomUUID(),
    fullName,
    phone,
    address,
    city,
    paymentMethod: paymentMethod || "Cash on Delivery",
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const orders = readData("orders.json");
  orders.push(order);
  writeData("orders.json", orders);

  // clear the cart after a successful order
  writeData("cart.json", []);

  res.status(201).json(order);
});

// GET /api/orders - list all orders (admin)
router.get("/", (req, res) => {
  res.json(readData("orders.json"));
});

module.exports = router;
