import {
  INITIAL_PRODUCTS,
  INITIAL_DRESS_STYLES,
  INITIAL_TESTIMONIALS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS
} from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helpers for localStorage fallback when backend server is not available
function getLocalStore(key, initialData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item);
  } catch {
    return initialData;
  }
}

function setLocalStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to write to localStorage:", err);
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// --- PRODUCTS ---
export const getProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    return await request(`/products${query ? `?${query}` : ""}`);
  } catch (err) {
    console.warn("API request failed, falling back to local dataset:", err.message);
    let list = getLocalStore("shop_co_products", INITIAL_PRODUCTS);

    if (params.category) {
      list = list.filter((p) => p.category?.toLowerCase() === params.category.toLowerCase());
    }
    if (params.section) {
      list = list.filter((p) => p.section === params.section);
    }
    if (params.type) {
      list = list.filter((p) => p.type === params.type);
    }
    if (params.onSale === "true" || params.onSale === true) {
      list = list.filter((p) => p.discount && p.discount > 0);
    }
    if (params.minPrice) {
      list = list.filter((p) => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      list = list.filter((p) => p.price <= Number(params.maxPrice));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
      );
    }

    if (params.sort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 9;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = list.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit) || 1
    };
  }
};

export const getProduct = async (id) => {
  try {
    return await request(`/products/${id}`);
  } catch (err) {
    const list = getLocalStore("shop_co_products", INITIAL_PRODUCTS);
    const prod = list.find((p) => String(p.id) === String(id));
    if (!prod) throw new Error("Product not found");
    return prod;
  }
};

// --- REVIEWS ---
export const getReviews = async (productId) => {
  try {
    return await request(`/products/${productId}/reviews`);
  } catch (err) {
    const reviews = getLocalStore("shop_co_reviews", INITIAL_REVIEWS);
    return reviews.filter((r) => String(r.productId) === String(productId));
  }
};

export const addReview = async (productId, review) => {
  try {
    return await request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });
  } catch (err) {
    const reviews = getLocalStore("shop_co_reviews", INITIAL_REVIEWS);
    const newRev = {
      id: Date.now(),
      productId: Number(productId),
      verified: true,
      date: new Date().toISOString().split("T")[0],
      ...review
    };
    reviews.unshift(newRev);
    setLocalStore("shop_co_reviews", reviews);
    return newRev;
  }
};

// --- HOMEPAGE STATIC ---
export const getDressStyles = async () => {
  try {
    return await request("/dress-styles");
  } catch (err) {
    return getLocalStore("shop_co_dress_styles", INITIAL_DRESS_STYLES);
  }
};

export const getTestimonials = async () => {
  try {
    return await request("/testimonials");
  } catch (err) {
    return getLocalStore("shop_co_testimonials", INITIAL_TESTIMONIALS);
  }
};

// --- CART ---
export const getCart = async () => {
  try {
    return await request("/cart");
  } catch (err) {
    return getLocalStore("shop_co_cart", []);
  }
};

export const addToCart = async (item) => {
  try {
    return await request("/cart", { method: "POST", body: JSON.stringify(item) });
  } catch (err) {
    const cart = getLocalStore("shop_co_cart", []);
    const existingIndex = cart.findIndex(
      (c) =>
        c.productId === item.productId &&
        c.size === item.size &&
        c.color === item.color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({ id: `cart-${Date.now()}`, ...item });
    }
    setLocalStore("shop_co_cart", cart);
    return cart;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    return await request(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) });
  } catch (err) {
    let cart = getLocalStore("shop_co_cart", []);
    cart = cart.map((c) => (c.id === id ? { ...c, quantity } : c));
    setLocalStore("shop_co_cart", cart);
    return cart;
  }
};

export const removeCartItem = async (id) => {
  try {
    return await request(`/cart/${id}`, { method: "DELETE" });
  } catch (err) {
    let cart = getLocalStore("shop_co_cart", []);
    cart = cart.filter((c) => c.id !== id);
    setLocalStore("shop_co_cart", cart);
    return cart;
  }
};

