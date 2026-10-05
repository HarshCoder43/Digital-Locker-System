import { useEffect, useState } from "react";
import "./MyRental.css";

const API_URL = "https://digital-locker-system.vercel.app";

function MyRental() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/rentals/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch rentals");
        return;
      }

      setRentals(data);
    } catch (error) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-rental-loading">
        <div className="my-rental-loader"></div>
        <p>Loading your rentals...</p>
      </div>
    );
  }

  return (
    <section className="my-rental-section">

      <div className="my-rental-heading">
        <div>
          <p className="eyebrow">YOUR BOOKINGS</p>

          <h2>My Rental</h2>

          <p className="my-rental-subtitle">
            View your current and previous locker rentals.
          </p>
        </div>

        <button
          className="my-rental-refresh"
          onClick={fetchRentals}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="my-rental-error">
          ⚠ {error}
        </div>
      )}

      {!error && rentals.length === 0 && (
        <div className="my-rental-empty">
          <div className="empty-rental-icon">🔐</div>

          <h3>No rentals yet</h3>

          <p>
            You haven't booked a locker yet.
          </p>
        </div>
      )}

      {!error && rentals.length > 0 && (
        <div className="my-rental-grid">

          {rentals.map((rental) => (
            <div
              className="rental-history-card"
              key={rental._id}
            >

              <div className="rental-card-top">

                <div className="rental-locker-icon">
                  🔐
                </div>

                <div>
                  <span className="rental-label">
                    LOCKER
                  </span>

                  <h3>
                    {rental.locker?.lockerNumber ||
                      "Unknown"}
                  </h3>
                </div>

                <span className="rental-active">
                  ACTIVE
                </span>

              </div>

              <div className="rental-dates">

                <div className="rental-date-box">
                  <span>START DATE</span>

                  <strong>
                    {formatDate(rental.startDate)}
                  </strong>
                </div>

                <div className="date-arrow">
                  →
                </div>

                <div className="rental-date-box">
                  <span>END DATE</span>

                  <strong>
                    {formatDate(rental.endDate)}
                  </strong>
                </div>

              </div>

              <div className="rental-card-footer">

                <span>
                  Rental ID
                </span>

                <code>
                  {rental._id.slice(-8)}
                </code>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default MyRental;