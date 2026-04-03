{/*import React, { useEffect, useState } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";
import Footer from "./Footer";

// Set your backend URL (local dev or production)
//const BACKEND_URL = "http://127.0.0.1:8000/api"; // change to production URL when deployed
const BACKEND_URL = "https://python-back-2.onrender.com/api"; // change to production URL when deployed

function Readings() {
  const [waterUsers, setWaterUsers] = useState([]);
  const [editedRows, setEditedRows] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/read_data/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWaterUsers(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error(`Failed to fetch data: ${err.message}`);
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
    setWaterUsers(prev => 
      prev.map(row => row.id === id ? { ...row, [field]: value } : row)
    );
  };

  {/*
  const saveSingleRow = async (id) => {
    const rowData = editedRows[id];
    if (!rowData) {
      toast.info("No changes to save for this user");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/submit_new_reading/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ id, ...rowData }])
      });
      if (res.ok) {
        toast.success("Row updated successfully!");
        setEditedRows(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update row");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating row");
    }
  };
  
  const saveSingleRow = async (row) => {
  try {
    const res = await fetch(`${BACKEND_URL}/submit_new_reading/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: row.user_id,
        cur_user: row.cur_user,
        cur_sup: row.cur_sup
      })
    });

    if (res.ok) {
      toast.success("New reading saved!");

      // Clear current readings after saving
      setWaterUsers(prev =>
        prev.map(r =>
          r.id === row.id
            ? { ...r, cur_user: "", cur_sup: "" }
            : r
        )
      );

      fetchData(); // reload updated data
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "Failed to save");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error saving reading");
  }
};

  const saveAllRows = async () => {
    const updates = Object.entries(editedRows).map(([id, data]) => ({
      id: parseInt(id),
      ...data
    }));

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/update-readings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success("Readings data updated successfully!");
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

  return (
    <>
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Water Readings</h2>
      

      <table className={styles.readingsTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Prev User</th>
            <th>Prev Sup</th>
            <th>Cur User</th>
            <th>Cur Sup</th>
            <th>Rate</th>
            {/*<th>Units Used</th>
            <th>Action</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {waterUsers.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.phone}</td>
              <td>
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={row.prev_user || ""}
                  readOnly
                  onChange={(e) => handleInputChange(row.id, "prev_user", parseInt(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={row.prev_sup || ""}
                  readOnly
                  onChange={(e) => handleInputChange(row.id, "prev_sup", parseInt(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={row.cur_user || ""}
                  onChange={(e) => handleInputChange(row.id, "cur_user", parseInt(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={row.cur_sup || ""}
                  onChange={(e) => handleInputChange(row.id, "cur_sup", parseInt(e.target.value))}
                />
              </td>
              <td>{row.rate}</td>
              {/*<td>{row.units_used !== null ? row.units_used : "-"}</td>
              <td>
                <button onClick={() => saveSingleRow(row)} className={styles.saveButton}>Save</button>
              </td>
              <td>
              {(row.cur_user !== null && row.cur_sup !== null && (((row.cur_user - row.cur_sup) >= 0 && (row.cur_user - row.cur_sup <= 3)) || ((row.cur_sup - row.cur_user) >= 0 && (row.cur_sup - row.cur_user <= 3))))
                ? "Good"
                : "Leakage"}
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button onClick={saveAllRows} className={styles.saveButton}>Save All Changes</button>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Readings;




*/}


import React, { useEffect, useState } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";
import Footer from "./Footer";

// Backend URL (change to your production URL if deployed)
const BACKEND_URL = "https://python-back-2.onrender.com/api";

function Readings() {
  const [waterUsers, setWaterUsers] = useState([]);
  const [editedRows, setEditedRows] = useState({});

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
    // Convert empty string to 0 to prevent IntegerField errors
    const numericValue = value === "" ? 0 : Number(value);

    // Update editedRows to track changes
    setEditedRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: numericValue }
    }));

    // Update waterUsers table immediately for visual feedback
    setWaterUsers(prev =>
      prev.map(row => row.id === id ? { ...row, [field]: numericValue } : row)
    );
  };

  // ----------------- SAVE SINGLE ROW -----------------
  const saveSingleRow = async (row) => {
    try {
      // Always send user_id (FK) and numeric values
      const payload = {
        user_id: row.user_id, // ForeignKey to read_users table
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
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving reading");
    }
  };

  // ----------------- SAVE ALL ROWS -----------------
  const saveAllRows = async () => {
    const updates = Object.entries(editedRows).map(([id, data]) => ({
      user_id: data.user_id,  // Ensure FK is included
      cur_user: Number(data.cur_user),
      cur_sup: Number(data.cur_sup)
    }));

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/update-readings/`, {
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

  // ----------------- RENDER -----------------
  return (
    <>
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>Water Readings</h2>

        <table className={styles.readingsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Prev User</th>
              <th>Prev Sup</th>
              <th>Cur User</th>
              <th>Cur Sup</th>
              <th>Rate</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {waterUsers.map(row => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.phone}</td>
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
                    Math.abs(row.cur_user - row.cur_sup) <= 3)
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