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
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('penalty'); // 'penalty' or 'discount'
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all billings from backend
  useEffect(() => {
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
          penaltyValue: b.penalty || 0,
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

      setEditedBillings({});
      window.location.reload();
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  const handleSave = async (billing) => {
    try {
      const response = await fetch(
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

  // Handle penalty/discount selection
  const handlePenaltyDiscountSelect = (billing, type) => {
    setSelectedBilling(billing);
    setModalType(type);
    setAmount('');
    setShowModal(true);
  };

  // Handle remove penalty/discount
  const handleRemovePenaltyDiscount = async (billing) => {
    if (!window.confirm(`Remove penalty/discount for ${billing.name}?`)) {
      return;
    }

    try {
      const response = await fetch(
        "https://python-back-2.onrender.com/api/remove-penalty-discount/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billing_id: billing.id,
            username: localStorage.getItem('username') || 'system',
            role: localStorage.getItem('role') || 'system'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to remove");
        return;
      }

      toast.success("Penalty/Discount removed successfully!");

      // Update the row
      setBillings((prev) =>
        prev.map((b) =>
          b.id === data.data.id
            ? {
                ...b,
                penalty: data.data.penalty,
                penaltyValue: data.data.penalty,
                bal: data.data.bal,
                status: data.data.status,
              }
            : b
        )
      );
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  // Handle modal save
  const handleModalSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      const endpoint = modalType === 'penalty' 
        ? "https://python-back-2.onrender.com/api/add-penalty/"
        : "https://python-back-2.onrender.com/api/add-discount/";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_id: selectedBilling.id,
          amount: parseFloat(amount),
          username: localStorage.getItem('username') || 'system',
          role: localStorage.getItem('role') || 'system'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || `Failed to add ${modalType}`);
        return;
      }

      toast.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully!`);

      // Update the row
      setBillings((prev) =>
        prev.map((b) =>
          b.id === data.data.id
            ? {
                ...b,
                penalty: data.data.penalty,
                penaltyValue: data.data.penalty,
                bal: data.data.bal,
                status: data.data.status,
              }
            : b
        )
      );

      setShowModal(false);
      setSelectedBilling(null);
      setAmount('');
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Close modal
  const handleModalClose = () => {
    if (!isProcessing) {
      setShowModal(false);
      setSelectedBilling(null);
      setAmount('');
    }
  };

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
      window.location.reload();
    } catch (err) {
      toast.error("Upload error: " + err.message);
    }
  };

  if (loading) return <div className={styles.mainDiv}>Loading...</div>;
  if (error) return <div className={styles.mainDiv}>Error: {error}</div>;

  return (
    <>
      <div className={styles.mainDiv}>
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
              <th>Penalty/Discount</th>
              <th>Total Due</th>
              <th>Paid</th>
              <th>Bal</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => {
              const totalDue = (b.bill || 0) + (b.b_cd || 0) + (b.penalty || 0);
              const hasPenalty = b.penalty !== 0 && b.penalty !== null;
              
              return (
                <tr key={b.id}>
                  <td>{b.user_id}</td>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.units_used || 0}</td>
                  <td>{b.rate || 0}</td>
                  <td>{b.bill || 0}</td>
                  <td>{b.b_cd || 0}</td>
                  <td>
                    <span style={{ 
                      color: b.penalty < 0 ? 'green' : b.penalty > 0 ? 'red' : 'inherit',
                      fontWeight: b.penalty !== 0 ? 'bold' : 'normal'
                    }}>
                      {b.penalty || 0}
                      {hasPenalty && (
                        <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>
                          ({b.penalty < 0 ? 'Discount' : 'Penalty'})
                        </span>
                      )}
                    </span>
                  </td>
                  <td>{totalDue.toFixed(2)}</td>
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
                  <td>{b.bal != null ? b.bal.toFixed(2) : totalDue - b.paidValue}</td>
                  <td>
                    <span style={{
                      color: b.status === 'Paid' ? 'green' : 
                             b.status === 'Partially Paid' ? 'orange' : 'red'
                    }}>
                      {b.status || "Unpaid"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <select 
                        className={styles.actionSelect}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'penalty' || value === 'discount') {
                            handlePenaltyDiscountSelect(b, value);
                          } else if (value === 'remove') {
                            handleRemovePenaltyDiscount(b);
                          }
                          e.target.value = ''; // Reset select
                        }}
                        value=""
                      >
                        <option value="">Add...</option>
                        <option value="penalty">+ Penalty</option>
                        <option value="discount">- Discount</option>
                        {hasPenalty && <option value="remove">× Remove</option>}
                      </select>
                      <button 
                        onClick={() => handleSave(b)} 
                        className={styles.btnSave}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginBottom: "15px" }}>
          <button onClick={handleSaveAll} className={styles.btnSave}>
            Save All Changes
          </button>
        </div>
      </div>

      {/* Modal for Penalty/Discount */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'penalty' ? 'Add Penalty' : 'Apply Discount'}
              </h2>
              <button 
                className={styles.modalClose} 
                onClick={handleModalClose}
                disabled={isProcessing}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                {modalType === 'penalty' 
                  ? `Add penalty for ${selectedBilling?.name}` 
                  : `Apply discount for ${selectedBilling?.name}`}
              </p>
              <div className={styles.modalInputGroup}>
                <label>
                  {modalType === 'penalty' ? 'Penalty Amount (KES)' : 'Discount Amount (KES)'}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={styles.modalInput}
                  disabled={isProcessing}
                  autoFocus
                />
              </div>
              <div className={styles.modalInfo}>
                <p>Current Balance: KES {selectedBilling?.bal?.toFixed(2) || 0}</p>
                {amount && parseFloat(amount) > 0 && (
                  <p style={{ color: modalType === 'penalty' ? 'red' : 'green' }}>
                    New Balance: KES {(
                      (selectedBilling?.bal || 0) + 
                      (modalType === 'penalty' ? parseFloat(amount) : -parseFloat(amount))
                    ).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancel} 
                onClick={handleModalClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={styles.modalSave} 
                onClick={handleModalSave}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              >
                {isProcessing ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Billings;