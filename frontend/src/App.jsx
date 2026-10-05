import { useEffect, useState } from "react";
import "./App.css";

import Login from "./Login";
import RentalForm from "./RentalForm";
import MyRental from "./MyRental";
import AdminPanel from "./AdminPanel";

const API_URL = "https://digital-locker-system.vercel.app";

function App() {
  const [user, setUser] = useState(null);
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // CHECK LOGIN SESSION
  // ===============================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Invalid saved user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ===============================
  // FETCH LOCKERS
  // ===============================

  const fetchLockers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/lockers?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = await response.json();

      console.log("Locker API Status:", response.status);
      console.log("Lockers received:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to fetch lockers (${response.status})`
        );
      }

      if (Array.isArray(data)) {
        setLockers(data);
      } else {
        console.error("Unexpected locker response:", data);
        setLockers([]);
      }
    } catch (error) {
      console.error("Fetch lockers failed:", error);
      setLockers([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH LOCKERS AFTER STUDENT LOGIN
  // ===============================

  useEffect(() => {
    if (user && user.role === "student") {
      fetchLockers();
    }
  }, [user]);

  // ===============================
  // LOGIN
  // ===============================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLockers([]);
    setSelectedLocker(null);
  };

  // ===============================
  // REFRESH LOCKERS
  // ===============================

  const handleRefresh = () => {
    fetchLockers();
  };

  // ===============================
  // LOGIN SCREEN
  // ===============================

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.role === "admin";
  const isStudent = user.role === "student";

  const availableLockers = lockers.filter(
    (locker) => locker.status === "Available"
  );

  const occupiedLockers = lockers.filter(
    (locker) => locker.status === "Occupied"
  );

  const maintenanceLockers = lockers.filter(
    (locker) => locker.status === "Maintenance"
  );

  return (
    <div className="app">

      {/* ===============================
          HEADER
      =============================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">DL</div>

          <div>
            <h1>Digital Locker</h1>
            <span>University Storage Management</span>
          </div>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ===============================
          MAIN CONTENT
      =============================== */}

      <main className="dashboard">

        {/* ===============================
            WELCOME
        =============================== */}

        <section className="welcome-section">
          <div>
            <p className="eyebrow">
              {isAdmin ? "ADMINISTRATION" : "STUDENT PORTAL"}
            </p>

            <h2>
              Welcome back, {user.name}
            </h2>

            <p>
              {isAdmin
                ? "Manage lockers, rentals and maintenance from the administration panel."
                : "Manage your university locker and rental details."}
            </p>
          </div>
        </section>

        {/* ===============================
            STUDENT DASHBOARD
        =============================== */}

        {isStudent && (
          <>
            {/* Stats */}

            <section className="stats-grid">

              <div className="stat-card">
                <span>Total Lockers</span>
                <strong>{lockers.length}</strong>
              </div>

              <div className="stat-card">
                <span>Available</span>
                <strong>{availableLockers.length}</strong>
              </div>

              <div className="stat-card">
                <span>Occupied</span>
                <strong>{occupiedLockers.length}</strong>
              </div>

              <div className="stat-card">
                <span>Maintenance</span>
                <strong>{maintenanceLockers.length}</strong>
              </div>

            </section>

            {/* ===============================
                LOCKER AVAILABILITY
            =============================== */}

            <section
              id="inventory"
              className="dashboard-card"
            >
              <div className="section-header">

                <div>
                  <p className="eyebrow">LOCKER INVENTORY</p>
                  <h3>Locker Availability</h3>
                </div>

                <button
                  className="refresh-btn"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>

              </div>

              {loading ? (
                <div className="empty-state">
                  Loading lockers...
                </div>
              ) : lockers.length === 0 ? (
                <div className="empty-state">
                  No lockers available.
                </div>
              ) : (
                <div className="locker-grid">

                  {lockers.map((locker) => (

                    <div
                      key={locker._id}
                      className={`locker-card ${locker.status.toLowerCase()}`}
                    >

                      <div className="locker-number">
                        {locker.lockerNumber}
                      </div>

                      <div className="locker-status">
                        {locker.status}
                      </div>

                      {locker.status === "Available" && (
                        <button
                          className="rent-btn"
                          onClick={() => setSelectedLocker(locker)}
                        >
                          Rent Locker
                        </button>
                      )}

                      {locker.status === "Occupied" && (
                        <span className="disabled-text">
                          Currently Rented
                        </span>
                      )}

                      {locker.status === "Maintenance" && (
                        <span className="disabled-text">
                          Under Maintenance
                        </span>
                      )}

                    </div>

                  ))}

                </div>
              )}
            </section>

            {/* ===============================
                MY RENTAL
            =============================== */}

            <section
              id="rental"
              className="dashboard-card"
            >
              <div className="section-header">

                <div>
                  <p className="eyebrow">RENTAL HISTORY</p>
                  <h3>My Rental</h3>
                </div>

              </div>

              <MyRental />
            </section>
          </>
        )}

        {/* ===============================
            ADMIN PANEL
        =============================== */}

        {isAdmin && (
          <section
            id="admin"
            className="dashboard-card"
          >
            <AdminPanel
              lockers={lockers}
              onRefresh={handleRefresh}
            />
          </section>
        )}

      </main>

      {/* ===============================
          RENTAL MODAL
      =============================== */}

      {selectedLocker && isStudent && (
        <RentalForm
          locker={selectedLocker}
          onClose={() => setSelectedLocker(null)}
          onSuccess={() => {
            setSelectedLocker(null);
            fetchLockers();
          }}
        />
      )}

    </div>
  );
}

export default App;