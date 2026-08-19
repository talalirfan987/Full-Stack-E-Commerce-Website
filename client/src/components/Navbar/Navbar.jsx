import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const SHOP_DROPDOWN = [
  { label: "Casual", to: "/category/casual" },
  { label: "Formal", to: "/category/formal" },
  { label: "Party", to: "/category/party" },
  { label: "Gym", to: "/category/gym" },
];

const NAV_LINKS = [
  { label: "Shop", to: "/shop", dropdown: SHOP_DROPDOWN },
  { label: "On Sale", to: "/shop?onSale=true" },
  { label: "New Arrivals", to: "/shop?section=new-arrivals" },
  { label: "Brands", to: "/#brands" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      {!user && (
        <div className="navbar__promo">
          Sign up and get 20% off to your first order. <Link to="/signup">Sign Up Now</Link>
        </div>
      )}

      <div className="navbar__main container">
        <button
          className={`navbar__toggle ${menuOpen ? "navbar__toggle--open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="navbar__logo">
          SHOP.CO
        </Link>

        <nav className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
          <ul>
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <li
                  key={link.label}
                  className="has-dropdown"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <button
                    type="button"
                    className="navbar__dropdown-trigger"
                    onClick={() => setShopOpen((open) => !open)}
                  >
                    {link.label} <span className="chevron">▾</span>
                  </button>

                  {shopOpen && (
                    <ul className="navbar__dropdown">
                      {link.dropdown.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            onClick={() => {
                              setShopOpen(false);
                              setMenuOpen(false);
                            }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={link.label}>
                  <Link to={link.to} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="navbar__search navbar__search--mobile">
            <span className="icon-search" />
            <input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </nav>

        <div className="navbar__search">
          <span className="icon-search" />
          <input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="navbar__icons">
          <Link to="/cart" aria-label="Cart" className="icon-btn">
            🛒
          </Link>

          {user ? (
            <div
              className="navbar__profile"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                type="button"
                className="navbar__profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Account menu"
              >
                <span className="navbar__profile-avatar">{user.name[0].toUpperCase()}</span>
                <span className="navbar__profile-name">{user.name.split(" ")[0]}</span>
              </button>

              {profileOpen && (
                <ul className="navbar__dropdown navbar__dropdown--right">
                  <li className="navbar__profile-email">{user.email}</li>
                  <li>
                    <button type="button" onClick={handleLogout}>
                      Log Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link to="/login" aria-label="Account" className="icon-btn">
              👤
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
