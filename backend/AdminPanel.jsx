import { useEffect, useState } from "react";
import "./AdminPanel.css";

const API_URL = "https://digital-locker-system.vercel.app";

/* =========================================
   COUNTDOWN FORMATTER
========================================= */

function formatRemaining(ms) {
  if (ms <= 0) {
    return "Expired";
  }

  const totalSeconds =
    Math.floor(ms / 1000);

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/* =========================================
   DATE FORMATTER
========================================= */

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================
   ADMIN PANEL
========================================= */

function AdminPanel({
  lockers,
  onRefresh,
}) {
  const [updatingId, setUpdatingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [lockerNumber, setLockerNumber] =
    useState("");

  const [addingLocker, setAddingLocker] =
    useState(false);

  const [rentals, setRentals] =
    useState([]);

  const [rentalsLoading, setRentalsLoading] =
    useState(false);

  const [now, setNow] =
    useState(Date.now());

  /* =========================================
     LIVE CLOCK
  ========================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =========================================
     FETCH ADMIN RENTALS
  ========================================= */

  const fetchAdminRentals =
    async () => {
      try {
        setRentalsLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/rentals/admin/all`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to load rental information"
          );

          return;
        }

        setRentals(data);
      } catch (error) {
        setMessage(
          "Unable to load rental information."
        );
      } finally {
        setRentalsLoading(false);
      }
    };

  /* =========================================
     LOAD RENTALS
  ========================================= */

  useEffect(() => {
    fetchAdminRentals();
  }, []);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus =
    async (
      lockerId,
      status
    ) => {
      try {
        setUpdatingId(lockerId);
        setMessage("");

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/lockers/${lockerId}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to update locker"
          );

          return;
        }

        setMessage(
          `${data.locker.lockerNumber} status updated to ${status}`
        );

        onRefresh();

        fetchAdminRentals();
      } catch (error) {
        setMessage(
          "Unable to connect to server."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================================
     ADD LOCKER
  ========================================= */

  const addLocker =
    async (e) => {
      e.preventDefault();

      if (!lockerNumber.trim()) {
        setMessage(
          "Enter a locker number."
        );

        return;
      }

      try {
        setAddingLocker(true);
        setMessage("");

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/lockers`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                lockerNumber:
                  lockerNumber
                    .trim()
                    .toUpperCase(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to create locker"
          );

          return;
        }

        setLockerNumber("");

        setMessage(
          `${data.locker.lockerNumber} created successfully.`
        );

        onRefresh();
      } catch (error) {
        setMessage(
          "Unable to connect to server."
        );
      } finally {
        setAddingLocker(false);
      }
    };

  /* =========================================
     DELETE LOCKER
  ========================================= */

  const deleteLocker =
    async (locker) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${locker.lockerNumber}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(locker._id);
        setMessage("");

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/lockers/${locker._id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to delete locker"
          );

          return;
        }

        setMessage(
          `${locker.lockerNumber} deleted successfully.`
        );

        onRefresh();
      } catch (error) {
        setMessage(
          "Unable to connect to server."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================================
     ACTIVE RENTALS
  ========================================= */

  const activeRentals =
    rentals.filter(
      (rental) =>
        new Date(
          rental.endDate
        ).getTime() > now
    );

  /* =========================================
     NEXT RELEASE
  ========================================= */

  const nextRelease =
    activeRentals.length > 0
      ? [...activeRentals].sort(
          (a, b) =>
            new Date(a.endDate) -
            new Date(b.endDate)
        )[0]
      : null;

  return (
    <section className="admin-section">

      {/* =====================================
          ADMIN HEADER
      ===================================== */}

      <div className="admin-heading">

        <div>

          <p className="eyebrow">
            ADMIN CONTROL
          </p>

          <h2>
            Locker Management
          </h2>

          <p className="admin-subtitle">
            Manage locker availability,
            maintenance and rental
            schedules.
          </p>

        </div>

        <div className="admin-badge">
          👑 ADMIN
        </div>

      </div>

      {/* =====================================
          RENTAL OVERVIEW
      ===================================== */}

      <div className="rental-overview">

        {/* ACTIVE */}

        <div className="rental-overview-card">

          <div className="overview-icon active">
            ●
          </div>

          <div>

            <span>
              ACTIVE RENTALS
            </span>

            <strong>
              {activeRentals.length}
            </strong>

          </div>

        </div>

        {/* NEXT RELEASE */}

        <div className="rental-overview-card next">

          <div className="overview-icon">
            ⏳
          </div>

          <div>

            <span>
              NEXT LOCKER FREE
            </span>

            <strong>

              {nextRelease
                ? nextRelease.locker
                    ?.lockerNumber ||
                  "—"
                : "None"}

            </strong>

          </div>

        </div>

        {/* TIME LEFT */}

        <div className="rental-overview-card">

          <div className="overview-icon">
            ◷
          </div>

          <div>

            <span>
              TIME REMAINING
            </span>

            <strong>

              {nextRelease
                ? formatRemaining(
                    new Date(
                      nextRelease.endDate
                    ).getTime() - now
                  )
                : "—"}

            </strong>

          </div>

        </div>

      </div>

      {/* =====================================
          UPCOMING RELEASES
      ===================================== */}

      <div className="release-section">

        <div className="release-heading">

          <div>

            <p className="eyebrow">
              RENTAL SCHEDULE
            </p>

            <h3>
              Upcoming Locker Releases
            </h3>

            <p>
              See which occupied lockers
              will become available and
              how much rental time remains.
            </p>

          </div>

          <button
            className="refresh-btn"
            onClick={
              fetchAdminRentals
            }
          >
            ↻ Refresh
          </button>

        </div>

        {rentalsLoading ? (

          <div className="rental-loading">
            <div className="loader"></div>

            <span>
              Loading rental schedule...
            </span>
          </div>

        ) : activeRentals.length === 0 ? (

          <div className="no-rentals">

            <div>
              ✓
            </div>

            <strong>
              No Active Rentals
            </strong>

            <span>
              There are currently no
              occupied lockers with
              upcoming release dates.
            </span>

          </div>

        ) : (

          <div className="release-list">

            {activeRentals
              .sort(
                (a, b) =>
                  new Date(a.endDate) -
                  new Date(b.endDate)
              )
              .map((rental) => {

                const remaining =
                  new Date(
                    rental.endDate
                  ).getTime() - now;

                const isToday =
                  new Date(
                    rental.endDate
                  ).toDateString() ===
                  new Date(
                    now
                  ).toDateString();

                return (
                  <div
                    className={`release-card ${
                      isToday
                        ? "ends-today"
                        : ""
                    }`}
                    key={rental._id}
                  >

                    {/* LOCKER */}

                    <div className="release-locker">

                      <div className="release-locker-icon">
                        🔐
                      </div>

                      <div>

                        <span>
                          LOCKER
                        </span>

                        <strong>
                          {rental.locker
                            ?.lockerNumber ||
                            "Unknown"}
                        </strong>

                      </div>

                    </div>

                    {/* STUDENT */}

                    <div className="release-student">

                      <span>
                        STUDENT
                      </span>

                      <strong>
                        {rental.student
                          ?.name ||
                          "Unknown Student"}
                      </strong>

                      <small>
                        {rental.student
                          ?.email ||
                          ""}
                      </small>

                    </div>

                    {/* RENTAL PERIOD */}

                    <div className="release-dates">

                      <div>

                        <span>
                          START
                        </span>

                        <strong>
                          {formatDate(
                            rental.startDate
                          )}
                        </strong>

                      </div>

                      <div className="date-arrow">
                        →
                      </div>

                      <div>

                        <span>
                          RELEASE
                        </span>

                        <strong>
                          {formatDate(
                            rental.endDate
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* COUNTDOWN */}

                    <div className="release-countdown">

                      <span>
                        {isToday
                          ? "ENDS TODAY"
                          : "TIME REMAINING"}
                      </span>

                      <strong>
                        {formatRemaining(
                          remaining
                        )}
                      </strong>

                    </div>

                  </div>
                );
              })}

          </div>
        )}

      </div>

      {/* =====================================
          ADD LOCKER
      ===================================== */}

      <form
        className="add-locker-form"
        onSubmit={addLocker}
      >

        <div className="add-locker-info">

          <span className="add-locker-icon">
            ＋
          </span>

          <div>

            <strong>
              Add New Locker
            </strong>

            <small>
              Create a new locker for
              the library inventory.
            </small>

          </div>

        </div>

        <div className="add-locker-input-area">

          <input
            type="text"
            placeholder="e.g. L006"
            value={lockerNumber}
            onChange={(e) =>
              setLockerNumber(
                e.target.value
              )
            }
            maxLength={20}
          />

          <button
            type="submit"
            className="add-locker-btn"
            disabled={addingLocker}
          >
            {addingLocker
              ? "Adding..."
              : "Add Locker →"}
          </button>

        </div>

      </form>

      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="admin-message">
          ✓ {message}
        </div>
      )}

      {/* =====================================
          LOCKER MANAGEMENT TABLE
      ===================================== */}

      <div className="admin-table">

        <div className="admin-table-header">

          <span>
            LOCKER
          </span>

          <span>
            STATUS
          </span>

          <span>
            ACTION
          </span>

        </div>

        {lockers.map((locker) => (

          <div
            className="admin-row"
            key={locker._id}
          >

            {/* LOCKER */}

            <div className="admin-locker-name">

              <div className="admin-locker-icon">
                🔐
              </div>

              <div>

                <strong>
                  {locker.lockerNumber}
                </strong>

                <small>
                  Storage Locker
                </small>

              </div>

            </div>

            {/* STATUS */}

            <div>

              <span
                className={`admin-status ${locker.status.toLowerCase()}`}
              >
                {locker.status}
              </span>

            </div>

            {/* ACTION */}

            <div className="admin-actions">

              {locker.status ===
              "Maintenance" ? (

                <button
                  className="admin-action available-action"
                  disabled={
                    updatingId ===
                    locker._id
                  }
                  onClick={() =>
                    updateStatus(
                      locker._id,
                      "Available"
                    )
                  }
                >
                  {updatingId ===
                  locker._id
                    ? "Updating..."
                    : "Set Available"}
                </button>

              ) : locker.status ===
                "Available" ? (

                <>

                  <button
                    className="admin-action maintenance-action"
                    disabled={
                      updatingId ===
                      locker._id
                    }
                    onClick={() =>
                      updateStatus(
                        locker._id,
                        "Maintenance"
                      )
                    }
                  >
                    {updatingId ===
                    locker._id
                      ? "Updating..."
                      : "Maintenance"}
                  </button>

                  <button
                    className="admin-action delete-action"
                    disabled={
                      updatingId ===
                      locker._id
                    }
                    onClick={() =>
                      deleteLocker(
                        locker
                      )
                    }
                  >
                    {updatingId ===
                    locker._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </>

              ) : (

                <span className="occupied-note">
                  Currently Rented
                </span>

              )}

            </div>

          </div>

        ))}

      </div>

      {/* =====================================
          ADMIN NOTE
      ===================================== */}

      <div className="admin-note">

        <span>
          ℹ
        </span>

        Only administrators can change
        locker maintenance status or
        remove available lockers.

      </div>

    </section>
  );
}

export default AdminPanel;