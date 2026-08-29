import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CartItem from "../../components/CartItem/CartItem";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../context/CartContext";
import Loader from "../../components/Loader/Loader";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateItemQuantity, removeItemFromCart } = useCart();
  const [error, setError] = useState(null);

  async function handleQuantityChange(id, quantity) {
    try {
      await updateItemQuantity(id, quantity);
    } catch (err) {
      setError(err);
    }
  }

  async function handleRemove(id) {
    try {
      await removeItemFromCart(id);
    } catch (err) {
      setError(err);
    }
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
    0
  );

  return (
    <>
      <Navbar />
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />

      <main className="cart-page container">
        <h1 className="cart-page__title">Your Cart</h1>

        {loading && <Loader label="Loading your cart..." />}
        {error && <p>Couldn't load your cart. Please try again.</p>}

        {!loading && !error && cart.length === 0 && (
          <p className="cart-page__empty">Your cart is empty.</p>
        )}

        {!loading && !error && cart.length > 0 && (
          <div className="cart-page__layout">
            <div className="cart-page__items">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <OrderSummary subtotal={subtotal} onCheckout={() => navigate("/checkout")} />
          </div>
        )}
      </main>

      <Newsletter />
      <Footer />
    </>
  );
}

export default Cart;
