import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Footer from "../../components/Footer/Footer";
import { getCart, placeOrder } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Loader from "../../components/Loader/Loader";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: user ? user.name : "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCart()
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user && !form.fullName) {
      setForm((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    if (!user) {
      setServerError("Order karne ke liye pehle Login / Sign Up karna zaroori hai! Please log in or sign up to complete your order.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      await placeOrder(form);
      await fetchCart();
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
    0
  );
  const total = subtotal + 15;

  return (
    <>
      <Navbar />
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />

      <main className="checkout container">
        {success ? (
          <div className="checkout__success">
            <h1>Order placed! 🎉</h1>
            <p>Thank you, {form.fullName}. Your order has been received.</p>
            <p>Redirecting you home...</p>
          </div>
        ) : loading ? (
          <Loader label="Preparing checkout..." />
        ) : cart.length === 0 ? (
          <div className="checkout__empty">
            <h1>Your cart is empty</h1>
            <p>Add some items to your cart before checking out.</p>
          </div>
        ) : (
          <div className="checkout__layout">
            <form className="checkout__form" onSubmit={handleSubmit} noValidate>
              {!user && (
                <div className="checkout__login-warning">
                  <div className="checkout__login-warning-content">
                    <h3>Account Login Required</h3>
                    <p>
                      Order karne ke liye pehle Login / Sign Up karna zaroori hai. Details fill karne se pehle please account log in karein.
                    </p>
                    <div className="checkout__login-actions">
                      <Link to="/login?redirect=/checkout" className="btn btn-primary checkout__auth-btn">
                        Log In
                      </Link>
                      <Link to="/signup?redirect=/checkout" className="btn btn-outline checkout__auth-btn">
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <h1>Shipping Details</h1>

              <div className="checkout__field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                {errors.fullName && <span className="checkout__error">{errors.fullName}</span>}
              </div>

              <div className="checkout__field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                {errors.phone && <span className="checkout__error">{errors.phone}</span>}
              </div>

              <div className="checkout__field">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
                {errors.address && <span className="checkout__error">{errors.address}</span>}
              </div>

              <div className="checkout__field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
                {errors.city && <span className="checkout__error">{errors.city}</span>}
              </div>

              <div className="checkout__field">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={form.paymentMethod}
                  onChange={(e) => handleChange("paymentMethod", e.target.value)}
                >
                  <option>Cash on Delivery</option>
                  <option>Credit / Debit Card</option>
                </select>
              </div>

              {serverError && <p className="checkout__server-error">{serverError}</p>}

              <button type="submit" className="btn btn-primary checkout__submit" disabled={submitting}>
                {submitting ? "Placing order..." : `Place Order — $${total.toFixed(0)}`}
              </button>
            </form>

            <aside className="checkout__summary">
              <h2>Order Summary</h2>
              {cart.map((item) => (
                <div className="checkout__summary-row" key={item.id}>
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span>${item.product ? item.product.price * item.quantity : 0}</span>
                </div>
              ))}
              <hr />
              <div className="checkout__summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(0)}</span>
              </div>
              <div className="checkout__summary-row">
                <span>Delivery Fee</span>
                <span>$15</span>
              </div>
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span>${total.toFixed(0)}</span>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
