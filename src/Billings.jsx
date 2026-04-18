import React, { useEffect, useState } from "react";
import styles from "./Billings.module.css";
import Footer from "./Footer";
import { toast } from "react-toastify";


function Billings() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedBillings, setEditedBillings] = useState({});
  const [search, setSearch] = useState("");

  // Fetch all billings from backend
  useEffect(() => {
    //fetch("http://127.0.0.1:8000/api/bill/") // API endpoint
    fetch("https://python-back-2.onrender.com/api/bill/") 
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        // Add a local field to track changes to paid
        const billsWithPaid = data.map((b) => ({
          ...b,
          paidValue: b.paid || 0,
        }));
        setBillings(billsWithPaid);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Update local paidValue state when user types
  const handlePaidChange = (id, value) => {
  const numericValue = parseFloat(value) || 0;

  setBillings((prev) =>
    prev.map((b) =>
      b.id === id ? { ...b, paidValue: numericValue } : b
    )
  );

  setEditedBillings((prev) => ({
    ...prev,
    [id]: {
      id,
      paid: numericValue,
    },
  }));
  };

  const handleSaveAll = async () => {
  const updates = Object.values(editedBillings);

  if (updates.length === 0) {
    toast.info("No changes to save");
    return;
  }

  try {
    const response = await fetch(
      "https://python-back-2.onrender.com/api/update_paid/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Failed to update");
      return;
    }

    toast.success("All payments updated!");

    // refresh data
    setEditedBillings({});
    window.location.reload(); // simple refresh (or refetch API)
  } catch (err) {
    toast.error("Network error: " + err.message);
  }
  };

  // Save updated paid to backend and immediately update row in table
  const handleSave = async (billing) => {
    try {
      const response = await fetch(
        //`http://127.0.0.1:8000/api/update_paid/`,
        `https://python-back-2.onrender.com/api/update_paid/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: billing.id,
            paid: billing.paidValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(`Error saving: ${data.error || "Unknown error"}`);
      } else {
        toast.success("Saved successfully!");

        // Update the row immediately using the returned updated data
        setBillings((prev) =>
          prev.map((b) =>
            b.id === data.id
              ? {
                  ...b,
                  paidValue: data.paid,
                  bal: data.bal,
                  status: data.status,
                }
              : b
          )
        );
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchData(value);
  };

  if (loading) return <div className={styles.mainDiv}>Loading...</div>;
  if (error) return <div className={styles.mainDiv}>Error: {error}</div>;

  return (
    <>
      <div className={styles.mainDiv}>
        {/*<Sms />*/}
        <h1>Billings</h1>
              {/* SEARCH BAR */}
              <div className={styles.controls}>
                <input
                  type="text"
                  placeholder="Search customer name..."
                  value={search}
                  onChange={handleSearch}
                  className={styles.search}
                />
              </div>
        <table className={styles.billingTable}>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Units Used</th>
              <th>Rate</th>
              <th>Bill</th>
              <th>Paid</th>
              <th>Bal</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.name}</td>
                <td>{b.phone}</td>
                <td>{b.units_used || 0}</td>
                <td>{b.rate || 0}</td>
                <td>{b.bill || 0}</td>
                <td>
                  <input
                    type="number"
                    value={b.paidValue}
                    onChange={(e) =>
                      handlePaidChange(b.id, e.target.value)
                    }
                    className={styles.BillingsInput}
                  />
                </td>
                <td>{b.bal != null ? b.bal : b.bill - b.paidValue}</td>
                <td>{b.status || "Unpaid"}</td>
                <td>
                  <button onClick={() => handleSave(b)} className={styles.btnSave}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginBottom: "15px" }}>
            <button onClick={handleSaveAll} className={styles.btnSave}>
              Save All Changes
            </button>
          </div>
      </div>
      <Footer />
    </>
  );
}

export default Billings;