import React, { useEffect, useState } from "react";
import styles from "./Billings.module.css";
import Footer from "./Footer";
import { toast } from "react-toastify";
import axios from "axios";


function Billings() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedBillings, setEditedBillings] = useState({});

  // ---- Penalty / Discount modal state ----
  const [adjustModal, setAdjustModal] = useState({
    open: false,
    billing: null,
    type: "", // "penalty" | "discount"
    amount: "",
    saving: false,
  });

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
          penalty: b.penalty || 0,
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

  // ---- Penalty / Discount handlers ----

  // Triggered by the "Add Penalty / Discount" select in each row
  const handleAdjustSelect = (billing, value) => {
    if (!value) return; // placeholder option, do nothing

    setAdjustModal({
      open: true,
      billing,
      type: value, // "penalty" or "discount"
      amount: "",
      saving: false,
    });
  };

  const closeAdjustModal = () => {
    setAdjustModal({
      open: false,
      billing: null,
      type: "",
      amount: "",
      saving: false,
    });
  };

  const applyServerResult = (data) => {
    setBillings((prev) =>
      prev.map((b) =>
        b.id === data.id
          ? {
              ...b,
              penalty: data.penalty,
              bal: data.bal,
              status: data.status,
            }
          : b
      )
    );
  };

  const handleSaveAdjustment = async () => {
    const { billing, type, amount } = adjustModal;

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setAdjustModal((prev) => ({ ...prev, saving: true }));

    try {
      const response = await fetch(
        "https://python-back-2.onrender.com/api/update-billing-penalty/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: billing.id,
            type, // "penalty" or "discount"
            amount: numericAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save");
        setAdjustModal((prev) => ({ ...prev, saving: false }));
        return;
      }

      toast.success(
        type === "penalty" ? "Penalty added successfully!" : "Discount added successfully!"
      );
      applyServerResult(data);
      closeAdjustModal();
    } catch (err) {
      toast.error("Network error: " + err.message);
      setAdjustModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Removes any penalty/discount and restores the original billing amount
  const handleResetPenalty = async (billing) => {
    if (!billing.penalty) {
      toast.info("No penalty or discount to remove");
      return;
    }

    try {
      const response = await fetch(
        "https://python-back-2.onrender.com/api/update-billing-penalty/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: billing.id,
            type: "reset",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to remove");
        return;
      }

      toast.success("Penalty/discount removed. Billing restored to original amount.");
      applyServerResult(data);
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  if (loading) return <div className={styles.mainDiv}>Loading...</div>;
  if (error) return <div className={styles.mainDiv}>Error: {error}</div>;

  {/*
  const sendSMS = async () => {
    try {
      const response = await axios.post(
        "https://python-back-2.onrender.com/api/send_sms_api/",
        {
          phone: "0712345678",
          message: "Your water bill is ready"
        }
      );

      toast.success("SMS sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send SMS");
    }
  };*/}

  const handleDownloadExcel = () => {
  window.open(
    "https://python-back-2.onrender.com/api/download-billings-template/",
    "_blank"
  );
  };

  const handleUploadExcel = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "https://python-back-2.onrender.com/api/upload-billings-excel/",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Upload failed");
      return;
    }

    toast.success("Excel uploaded successfully!");

    // refresh table
    window.location.reload();

  } catch (err) {
    toast.error("Upload error: " + err.message);
  }
  };

  return (
    <>
      <div className={styles.mainDiv}>
        {/*<Sms />*/}
        <h1>Billings</h1>
        <div style={{ marginBottom: "15px" }}>
          <button onClick={handleDownloadExcel} className={styles.btnSave}>
            Download Excel
          </button>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleUploadExcel}
            style={{ marginLeft: "10px" }}
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
              <th>Prev Bal</th>
              {/*<th>Total bill</th>*/}
              <th>Penalty / Discount</th>
              <th>Paid</th>
              <th>Bal (To Pay)</th>
              <th>Status</th>
              <th>Action</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => (
              <tr key={b.id}>
                <td>{b.user_id}</td>
                <td>{b.name}</td>
                <td>{b.phone}</td>
                <td>{b.units_used || 0}</td>
                <td>{b.rate || 0}</td>
                <td>{b.bill || 0}</td>
                <td>{b.b_cd || 0}</td>
                {/*<td>{b.total || 0}</td>*/}
                <td>
                  {b.penalty > 0 && (
                    <span className={`${styles.penaltyBadge} ${styles.penaltyPositive}`}>
                      +{b.penalty} Penalty
                    </span>
                  )}
                  {b.penalty < 0 && (
                    <span className={`${styles.penaltyBadge} ${styles.penaltyNegative}`}>
                      {b.penalty} Discount
                    </span>
                  )}
                  {(!b.penalty || b.penalty === 0) && (
                    <span className={styles.penaltyNone}>None</span>
                  )}
                  {b.penalty !== 0 && (
                    <button
                      onClick={() => handleResetPenalty(b)}
                      className={styles.btnResetPenalty}
                      title="Remove penalty/discount and restore original billing"
                    >
                      Remove
                    </button>
                  )}
                </td>
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
                <td>
                  <select
                    className={styles.adjustSelect}
                    value=""
                    onChange={(e) => handleAdjustSelect(b, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="penalty">Penalty</option>
                    <option value="discount">Discount</option>
                  </select>
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
        {/*
        <button onClick={sendSMS}>
          Send billing SMS
        </button>*/}
      </div>

      {/* ================= Penalty / Discount Modal ================= */}
      {adjustModal.open && (
        <div className={styles.modalOverlay} onClick={closeAdjustModal}>
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>
              {adjustModal.type === "penalty" ? "Add Penalty" : "Add Discount"}
            </h2>

            <p className={styles.modalSubtitle}>
              Customer: <strong>{adjustModal.billing?.name}</strong>
            </p>

            <label className={styles.modalLabel}>
              {adjustModal.type === "penalty" ? "Penalty Amount (KES)" : "Discount Amount (KES)"}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              placeholder="Enter amount"
              value={adjustModal.amount}
              onChange={(e) =>
                setAdjustModal((prev) => ({ ...prev, amount: e.target.value }))
              }
              className={styles.modalInput}
            />

            <p className={styles.modalHint}>
              {adjustModal.type === "penalty"
                ? "This will be added on top of the bill and previous balance."
                : "This will be subtracted from the bill and previous balance."}
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={closeAdjustModal}
                disabled={adjustModal.saving}
              >
                Cancel
              </button>
              <button
                className={styles.btnSave}
                onClick={handleSaveAdjustment}
                disabled={adjustModal.saving}
              >
                {adjustModal.saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/*<Footer />*/}
    </>
  );
}

export default Billings;