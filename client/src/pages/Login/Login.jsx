import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { login as loginRequest } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "../Signup/Signup.css";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
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
      const { user } = await loginRequest({ email: form.email.trim(), password: form.password });
      login(user);
      navigate(redirectPath);
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
          <h1>Log In</h1>
          <p className="signup__subtitle">Welcome back! Log in to continue shopping.</p>

          <form onSubmit={handleSubmit} noValidate>
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

            {serverError && <p className="signup__server-error">{serverError}</p>}

            <button type="submit" className="btn btn-primary signup__submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="signup__login-link">
            Don't have an account?{" "}
            <Link to={redirectPath !== "/" ? `/signup?redirect=${redirectPath}` : "/signup"}>
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Login;
