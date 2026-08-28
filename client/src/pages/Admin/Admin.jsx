import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  login as loginRequest,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import "./Admin.css";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
  processing: { bg: "#eff6ff", text: "#1d4ed8", border: "#dbeafe" },
  shipped: { bg: "#f0fdf4", text: "#15803d", border: "#dcfce7" },
  delivered: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  cancelled: { bg: "#fef2f2", text: "#b91c1c", border: "#fee2e2" },
};

function Admin() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("orders"); // "overview" | "orders" | "products"
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin login form state
  const [loginEmail, setLoginEmail] = useState("admin@shop.co");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    discount: "",
    category: "casual",
    type: "t-shirts",
    section: "new-arrivals",
    image: "/images/products/product-1.png",
    description: "",
    sizes: "Small, Medium, Large",
    colors: "#000000, #003366",
  });

  // Action feedback message
  const [toast, setToast] = useState(null);

  const isAdmin = user && (user.role === "admin" || user.email === "admin@shop.co");

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function handleAdminAuth(e, emailVal = loginEmail, passVal = loginPassword) {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const res = await loginRequest({ email: emailVal, password: passVal });
      login(res.user);
      showToast(`Welcome back Admin ${res.user.name}!`);
    } catch (err) {
      setLoginError(err.message || "Invalid Admin Credentials");
    } finally {
      setLoggingIn(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, productsRes] = await Promise.all([
        getOrders().catch(() => []),
        getProducts().catch(() => ({ products: [] })),
      ]);
      setOrders(ordersData || []);
      setProducts(productsRes.products || []);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // --- ORDER ACTIONS ---
  async function handleStatusChange(orderId, newStatus) {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast("Order deleted successfully");
    } catch (err) {
      showToast(err.message || "Failed to delete order", "error");
    }
  }

  // --- PRODUCT ACTIONS ---
  function openAddProductModal() {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      discount: "",
      category: "casual",
      type: "t-shirts",
      section: "new-arrivals",
      image: "/images/products/product-1.png",
      description: "",
      sizes: "Small, Medium, Large",
      colors: "#000000, #003366",
    });
    setIsProductModalOpen(true);
  }

  function openEditProductModal(prod) {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      price: prod.price || "",
      discount: prod.discount !== null && prod.discount !== undefined ? prod.discount : "",
      category: prod.category || "casual",
      type: prod.type || "t-shirts",
      section: prod.section || "new-arrivals",
      image: prod.image || "",
      description: prod.description || "",
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(", ") : prod.sizes || "",
      colors: Array.isArray(prod.colors) ? prod.colors.join(", ") : prod.colors || "",
    });
    setIsProductModalOpen(true);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showToast("Name and price are required", "error");
      return;
    }

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, productForm);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        showToast("Product updated successfully");
      } else {
        const created = await addProduct(productForm);
        setProducts((prev) => [created, ...prev]);
        showToast("Product added successfully");
      }
      setIsProductModalOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to save product", "error");
    }
  }

  async function handleDeleteProduct(prodId) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(prodId);
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      showToast("Product deleted successfully");
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    }
  }

  // --- STATS CALCULATIONS ---
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalProducts = products.length;

  // --- FILTERED ORDERS ---
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "all" || o.status?.toLowerCase() === orderStatusFilter.toLowerCase();
    const query = orderSearch.toLowerCase();
    const matchesSearch =
      !query ||
      o.fullName?.toLowerCase().includes(query) ||
      o.phone?.toLowerCase().includes(query) ||
      o.city?.toLowerCase().includes(query) ||
      o.address?.toLowerCase().includes(query) ||
      o.id?.toLowerCase().includes(query) ||
      o.items?.some((i) => i.name?.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  // --- FILTERED PRODUCTS ---
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Navbar />

      <div className="admin-page container">
        {/* Toast Notification */}
        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>
            {toast.type === "error" ? "⚠️ " : "✅ "}
            {toast.msg}
          </div>
        )}

        {/* Top Header Banner */}
        <header className="admin-header">
          <div className="admin-header__title">
            <h1>👑 Admin Portal</h1>
            <p>Manage store orders, customer delivery info, product catalog and live sales</p>
          </div>
          <div className="admin-header__actions">
            {isAdmin && (
              <button className="admin-btn admin-btn--secondary" onClick={fetchData} title="Refresh data">
                🔄 Refresh Data
              </button>
            )}
            <Link to="/" className="admin-btn admin-btn--outline">
              🏪 Back to Shop
            </Link>
          </div>
        </header>

        {!isAdmin ? (
          <div className="admin-login-card">
            <h2>👑 Admin Portal Login</h2>
            <p className="admin-login-subtitle">
              Aap is Admin Portal login details se log in kar sakte hain:
            </p>

            <div className="admin-credentials-box">
              <div className="credential-row">
                <span>📧 Admin Email:</span>
                <code>admin@shop.co</code>
              </div>
              <div className="credential-row">
                <span>🔑 Admin Password:</span>
                <code>admin123</code>
              </div>
            </div>

            <form onSubmit={(e) => handleAdminAuth(e)} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="adminEmail">Email Address</label>
                <input
                  id="adminEmail"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Password</label>
                <input
                  id="adminPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && <p className="admin-login-error">⚠️ {loginError}</p>}

              <button type="submit" className="admin-btn admin-btn--primary admin-login-submit" disabled={loggingIn}>
                {loggingIn ? "Logging in..." : "🔑 Log In as Admin"}
              </button>

              <button
                type="button"
                className="admin-btn admin-btn--secondary admin-quick-login"
                onClick={() => handleAdminAuth(null, "admin@shop.co", "admin123")}
                disabled={loggingIn}
              >
                ⚡ 1-Click Quick Admin Login
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card stat-card--revenue">
            <div className="stat-card__icon">💰</div>
            <div className="stat-card__content">
              <span className="stat-card__label">Total Revenue</span>
              <h3 className="stat-card__value">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="stat-card stat-card--orders">
            <div className="stat-card__icon">📦</div>
            <div className="stat-card__content">
              <span className="stat-card__label">Total Orders</span>
              <h3 className="stat-card__value">{totalOrders}</h3>
            </div>
          </div>

          <div className="stat-card stat-card--pending">
            <div className="stat-card__icon">⏳</div>
            <div className="stat-card__content">
              <span className="stat-card__label">Pending Orders</span>
              <h3 className="stat-card__value">{pendingOrders}</h3>
            </div>
          </div>

          <div className="stat-card stat-card--products">
            <div className="stat-card__icon">🏷️</div>
            <div className="stat-card__content">
              <span className="stat-card__label">Total Products</span>
              <h3 className="stat-card__value">{totalProducts}</h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "orders" ? "admin-tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Customer Orders ({orders.length})
            {pendingOrders > 0 && <span className="admin-tab__badge">{pendingOrders} pending</span>}
          </button>
          <button
            className={`admin-tab ${activeTab === "products" ? "admin-tab--active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            👕 Products Catalog ({products.length})
          </button>
          <button
            className={`admin-tab ${activeTab === "overview" ? "admin-tab--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Quick Analytics Overview
          </button>
        </div>

        {loading ? (
          <Loader label="Loading Admin Dashboard..." />
        ) : error ? (
          <div className="admin-error">
            <p>⚠️ {error}</p>
            <button className="admin-btn admin-btn--primary" onClick={fetchData}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: ORDERS DASHBOARD */}
            {activeTab === "orders" && (
              <div className="admin-tab-content">
                <div className="admin-toolbar">
                  <div className="admin-search-box">
                    <span className="admin-search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by customer name, phone, city, address or order ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                    {orderSearch && (
                      <button className="admin-clear-btn" onClick={() => setOrderSearch("")}>
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="admin-filter-group">
                    <label>Status Filter:</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses ({orders.length})</option>
                      {STATUS_OPTIONS.map((st) => {
                        const count = orders.filter((o) => o.status === st).length;
                        return (
                          <option key={st} value={st}>
                            {st.charAt(0).toUpperCase() + st.slice(1)} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>📦 No orders found matching your search/filter criteria.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map((order) => {
                      const colorStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                      const formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      });

                      return (
                        <div className="order-card" key={order.id}>
                          {/* Order Header */}
                          <div className="order-card__header">
                            <div className="order-card__meta">
                              <span className="order-card__id">
                                Order ID: <code>#{order.id.slice(0, 8)}</code>
                              </span>
                              <span className="order-card__date">📅 {formattedDate}</span>
                            </div>

                            <div className="order-card__header-right">
                              <div
                                className="order-status-badge"
                                style={{
                                  backgroundColor: colorStyle.bg,
                                  color: colorStyle.text,
                                  borderColor: colorStyle.border,
                                }}
                              >
                                Status:
                                <select
                                  value={order.status || "pending"}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="order-status-select"
                                  style={{ color: colorStyle.text }}
                                >
                                  {STATUS_OPTIONS.map((st) => (
                                    <option key={st} value={st}>
                                      {st.charAt(0).toUpperCase() + st.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                className="admin-btn-icon admin-btn-icon--danger"
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Delete Order"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Customer & Shipping Details Grid */}
                          <div className="order-card__body">
                            <div className="customer-info-box">
                              <h4>👤 Customer & Shipping Information</h4>
                              <div className="customer-details">
                                <div className="detail-item">
                                  <span className="detail-label">Full Name:</span>
                                  <strong className="detail-value">{order.fullName}</strong>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Phone Number:</span>
                                  <span className="detail-value phone-value">
                                    <a href={`tel:${order.phone}`}>📞 {order.phone}</a>
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Delivery Address:</span>
                                  <span className="detail-value">
                                    📍 {order.address}, {order.city}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Payment Method:</span>
                                  <span className="detail-value payment-badge">
                                    💳 {order.paymentMethod || "Cash on Delivery"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Ordered Items Table */}
                            <div className="items-info-box">
                              <h4>🛒 Items Ordered ({order.items?.length || 0})</h4>
                              <div className="items-table-wrapper">
                                <table className="items-table">
                                  <thead>
                                    <tr>
                                      <th>Product</th>
                                      <th>Size</th>
                                      <th>Color</th>
                                      <th>Price</th>
                                      <th>Qty</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items?.map((item, idx) => (
                                      <tr key={idx}>
                                        <td className="item-name-td">
                                          <strong>{item.name}</strong>
                                        </td>
                                        <td>
                                          <span className="item-chip">{item.size || "N/A"}</span>
                                        </td>
                                        <td>
                                          <span className="color-preview-wrapper">
                                            <span
                                              className="color-dot"
                                              style={{
                                                backgroundColor: item.color || "#000",
                                              }}
                                            />
                                            {item.color}
                                          </span>
                                        </td>
                                        <td>${item.price}</td>
                                        <td>× {item.quantity}</td>
                                        <td className="item-subtotal">
                                          ${(item.price * item.quantity).toFixed(0)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* Order Footer Total */}
                          <div className="order-card__footer">
                            <div className="order-card__total">
                              <span>Total Order Amount:</span>
                              <strong>${order.total?.toFixed(0)}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCTS MANAGEMENT */}
            {activeTab === "products" && (
              <div className="admin-tab-content">
                <div className="admin-toolbar">
                  <div className="admin-search-box">
                    <span className="admin-search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search products by title or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <button className="admin-btn admin-btn--primary" onClick={openAddProductModal}>
                    ➕ Add New Product
                  </button>
                </div>

                <div className="products-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id}>
                          <td>#{prod.id}</td>
                          <td>
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="admin-product-thumb"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/60?text=Product";
                              }}
                            />
                          </td>
                          <td>
                            <strong>{prod.name}</strong>
                          </td>
                          <td>
                            <span className="item-chip">{prod.category}</span>
                          </td>
                          <td>{prod.type}</td>
                          <td>
                            <strong>${prod.price}</strong>
                          </td>
                          <td>
                            {prod.discount ? (
                              <span className="discount-badge">-{prod.discount}%</span>
                            ) : (
                              <span className="no-discount">—</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-action-btns">
                              <button
                                className="admin-btn-icon"
                                onClick={() => openEditProductModal(prod)}
                                title="Edit Product"
                              >
                                ✏️
                              </button>
                              <button
                                className="admin-btn-icon admin-btn-icon--danger"
                                onClick={() => handleDeleteProduct(prod.id)}
                                title="Delete Product"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: OVERVIEW & RECENT ACTIVITY */}
            {activeTab === "overview" && (
              <div className="admin-tab-content">
                <div className="overview-section">
                  <h3>⚡ Recent Activity & Store Performance</h3>
                  <p>Here is a quick snapshot of the latest order activity.</p>

                  <div className="recent-orders-wrapper">
                    <h4>Recent Orders List</h4>
                    {orders.length === 0 ? (
                      <p>No orders recorded yet.</p>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id}>
                              <td>#{o.id.slice(0, 8)}</td>
                              <td>
                                <strong>{o.fullName}</strong>
                              </td>
                              <td>{o.phone}</td>
                              <td>
                                {o.address}, {o.city}
                              </td>
                              <td>${o.total}</td>
                              <td>
                                <span className={`status-pill status-pill--${o.status}`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Product Modal (Add / Edit) */}
        {isProductModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal__header">
                <h3>{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
                <button className="admin-close-btn" onClick={() => setIsProductModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-modal__form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="party">Party</option>
                      <option value="gym">Gym</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Type</label>
                    <input
                      type="text"
                      placeholder="e.g. t-shirts, shirts, jeans, hoodies"
                      value={productForm.type}
                      onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    placeholder="/images/products/product-1.png"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sizes (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Small, Medium, Large, X-Large"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Colors (comma separated hex/names)</label>
                    <input
                      type="text"
                      placeholder="#000000, #ffffff, Red"
                      value={productForm.colors}
                      onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn--primary">
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Admin;
