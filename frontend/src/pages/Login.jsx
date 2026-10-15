import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Fingerprint,
  LockKeyhole,
  User,
  ShieldCheck,
  Database,
  ScanSearch,
} from "lucide-react";

import useAuth from "../hooks/useAuth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      await login(formData.username, formData.password);

      navigate("/dashboard");
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.non_field_errors) {
        setError(responseData.non_field_errors[0]);
      } else {
        setError("Unable to sign in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Fingerprint size={22} />
          </div>

          <div className="brand-name">
            Digital<span>Detective</span>
          </div>
        </Link>

        <div className="auth-visual-content">
          <div className="hero-tag">
            <span className="live-dot"></span>
            Secure Investigation Network
          </div>

          <h2>
            Follow the
            <br />
            <span>evidence.</span>
          </h2>

          <p>
            Access your investigation command center and keep every
            case, clue, suspect and piece of evidence connected.
          </p>

          <div className="security-list">
            <div className="security-item">
              <div className="security-icon">
                <ShieldCheck size={17} />
              </div>
              Protected investigation workspace
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Database size={17} />
              </div>
              Centralized evidence records
            </div>

            <div className="security-item">
              <div className="security-icon">
                <ScanSearch size={17} />
              </div>
              Intelligent case tracking
            </div>
          </div>
        </div>

        <div className="auth-footer">
          DIGITAL DETECTIVE • SECURE CASE MANAGEMENT
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <Link to="/" className="brand mobile-brand">
            <div className="brand-icon">
              <Fingerprint size={22} />
            </div>

            <div className="brand-name">
              Digital<span>Detective</span>
            </div>
          </Link>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Sign in to access your investigation workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>

              <div className="input-wrapper">
                <User size={18} />

                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create an investigator account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;