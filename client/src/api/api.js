const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ""}`);
};

export const getProduct = (id) => request(`/products/${id}`);

export const getReviews = (productId) => request(`/products/${productId}/reviews`);

export const addReview = (productId, review) =>
  request(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(review),
  });

export const getDressStyles = () => request("/dress-styles");

export const getTestimonials = () => request("/testimonials");

export const getCart = () => request("/cart");

export const addToCart = (item) =>
  request("/cart", { method: "POST", body: JSON.stringify(item) });

export const updateCartItem = (id, quantity) =>
  request(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) });

export const removeCartItem = (id) => request(`/cart/${id}`, { method: "DELETE" });

export const placeOrder = (data) =>
  request("/orders", { method: "POST", body: JSON.stringify(data) });

export const signup = (data) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify(data) });

export const login = (data) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(data) });

export const getOrders = () => request("/orders");

export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const deleteOrder = (id) =>
  request(`/orders/${id}`, { method: "DELETE" });

export const addProduct = (data) =>
  request("/products", { method: "POST", body: JSON.stringify(data) });

export const updateProduct = (id, data) =>
  request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: "DELETE" });

