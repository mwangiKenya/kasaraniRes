import React, { useEffect, useState } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";
import Footer from "./Footer";

const BACKEND_URL = "https://python-back-2.onrender.com/api";
//const BACKEND_URL = "http://127.0.0.1:8000/api";

function Readings() {
  const [waterUsers, setWaterUsers] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [customers, setCustomers] = useState(0);

  // ----------------- FETCH DATA -----------------
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/read_data/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Ensure numeric fields are numbers (React inputs expect numbers)
      const parsedData = data.map(user => ({
        ...user,
        metre_num : user.metre_num ?? 0,
        prev_user: user.prev_user ?? 0,
        prev_sup: user.prev_sup ?? 0,
        cur_user: user.cur_user ?? 0,
        cur_sup: user.cur_sup ?? 0,
      }));

      setWaterUsers(parsedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error(`Failed to fetch data: ${err.message}`);
    }
  };

  // ----------------- HANDLE INPUT CHANGE -----------------
  const handleInputChange = (id, field, value) => {
  const numericValue = value === "" ? 0 : Number(value);

  // Update editedRows safely
  setEditedRows(prev => ({
    ...prev,
    [id]: { ...(prev[id] || {}), [field]: numericValue }
  }));

  // Update only the row being edited
  setWaterUsers(prev =>
    prev.map(row =>
      row.id === id ? { ...row, [field]: numericValue } : row
    )
  );
  };

  // ----------------- SAVE SINGLE ROW -----------------
  const saveSingleRow = async (row) => {
    try {
      // Always send user_id (FK) and numeric values
      const payload = {
        user_id: row.user_id || row.id, // ForeignKey to read_users table
        cur_user: Number(row.cur_user),
        cur_sup: Number(row.cur_sup)
      };

      const res = await fetch(`${BACKEND_URL}/submit_new_reading/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("New reading saved!");

        // Clear current input values visually
        setWaterUsers(prev =>
          prev.map(r =>
            r.id === row.id
              ? { ...r, cur_user: 0, cur_sup: 0 }
              : r
          )
        );

        // Remove from editedRows
        setEditedRows(prev => {
          const copy = { ...prev };
          delete copy[row.id];
          return copy;
        });

        fetchData(); // Refresh table with updated values
      }
      else if (prev_sup > cur_sup || prev_user > cur_user){
        toast.info('Current readings must be greater than previus');
      }
      else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.info("Failed to save the data");
    }
  };

  // ----------------- SAVE ALL ROWS -----------------
  const saveAllRows = async () => {
    const updates = Object.entries(editedRows).map(([id, data]) => ({
      user_id: data.user_id || id,
      cur_user: Number(data.cur_user),
      cur_sup: Number(data.cur_sup)
    }));

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/submit_new_reading/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        toast.success("All readings updated successfully!");
        setEditedRows({});
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update rows");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating rows");
    }
  };

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_cust/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data.total_cust || 0))
      .catch((err) => setError(err.message));
  }, []);
  

  // ----------------- RENDER -----------------
  return (
    <>
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>Water Readings</h2>
        <p>Total Customers Registered for billing : <strong>{customers}</strong></p>
        <button> Download excel sheet </button>

        <table className={styles.readingsTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Meter no</th>
              <th>Prev User</th>
              <th>Prev Sup</th>
              <th>Prev Date</th>
              <th>Cur User</th>
              <th>Cur Sup</th>
              <th>Cur Date</th>
              <th>Rate</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {waterUsers.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.metre_num}</td>
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.prev_user}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.prev_sup}
                    readOnly
                  />
                </td>
                <td>{row.prev_date}</td>
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.cur_user}
                    onChange={(e) =>
                      handleInputChange(row.id, "cur_user", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.cur_sup}
                    onChange={(e) =>
                      handleInputChange(row.id, "cur_sup", e.target.value)
                    }
                  />
                </td>
                <td>{row.cur_date}</td>
                <td>{row.rate}</td>
                <td>
                  <button
                    className={styles.saveButton}
                    onClick={() => saveSingleRow(row)}
                  >
                    Save
                  </button>
                </td>
                <td>
                  {(row.cur_user !== null &&
                    row.cur_sup !== null &&
                    Math.abs(((row.cur_user - row.cur_sup) / row.cur_user) * 100) <= 5)
                    ? "Good"
                    : "Leakage"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "20px" }}>
          <button className={styles.saveButton} onClick={saveAllRows}>
            Save All Changes
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Readings;