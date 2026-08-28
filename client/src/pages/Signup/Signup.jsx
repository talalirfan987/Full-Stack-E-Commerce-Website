import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { signup } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Signup.css";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const { user } = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(user);
      setSuccess(true);
      setTimeout(() => navigate(redirectPath), 1200);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="signup container">
        <div className="signup__card">
          <h1>Create an Account</h1>
          <p className="signup__subtitle">Sign up and get 20% off your first order.</p>

          {success ? (
            <p className="signup__success">Account created! Redirecting...</p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="signup__field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <span className="signup__error">{errors.name}</span>}
              </div>

              <div className="signup__field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                {errors.email && <span className="signup__error">{errors.email}</span>}
              </div>

              <div className="signup__field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                {errors.password && <span className="signup__error">{errors.password}</span>}
              </div>

              <div className="signup__field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
                {errors.confirmPassword && (
                  <span className="signup__error">{errors.confirmPassword}</span>
                )}
              </div>

              {serverError && <p className="signup__server-error">{serverError}</p>}

              <button type="submit" className="btn btn-primary signup__submit" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
              </button>
            </form>
          )}

          <p className="signup__login-link">
            Already have an account?{" "}
            <Link to={redirectPath !== "/" ? `/login?redirect=${redirectPath}` : "/login"}>
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Signup;
