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
  const [excelFile, setExcelFile] = useState(null);
  const [cycleDays, setCycleDays] = useState(30); // configurable delay
  const [startMonth, setStartMonth] = useState("2026-05");
  const [timer, setTimer] = useState({});
const [cycleDelay, setCycleDelay] = useState(0);


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
        mid_user: user.mid_user ?? 0,
        mid_sup: user.mid_sup ?? 0,
        cur_user: user.cur_user,
        cur_sup: user.cur_sup,
      }));

      setWaterUsers(parsedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error(`Failed to fetch data: ${err.message}`);
    }
  };

  // ----------------- HANDLE INPUT CHANGE -----------------
  const handleInputChange = (id, field, value) => {
  const numericValue = value === "" ? null : Number(value);

  const row = waterUsers.find(r => r.id === id);

  setEditedRows(prev => ({
    ...prev,
    [id]: {
      ...(prev[id] || {}),
      user_id: row.user_id,   // ✅ FIX
      [field]: numericValue
    }
  }));

  setWaterUsers(prev =>
    prev.map(row =>
      row.id === id ? { ...row, [field]: numericValue } : row
    )
  );
  };

  // ----------------- SAVE SINGLE ROW -----------------
  const saveSingleRow = async (row) => {
    if (
      row.cur_user !== null &&
      row.cur_sup !== null &&(row.prev_sup > row.cur_sup || row.prev_user > row.cur_user)){
      toast.info('Current readings must be greater than previus');
      return; //Stop execution
    }
    try {
      // Always send user_id (FK) and numeric values
      const payload = {
        user_id: row.user_id || row.id,
        cur_user: row.cur_user === null ? null : Number(row.cur_user),
        cur_sup: row.cur_sup === null ? null : Number(row.cur_sup),
        mid_user: row.mid_user === null ? null : Number(row.mid_user),
        mid_sup: row.mid_sup === null ? null : Number(row.mid_sup)
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
              ? { ...r, cur_user: null, cur_sup: null }
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
    cur_user: data.cur_user === null ? null : Number(data.cur_user),
    cur_sup: data.cur_sup === null ? null : Number(data.cur_sup),
    mid_user: data.mid_user,
    mid_sup: data.mid_sup
  }));

  if (updates.length === 0) {
    toast.info("No changes to save");
    return;
  }

  const missing = updates.filter(
    u => u.cur_user == null || u.cur_sup == null
  );

  if (missing.length > 0) {
    if (!window.confirm(`${missing.length} missing readings. Fill with previous values?`)) {
      return;
    }

    updates.forEach(u => {
      if (u.cur_user == null) u.cur_user = 0;
      if (u.cur_sup == null) u.cur_sup = 0;
    });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/submit_new_reading/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });

    if (res.ok) {
      toast.success("Saved successfully");
      setEditedRows({});

      // ONLY NOW SHIFT MONTH
     // only save data

      fetchData();
    }

  } catch (err) {
    toast.error("Error saving");
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
  
  const downloadExcel = () => {
  window.open(`${BACKEND_URL}/download_readings_template/`);
   };

  const uploadExcel = async () => {
  if (!excelFile) {
    toast.error("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", excelFile);

  try {
    const res = await fetch(`${BACKEND_URL}/upload_readings_excel/`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message);
      fetchData(); // refresh table
    } else {
      toast.error(data.error);
    }
  } catch (err) {
    toast.error("Upload failed");
  }
  };
   
  
  const resetMidMonth = async () => {
    if (!window.confirm("Reset all mid-month readings?")) return;
  try {
    const res = await fetch(`${BACKEND_URL}/reset-mid-month-readings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: "admin",
        role: "admin"
      })
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Mid-month reset successful");
      fetchData(); // refresh table after reset
    } else {
      toast.error(data.error || "Reset failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Network error");
  }
};

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/billing_timer/`);
      const data = await res.json();
      setTimer(data);
    } catch (err) {
      console.error(err);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

const finalizeCycle = async () => {
  if (!window.confirm("Finalize month and shift readings?")) return;

  const res = await fetch(`${BACKEND_URL}/finalize_month/`, {
    method: "POST"
  });

  const data = await res.json();

  if (res.ok) {
    toast.success("Cycle shifted successfully");
    fetchData();
  } else {
    toast.error(data.error);
  }
};

const startMonthCycle = async () => {
  const res = await fetch(`${BACKEND_URL}/start_billing_month/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start_month: startMonth })
  });

  const data = await res.json();

  if (res.ok) {
    toast.success("Billing cycle started");
    fetchData();
  } else {
    toast.error(data.error);
  }
};
  // ----------------- RENDER -----------------
  return (
    <>
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>Water Readings</h2>
        <p>Total Customers Registered for billing : <strong>{customers}</strong></p>
        <div className={styles.dataUpload}>
          
          <ul>
            <h3>Readings update; </h3>
            <li>Click <strong> Download excel sheet </strong> to get the formated sheet of readings table, </li>
            <li>Fill in the required data, The current readings, and save the file</li>
            <li>Click <strong>upload excel sheet</strong> and select the file,</li>
            <li>Click <strong>Submit data file</strong> to submit the data</li>
            <h3>Or,</h3>
            <li>Update the data in the table below</li>
            <li>Click save or Save all to submit the data </li>
          </ul>
        </div>
        <div className={styles.dataUpload}>
            <button onClick={downloadExcel}>
              Download Excel Sheet
            </button>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setExcelFile(e.target.files[0])}
            />

            <button onClick={uploadExcel}>
              Submit Data File
            </button>

            <button onClick={resetMidMonth}>
              Reset Mid-Month Data
            </button>

            <button
                onClick={async () => {
                  if (!window.confirm("Restore previous readings state?")) return;

                  const res = await fetch(`${BACKEND_URL}/restore_readings/`, {
                    method: "POST"
                  });

                  const data = await res.json();
                  if (res.ok) {
                    toast.success("Restored successfully");
                    fetchData();
                  } else {
                    toast.error(data.error);
                  }
                }}
              >
                Restore System
              </button>
          </div>
          <div style={{ marginBottom: "10px" }}>
              <h3>Next Billing Cycle In:</h3>
              <p>
                {timer.days}d : {timer.hours}h : {timer.minutes}m : {timer.seconds}s
              </p>
            </div>

          <div style={{ marginBottom: "15px" }}>
        <h3>Billing Cycle Settings</h3>

        <label>Start Month:</label>
        <input
          type="month"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
        />

        <label>Shift Delay (days):</label>
        <input
          type="number"
          value={cycleDelay}
          onChange={(e) => setCycleDelay(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
      <h3>Next Cycle In:</h3>
      <p>
        {timer.days}d : {timer.hours}h : {timer.minutes}m : {timer.seconds}s
      </p>
    </div>
    <button onClick={startMonthCycle}>
        Start This Month
      </button>
    
       <button onClick={finalizeCycle}>Finish Month</button>

        <table className={styles.readingsTable}>
          <thead>
            <tr>
              <th colSpan={4}>User Data</th>
              <th colSpan={2}>
              {waterUsers.length > 0 ? waterUsers[0].prev_date : ""}
            </th>

            <th colSpan={2}> Mid-Month </th>

            <th colSpan={2}>
              {waterUsers.length > 0 ? waterUsers[0].cur_date : ""}
            </th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Meter</th>
              <th>User</th>
              <th>Sup</th>
              <th>User</th>
              <th>Sup</th>
              <th>User</th>
              <th>Sup</th>
              <th>Rate</th>
              <th>Save</th>
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

                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.mid_user ?? ""}
                    onChange={(e) =>
                      handleInputChange(row.id, "mid_user", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.mid_sup ?? ""}
                    onChange={(e) =>
                      handleInputChange(row.id, "mid_sup", e.target.value)
                    }
                  />
                </td>
                
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.cur_user ?? ""}
                    onChange={(e) =>
                      handleInputChange(row.id, "cur_user", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.wateruserInput}
                    value={row.cur_sup ?? ""}
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
                  {row.cur_user == null || row.cur_sup == null
                    ? "No Reading"
                    : row.cur_user === 0
                      ? "Invalid"
                      : Math.abs((((row.cur_sup-row.prev_sup) - (row.cur_user-row.prev_user))/(row.cur_sup-row.prev_sup)) * 100) <= 5
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
      {/*<Footer />*/}
    </>
  );
}

export default Readings;