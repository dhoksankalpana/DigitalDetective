import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Fingerprint,
  UserPlus,
  ShieldCheck,
  FolderSearch,
  Activity,
  User,
  Mail,
  LockKeyhole,
  CheckCircle,
} from "lucide-react";

import useAuth from "../hooks/useAuth";
import "./Login.css";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    display_name: "",
    role: "Investigator",
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

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.password_confirm ||
      !formData.display_name
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await register(formData);

      navigate("/login", {
        state: {
          message: "Account created successfully. You can now sign in.",
        },
      });
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData) {
        const messages = Object.values(responseData).flat();

        if (messages.length > 0) {
          setError(messages.join(" "));
        } else {
          setError("Registration failed. Please check your information.");
        }
      } else {
        setError("Unable to connect to the investigation server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="register-visual">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Fingerprint size={22} />
          </div>

          <div className="brand-name">
            Digital<span>Detective</span>
          </div>
        </Link>

        <div className="register-visual-content">
          <div className="hero-tag">
            <span className="live-dot"></span>
            New Investigator Registration
          </div>

          <h2>
            Build your
            <br />
            <span>case file.</span>
          </h2>

          <p>
            Create your secure investigator profile and gain access to
            a centralized workspace for managing digital investigations.
          </p>

          <div className="register-features">
            <div className="register-feature">
              <ShieldCheck size={19} />

              <strong>Secure Workspace</strong>

              <span>
                Protected access to investigation records.
              </span>
            </div>

            <div className="register-feature">
              <FolderSearch size={19} />

              <strong>Case Intelligence</strong>

              <span>
                Organize cases, clues and evidence.
              </span>
            </div>

            <div className="register-feature">
              <Activity size={19} />

              <strong>Live Activity</strong>

              <span>
                Keep track of investigation activity.
              </span>
            </div>

            <div className="register-feature">
              <CheckCircle size={19} />

              <strong>Evidence Tracking</strong>

              <span>
                Maintain structured evidence records.
              </span>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          DIGITAL DETECTIVE • INVESTIGATOR REGISTRATION
        </div>
      </section>

      <section className="register-form-section">
        <div className="register-form-container">
          <Link to="/" className="brand mobile-brand">
            <div className="brand-icon">
              <Fingerprint size={22} />
            </div>

            <div className="brand-name">
              Digital<span>Detective</span>
            </div>
          </Link>

          <div className="register-heading">
            <h1>Create account</h1>

            <p>
              Register as an investigator to enter the command center.
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="display_name">Display Name</label>

              <div className="input-wrapper">
                <User size={18} />

                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  className="form-control"
                  placeholder="Your investigator name"
                  value={formData.display_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="register-row">
              <div className="form-group">
                <label htmlFor="username">Username</label>

                <div className="input-wrapper">
                  <UserPlus size={18} />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>

                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Investigator">Investigator</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Researcher">Researcher</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="investigator@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="register-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm">
                  Confirm Password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <p className="register-terms">
              Your account will be used to access investigation data
              and manage your assigned records.
            </p>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Investigator Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in to the command center</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;