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

// GET /api/orders - list all orders (admin), sorted newest first
router.get("/", (req, res) => {
  const orders = readData("orders.json");
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// PUT /api/orders/:id/status - update order status
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const orders = readData("orders.json");
  const index = orders.findIndex((o) => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  orders[index].status = status;
  writeData("orders.json", orders);

  res.json(orders[index]);
});

// DELETE /api/orders/:id - delete an order
router.delete("/:id", (req, res) => {
  const orders = readData("orders.json");
  const filtered = orders.filter((o) => o.id !== req.params.id);

  if (filtered.length === orders.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  writeData("orders.json", filtered);
  res.json({ message: "Order deleted successfully" });
});

module.exports = router;

