import { useEffect, useState } from "react";
import "./App.css";

import Login from "./Login";
import RentalForm from "./RentalForm";
import MyRental from "./MyRental";
import AdminPanel from "./AdminPanel";

const API_URL = "https://digital-locker-system-dtwve17qd-rampulse.vercel.app";

/* =========================================
   ANIMATED NUMBER
========================================= */

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 700;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

/* =========================================
   APP
========================================= */

function App() {
  const [user, setUser] = useState(null);
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedLocker, setSelectedLocker] = useState(null);

  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* =========================================
     RESTORE LOGIN SESSION
  ========================================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  /* =========================================
     FETCH LOCKERS
     STUDENT ONLY
  ========================================= */

  const fetchLockers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/lockers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLockers(data);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(
        "Failed to fetch lockers:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FETCH LOCKERS AFTER LOGIN
  ========================================= */

  useEffect(() => {
    if (user && user.role === "student") {
      fetchLockers();
    }
  }, [user]);

  /* =========================================
     LOGIN
  ========================================= */

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveSection("dashboard");
    setSelectedLocker(null);
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLockers([]);
    setSelectedLocker(null);
    setActiveSection("dashboard");
  };

  /* =========================================
     RENTAL SUCCESS
     STUDENT ONLY
  ========================================= */

  const handleRentalSuccess = () => {
    if (!user || user.role !== "student") {
      return;
    }

    setSelectedLocker(null);

    fetchLockers();

    setActiveSection("rental");
  };

  /* =========================================
     NAVIGATION
  ========================================= */

  const scrollToSection = (section) => {
    setActiveSection(section);

    setTimeout(() => {
      const element =
        document.getElementById(section);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =========================================
     LOGIN PAGE
  ========================================= */

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  /* =========================================
     ROLE
  ========================================= */

  const isAdmin = user.role === "admin";
  const isStudent = user.role === "student";

  /* =========================================
     LOCKER COUNTS
  ========================================= */

  const availableCount = lockers.filter(
    (locker) =>
      locker.status === "Available"
  ).length;

  const occupiedCount = lockers.filter(
    (locker) =>
      locker.status === "Occupied"
  ).length;

  const maintenanceCount = lockers.filter(
    (locker) =>
      locker.status === "Maintenance"
  ).length;

  return (
    <div className="app">

      {/* =====================================
          BACKGROUND EFFECTS
      ===================================== */}

      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="ambient ambient-three"></div>

      <div className="floating-particle particle-one"></div>
      <div className="floating-particle particle-two"></div>
      <div className="floating-particle particle-three"></div>
      <div className="floating-particle particle-four"></div>

      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="navbar">

        {/* BRAND */}

        <div
          className="brand"
          onClick={() =>
            scrollToSection("dashboard")
          }
        >
          <div className="brand-icon">
            🔐
          </div>

          <div>
            <h2>
              Digital Locker
            </h2>

            <span>
              Booking System
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="desktop-nav">

          {/* DASHBOARD - BOTH */}

          <button
            className={
              activeSection === "dashboard"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              scrollToSection("dashboard")
            }
          >
            Dashboard
          </button>

          {/* =================================
              MY RENTAL - STUDENT ONLY
          ================================= */}

          {isStudent && (
            <button
              className={
                activeSection === "rental"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                scrollToSection("rental")
              }
            >
              My Rental
            </button>
          )}

          {/* =================================
              ADMINISTRATION - ADMIN ONLY
          ================================= */}

          {isAdmin && (
            <button
              className={
                activeSection === "admin"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                scrollToSection("admin")
              }
            >
              Administration
            </button>
          )}

        </div>

        {/* RIGHT SIDE */}

        <div className="nav-right">

          <div className="nav-user">

            <span className="user-name">
              {user.name}
            </span>

            <span className="user-role">
              {user.role}
            </span>

          </div>

          <div className="nav-status">

            <span className="status-dot"></span>

            System Online

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="container">

        {/* ===================================
            HERO
        =================================== */}

        <section
          id="dashboard"
          className="hero reveal"
        >

          <div className="hero-content">

            <div className="hero-badge">

              <span className="hero-badge-dot"></span>

              UNIVERSITY LIBRARY

            </div>

            {/* ROLE BASED TITLE */}

            <h1>

              {isAdmin ? (
                <>
                  Manage Your
                  <span>
                    Locker System.
                  </span>
                </>
              ) : (
                <>
                  Find Your
                  <span>
                    Perfect Locker.
                  </span>
                </>
              )}

            </h1>

            {/* ROLE BASED DESCRIPTION */}

            <p className="hero-text">

              {isAdmin ? (
                <>
                  Welcome back, {user.name}.
                  Manage your university
                  locker system and control
                  library storage operations.
                </>
              ) : (
                <>
                  Welcome back, {user.name}.
                  Find an available locker
                  and manage your storage
                  rental securely.
                </>
              )}

            </p>

            <div className="hero-actions">

              {/* =================================
                  STUDENT HERO ACTIONS
              ================================= */}

              {isStudent && (
                <>
                  <button
                    className="hero-primary"
                    onClick={() =>
                      document
                        .getElementById(
                          "inventory"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                  >
                    Explore Lockers

                    <span>
                      →
                    </span>
                  </button>

                  <button
                    className="hero-secondary"
                    onClick={() =>
                      scrollToSection("rental")
                    }
                  >
                    View My Rental
                  </button>
                </>
              )}

              {/* =================================
                  ADMIN HERO ACTIONS
              ================================= */}

              {isAdmin && (
                <>
                  <button
                    className="hero-primary"
                    onClick={() =>
                      scrollToSection("admin")
                    }
                  >
                    Manage Lockers

                    <span>
                      →
                    </span>
                  </button>

                  <button
                    className="hero-secondary"
                    onClick={() =>
                      scrollToSection("admin")
                    }
                  >
                    Open Administration
                  </button>
                </>
              )}

            </div>

          </div>

          {/* HERO ORBIT */}

          <div className="hero-orbit">

            <div className="orbit orbit-one"></div>

            <div className="orbit orbit-two"></div>

            <div className="orbit-core">
              {isAdmin ? "⚙️" : "🔐"}
            </div>

          </div>

        </section>

        {/* ===================================
            STUDENT ONLY
            LOCKER STATISTICS
        =================================== */}

        {isStudent && (
          <section className="stats reveal">

            {/* TOTAL */}

            <div className="stat-card">

              <div className="stat-icon total">
                🔒
              </div>

              <div>

                <span>
                  Total Lockers
                </span>

                <strong>
                  <AnimatedNumber
                    value={lockers.length}
                  />
                </strong>

              </div>

              <div className="stat-line"></div>

            </div>

            {/* AVAILABLE */}

            <div className="stat-card">

              <div className="stat-icon available">
                ✓
              </div>

              <div>

                <span>
                  Available
                </span>

                <strong>
                  <AnimatedNumber
                    value={availableCount}
                  />
                </strong>

              </div>

              <div className="stat-line green"></div>

            </div>

            {/* OCCUPIED */}

            <div className="stat-card">

              <div className="stat-icon occupied">
                ●
              </div>

              <div>

                <span>
                  Occupied
                </span>

                <strong>
                  <AnimatedNumber
                    value={occupiedCount}
                  />
                </strong>

              </div>

              <div className="stat-line red"></div>

            </div>

            {/* MAINTENANCE */}

            <div className="stat-card">

              <div className="stat-icon maintenance">
                ⚙
              </div>

              <div>

                <span>
                  Maintenance
                </span>

                <strong>
                  <AnimatedNumber
                    value={maintenanceCount}
                  />
                </strong>

              </div>

              <div className="stat-line"></div>

            </div>

          </section>
        )}

        {/* ===================================
            STUDENT ONLY
            LOCKER INVENTORY
        =================================== */}

        {isStudent && (
          <section
            id="inventory"
            className="locker-section reveal"
          >

            <div className="section-heading">

              <div>

                <p className="eyebrow">
                  LOCKER INVENTORY
                </p>

                <h2>
                  Locker Availability
                </h2>

                <p className="section-description">
                  Select an available locker
                  to start your rental.
                </p>

              </div>

              <button
                className="refresh-btn"
                onClick={fetchLockers}
              >
                ↻ Refresh
              </button>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="empty-state">

                <div className="loader"></div>

                <p>
                  Loading locker inventory...
                </p>

              </div>

            ) : lockers.length === 0 ? (

              /* EMPTY */

              <div className="empty-state">

                <div className="empty-icon">
                  🔐
                </div>

                <h3>
                  No lockers found
                </h3>

                <p>
                  Locker inventory is
                  currently empty.
                </p>

              </div>

            ) : (

              /* LOCKER GRID */

              <div className="locker-grid">

                {lockers.map(
                  (locker, index) => (

                    <div
                      className={`locker-card ${
                        locker.status.toLowerCase()
                      } reveal-card`}
                      style={{
                        "--delay":
                          `${index * 80}ms`,
                      }}
                      key={locker._id}
                    >

                      <div className="locker-glow"></div>

                      {/* TOP */}

                      <div className="locker-top">

                        <div>

                          <span className="locker-label">
                            LOCKER
                          </span>

                          <div className="locker-number">
                            {locker.lockerNumber}
                          </div>

                        </div>

                        <span
                          className={`locker-status ${locker.status.toLowerCase()}`}
                        >

                          <span></span>

                          {locker.status}

                        </span>

                      </div>

                      {/* BODY */}

                      <div className="locker-body">

                        <div className="locker-visual">

                          <div className="locker-shadow"></div>

                          <div className="locker-door">

                            <div className="locker-top-line"></div>

                            <div className="locker-vents">

                              <span></span>
                              <span></span>
                              <span></span>

                            </div>

                            <div className="locker-handle"></div>

                            <div className="locker-lock">
                              ●
                            </div>

                          </div>

                        </div>

                        <div className="locker-info">

                          <h3>
                            Storage Locker
                          </h3>

                          <p>

                            {locker.status ===
                            "Available"
                              ? "Ready for booking"
                              : locker.status ===
                                "Occupied"
                              ? "Currently rented"
                              : "Under maintenance"}

                          </p>

                        </div>

                      </div>

                      {/* STUDENT RENT BUTTON */}

                      <button
                        className="book-btn"
                        disabled={
                          locker.status !==
                          "Available"
                        }
                        onClick={() =>
                          setSelectedLocker(
                            locker
                          )
                        }
                      >

                        {locker.status ===
                        "Available" ? (
                          <>
                            Rent Locker

                            <span>
                              →
                            </span>
                          </>
                        ) : locker.status ===
                          "Occupied" ? (
                          "Currently Occupied"
                        ) : (
                          "Under Maintenance"
                        )}

                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        )}

        {/* ===================================
            STUDENT ONLY
            MY RENTAL
        =================================== */}

        {isStudent && (
          <section
            id="rental"
            className="software-section reveal"
          >

            <div className="section-divider"></div>

            <MyRental />

          </section>
        )}

        {/* ===================================
            ADMIN ONLY
            ADMIN PANEL
        =================================== */}

        {isAdmin && (
          <section
            id="admin"
            className="software-section reveal"
          >

            <div className="section-divider"></div>

            <AdminPanel
              lockers={lockers}
              onRefresh={fetchLockers}
            />

          </section>
        )}

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer>

        <div className="footer-brand">

          <div className="footer-dot"></div>

          <strong>
            Digital Locker
          </strong>

        </div>

        <span>
          Secure University Storage
        </span>

        <span>
          Node.js • Express.js • MongoDB • React
        </span>

      </footer>

      {/* =====================================
          RENTAL MODAL
          STUDENT ONLY
      ===================================== */}

      {selectedLocker && isStudent && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedLocker(null)
          }
        >

          <div
            className="modal-wrapper"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-top-line"></div>

            <button
              className="modal-close"
              onClick={() =>
                setSelectedLocker(null)
              }
            >
              ×
            </button>

            <RentalForm
              locker={selectedLocker}
              onClose={() =>
                setSelectedLocker(null)
              }
              onSuccess={
                handleRentalSuccess
              }
            />

          </div>

        </div>

      )}

    </div>
  );
}

export default App;