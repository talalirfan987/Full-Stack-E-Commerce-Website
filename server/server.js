const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const dressStylesRouter = require("./routes/dressStyles");
const testimonialsRouter = require("./routes/testimonials");
const cartRouter = require("./routes/cart");
const reviewsRouter = require("./routes/reviews");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/dress-styles", dressStylesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products/:id/reviews", reviewsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