// --- ORDERS ---
export const placeOrder = async (data) => {
  try {
    return await request("/orders", { method: "POST", body: JSON.stringify(data) });
  } catch (err) {
    const orders = getLocalStore("shop_co_orders", INITIAL_ORDERS);
    const newOrder = {
      id: `ord-${Date.now()}`,
      ...data,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    setLocalStore("shop_co_orders", orders);
    setLocalStore("shop_co_cart", []);
    return newOrder;
  }
};

export const getOrders = async () => {
  try {
    return await request("/orders");
  } catch (err) {
    return getLocalStore("shop_co_orders", INITIAL_ORDERS);
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    return await request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    const orders = getLocalStore("shop_co_orders", INITIAL_ORDERS);
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    order.status = status;
    setLocalStore("shop_co_orders", orders);
    return order;
  }
};

export const deleteOrder = async (id) => {
  try {
    return await request(`/orders/${id}`, { method: "DELETE" });
  } catch (err) {
    let orders = getLocalStore("shop_co_orders", INITIAL_ORDERS);
    orders = orders.filter((o) => o.id !== id);
    setLocalStore("shop_co_orders", orders);
    return { success: true };
  }
};

// --- AUTH ---
export const signup = async (data) => {
  try {
    return await request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
  } catch (err) {
    const users = getLocalStore("shop_co_users", []);
    if (users.some((u) => u.email === data.email)) {
      throw new Error("Email already registered");
    }
    const newUser = { id: `u-${Date.now()}`, ...data, role: "user" };
    users.push(newUser);
    setLocalStore("shop_co_users", users);
    return { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
  }
};

export const login = async (data) => {
  try {
    return await request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  } catch (err) {
    if (data.email === "admin@shop.co" && data.password === "admin123") {
      return { user: { id: "admin-1", name: "Admin", email: "admin@shop.co", role: "admin" } };
    }
    const users = getLocalStore("shop_co_users", []);
    const found = users.find((u) => u.email === data.email && u.password === data.password);
    if (!found) throw new Error("Invalid email or password");
    return { user: { id: found.id, name: found.name, email: found.email, role: found.role || "user" } };
  }
};

// --- PRODUCT MANAGEMENT (ADMIN) ---
export const addProduct = async (data) => {
  try {
    return await request("/products", { method: "POST", body: JSON.stringify(data) });
  } catch (err) {
    const products = getLocalStore("shop_co_products", INITIAL_PRODUCTS);
    const newProd = {
      id: Date.now(),
      ...data,
      price: Number(data.price),
      discount: data.discount ? Number(data.discount) : null,
      rating: 4.5,
      reviews: 0,
      colors: typeof data.colors === "string" ? data.colors.split(",").map((c) => c.trim()) : data.colors || [],
      sizes: typeof data.sizes === "string" ? data.sizes.split(",").map((s) => s.trim()) : data.sizes || [],
      images: [data.image || "/images/products/product-1.png"]
    };
    products.unshift(newProd);
    setLocalStore("shop_co_products", products);
    return newProd;
  }
};

export const updateProduct = async (id, data) => {
  try {
    return await request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
  } catch (err) {
    const products = getLocalStore("shop_co_products", INITIAL_PRODUCTS);
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) throw new Error("Product not found");
    const updated = {
      ...products[idx],
      ...data,
      price: Number(data.price),
      discount: data.discount !== "" && data.discount !== null ? Number(data.discount) : null,
      colors: typeof data.colors === "string" ? data.colors.split(",").map((c) => c.trim()) : data.colors || products[idx].colors,
      sizes: typeof data.sizes === "string" ? data.sizes.split(",").map((s) => s.trim()) : data.sizes || products[idx].sizes
    };
    products[idx] = updated;
    setLocalStore("shop_co_products", products);
    return updated;
  }
};

export const deleteProduct = async (id) => {
  try {
    return await request(`/products/${id}`, { method: "DELETE" });
  } catch (err) {
    let products = getLocalStore("shop_co_products", INITIAL_PRODUCTS);
    products = products.filter((p) => String(p.id) !== String(id));
    setLocalStore("shop_co_products", products);
    return { success: true };
  }
};
