import React, { useEffect, useState, useRef } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api";

function Readings() {
  const [waterUsers, setWaterUsers] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [customers, setCustomers] = useState(0);
  const [timer, setTimer] = useState({});
  const intervalRef = useRef(null);

  // ===============================
  // INIT LOAD
  // ===============================
  useEffect(() => {
    fetchData();
    fetchCustomers();
    startTimer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ===============================
  // FETCH READINGS
  // ===============================
  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/read_data/`);
      const data = await res.json();
      setWaterUsers(data);
    } catch (err) {
      toast.error("Failed to load readings");
    }
  };

  // ===============================
  // FETCH CUSTOMERS
  // ===============================
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/total_cust/`);
      const data = await res.json();
      setCustomers(data.total_cust || 0);
    } catch (err) {
      toast.error("Failed to load customers");
    }
  };

  // ===============================
  // TIMER (FIXED MEMORY LEAK)
  // ===============================
  const startTimer = () => {
    const fetchTimer = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/billing_timer/`);
        const data = await res.json();
        setTimer(data);
      } catch (err) {
        console.error("Timer error", err);
      }
    };

    fetchTimer();
    intervalRef.current = setInterval(fetchTimer, 1000);
  };

  // ===============================
  // INPUT HANDLER (SAFE)
  // ===============================
  const handleChange = (id, field, value) => {
    const num = value === "" ? "" : Number(value);

    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        user_id: id,
        [field]: num,
      },
    }));

    setWaterUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, [field]: num } : u
      )
    );
  };

  // ===============================
  // SAVE SINGLE ROW
  // ===============================
  const saveSingle = async (row) => {
    if (
      row.cur_user < row.prev_user ||
      row.cur_sup < row.prev_sup
    ) {
      return toast.error("Current readings must be higher than previous");
    }

    const payload = {
      user_id: row.user_id,
      cur_user: row.cur_user ?? null,
      cur_sup: row.cur_sup ?? null,
      mid_user: row.mid_user ?? null,
      mid_sup: row.mid_sup ?? null,
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/submit_new_reading/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Saved successfully");
        fetchData();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // ===============================
  // SAVE ALL (BULK FIXED)
  // ===============================
  const saveAll = async () => {
    const updates = Object.values(editedRows);

    if (!updates.length) {
      return toast.info("No changes to save");
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/submit_new_reading/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("All changes saved");

        setEditedRows({});

        // finalize month safely AFTER save
        await fetch(`${BACKEND_URL}/finalize_month/`, {
          method: "POST",
        });

        fetchData();
      } else {
        toast.error(data.error || "Bulk save failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className={styles.tableContainer}>
      <h2>Water Readings</h2>

      <p>Total Customers: {customers}</p>

      <h3>
        Cycle ends in:{" "}
        {timer.days ?? 0}d{" "}
        {timer.hours ?? 0}h{" "}
        {timer.minutes ?? 0}m{" "}
        {timer.seconds ?? 0}s
      </h3>

      <table className={styles.readingsTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Previous</th>
            <th>Mid</th>
            <th>Current</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {waterUsers.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>

              <td>{row.prev_user}</td>

              <td>
                <input
                  type="number"
                  value={row.mid_user ?? ""}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "mid_user",
                      e.target.value
                    )
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.cur_user ?? ""}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "cur_user",
                      e.target.value
                    )
                  }
                />
              </td>

              <td>
                <button onClick={() => saveSingle(row)}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={saveAll}>Save All</button>
    </div>
  );
}

export default Readings;