import { useState } from "react";
import "./RentalForm.css";

const API_URL = "https://digital-locker-system-dtwve17qd-rampulse.vercel.app";

function RentalForm({ locker, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRental = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lockerId: locker._id,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Rental failed");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rental-overlay">
      <div className="rental-modal">

        <button
          className="rental-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="rental-icon">
          🔐
        </div>

        <p className="rental-eyebrow">
          LOCKER BOOKING
        </p>

        <h2>
          Rent Locker
          <span> {locker.lockerNumber}</span>
        </h2>

        <p className="rental-description">
          Select the rental period for your locker.
        </p>

        <form onSubmit={handleRental}>

          <div className="rental-field">
            <label>Start Date</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              required
            />
          </div>

          <div className="rental-field">
            <label>End Date</label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="rental-error">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="confirm-rental"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Confirm Rental →"}
          </button>

        </form>

        <p className="rental-note">
          Your locker will be marked as occupied
          after successful booking.
        </p>

      </div>
    </div>
  );
}

export default RentalForm;