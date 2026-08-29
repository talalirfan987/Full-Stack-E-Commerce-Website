import { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem
} from "../api/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    try {
      const items = await getCart();
      setCart(items || []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function addItemToCart(item) {
    try {
      const updatedCart = await apiAddToCart(item);
      setCart(updatedCart || []);
      return updatedCart;
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      throw err;
    }
  }

  async function updateItemQuantity(id, quantity) {
    try {
      const updatedCart = await apiUpdateCartItem(id, quantity);
      setCart(updatedCart || []);
      return updatedCart;
    } catch (err) {
      console.error("Failed to update cart item:", err);
      throw err;
    }
  }

  async function removeItemFromCart(id) {
    try {
      const updatedCart = await apiRemoveCartItem(id);
      setCart(updatedCart || []);
      return updatedCart;
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      throw err;
    }
  }

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
