import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setShake(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5050/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid email or password"
        );

        setShake(true);

        setTimeout(() => {
          setShake(false);
        }, 500);

        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (error) {
      setError(
        "Unable to connect to server. Make sure the backend is running."
      );

      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================
          BACKGROUND
      ===================================== */}

      <div className="login-grid"></div>

      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>
      <div className="login-glow login-glow-three"></div>

      <div className="login-particle login-particle-one"></div>
      <div className="login-particle login-particle-two"></div>
      <div className="login-particle login-particle-three"></div>
      <div className="login-particle login-particle-four"></div>

      {/* =====================================
          MAIN
      ===================================== */}

      <div className="login-layout">

        {/* ===================================
            LEFT BRAND PANEL
        =================================== */}

        <div className="login-brand-panel">

          <div className="brand-orbit orbit-a"></div>
          <div className="brand-orbit orbit-b"></div>

          <div className="brand-locker">

            <div className="brand-locker-door">

              <div className="brand-locker-top"></div>

              <div className="brand-locker-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="brand-locker-lock">
                🔒
              </div>

              <div className="brand-locker-handle"></div>

            </div>

          </div>

          <div className="brand-content">

            <div className="brand-mini-badge">
              <span></span>
              UNIVERSITY LIBRARY
            </div>

            <h1>
              Digital
              <span>Locker.</span>
            </h1>

            <p>
              Secure storage management
              designed for modern
              university campuses.
            </p>

            <div className="brand-features">

              <div>
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Secure Access
                </span>
              </div>

              <div>
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Real-time Availability
                </span>
              </div>

              <div>
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Smart Rental Management
                </span>
              </div>

            </div>

          </div>

          <div className="brand-footer">
            Powered by Digital Locker System
          </div>

        </div>

        {/* ===================================
            LOGIN PANEL
        =================================== */}

        <div className="login-panel">

          <div
            className={`login-box ${
              shake ? "login-shake" : ""
            }`}
          >

            {/* LOGO */}

            <div className="login-logo-wrapper">

              <div className="login-logo-ring"></div>

              <div className="login-logo">
                🔐
              </div>

            </div>

            {/* HEADER */}

            <div className="login-header">

              <div className="login-eyebrow">
                DIGITAL LOCKER
              </div>

              <h2>
                Welcome
                <span> Back.</span>
              </h2>

              <p>
                Sign in to access your
                locker dashboard.
              </p>

            </div>

            {/* FORM */}

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              <div className="input-group">

                <label>
                  EMAIL ADDRESS
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <div className="input-group">

                <label>
                  PASSWORD
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              {error && (

                <div className="login-error">

                  <div className="error-symbol">
                    !
                  </div>

                  <span>
                    {error}
                  </span>

                </div>

              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                <span className="button-shine"></span>

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="login-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* SECURITY */}

            <div className="login-security">

              <div className="security-icon">
                ✓
              </div>

              <div>

                <strong>
                  Secure Authentication
                </strong>

                <p>
                  Protected with
                  JWT-based authentication
                </p>

              </div>

            </div>

            <div className="login-bottom">

              <span>
                DIGITAL LOCKER BOOKING SYSTEM
              </span>

              <span className="bottom-dot"></span>

              <span>
                SECURE
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;