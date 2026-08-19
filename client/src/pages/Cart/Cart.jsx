import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CartItem from "../../components/CartItem/CartItem";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";
import { getCart, updateCartItem, removeCartItem } from "../../api/api";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getCart()
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleQuantityChange(id, quantity) {
    const prev = cart;
    setCart((c) => c.map((item) => (item.id === id ? { ...item, quantity } : item)));
    try {
      await updateCartItem(id, quantity);
    } catch (err) {
      setCart(prev);
      setError(err);
    }
  }

  async function handleRemove(id) {
    const prev = cart;
    setCart((c) => c.filter((item) => item.id !== id));
    try {
      await removeCartItem(id);
    } catch (err) {
      setCart(prev);
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

        {loading && <p>Loading cart...</p>}
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
