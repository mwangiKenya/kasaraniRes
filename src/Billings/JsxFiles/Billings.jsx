import React, { useEffect, useState, useRef } from "react";
import styles from "../CssFiles/Billings.module.css";
import { toast } from "react-toastify";
import { authFetch, downloadFile } from "../../api";
const post = (path, body) => authFetch(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });
function Billings() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedBillings, setEditedBillings] = useState({});
  const [adjustModal, setAdjustModal] = useState({ open: false, billing: null, type: "", amount: "", saving: false });
  const [excelFile, setExcelFile] = useState(null);
  const [uploadToken, setUploadToken] = useState(null);
  const [uploadStage, setUploadStage] = useState("idle");
  const [preExtractSnapshot, setPreExtractSnapshot] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const isReviewing = uploadStage !== "idle";
  useEffect(() => {
    authFetch("bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setBillings(data.map((b) => ({ ...b, paidValue: b.paid || 0, penalty: b.penalty || 0 })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  const handlePaidChange = (id, value) => {
    const numericValue = parseFloat(value) || 0;
    setBillings((prev) => prev.map((b) => (b.id === id ? { ...b, paidValue: numericValue } : b)));
    setEditedBillings((prev) => ({ ...prev, [id]: { id, paid: numericValue } }));
  };
  const handleSaveAll = async () => {
    if (isReviewing) {
      toast.info("Finish reviewing the uploaded sheet (Commit or Rollback) before making manual edits.");
      return;
    }
    const updates = Object.values(editedBillings);
    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }
    try {
      const response = await post("update_paid/", updates);
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
    if (isReviewing) {
      toast.info("Finish reviewing the uploaded sheet (Commit or Rollback) before making manual edits.");
      return;
    }
    try {
      const response = await post("update_paid/", { id: billing.id, paid: billing.paidValue });
      const data = await response.json();
      if (!response.ok) {
        toast.error(`Error saving: ${data.error || "Unknown error"}`);
      } else {
        toast.success("Payment saved successfully!");
        setBillings((prev) => prev.map((b) => (b.id === data.id ? { ...b, paidValue: data.paid, bal: data.bal, status: data.status } : b)));
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };
  const handleAdjustSelect = (billing, value) => {
    if (isReviewing) {
      toast.info("Finish reviewing the uploaded sheet (Commit or Rollback) before adjusting penalties/discounts.");
      return;
    }
    if (!value) return;
    setAdjustModal({ open: true, billing, type: value, amount: "", saving: false });
  };
  const closeAdjustModal = () => setAdjustModal({ open: false, billing: null, type: "", amount: "", saving: false });
  const applyServerResult = (data) => {
    setBillings((prev) => prev.map((b) => (b.id === data.id ? { ...b, penalty: data.penalty, bal: data.bal, status: data.status } : b)));
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
      const response = await post("update-billing-penalty/", { id: billing.id, type, amount: numericAmount });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to save");
        setAdjustModal((prev) => ({ ...prev, saving: false }));
        return;
      }
      toast.success(type === "penalty" ? "Penalty added successfully!" : "Discount added successfully!");
      applyServerResult(data);
      closeAdjustModal();
    } catch (err) {
      toast.error("Network error: " + err.message);
      setAdjustModal((prev) => ({ ...prev, saving: false }));
    }
  };
  const handleResetPenalty = async (billing) => {
    if (isReviewing) {
      toast.info("Finish reviewing the uploaded sheet (Commit or Rollback) before adjusting penalties/discounts.");
      return;
    }
    if (!billing.penalty) {
      toast.info("No penalty or discount to remove");
      return;
    }
    try {
      const response = await post("update-billing-penalty/", { id: billing.id, type: "reset" });
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
  const handleDownloadExcel = () => downloadFile("download-billings-template/", "billings_template.xlsx").then((ok) => ok || toast.error("Download failed"));
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
  };
  const handleUploadSheet = async () => {
    if (!excelFile) {
      toast.error("Please choose an Excel file first");
      return;
    }
    setProcessing(true);
    const formData = new FormData();
    formData.append("file", excelFile);
    try {
      const response = await post("upload-billings-excel/", formData);
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Upload failed");
        setProcessing(false);
        return;
      }
      setUploadToken(data.token);
      setUploadStage("uploaded");
      toast.success(data.message || "Sheet uploaded successfully.");
    } catch (err) {
      toast.error("Upload error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };
  const handleExtractData = async () => {
    if (!uploadToken) {
      toast.error("Upload a sheet first");
      return;
    }
    setProcessing(true);
    try {
      const response = await post("extract-billings-excel/", { token: uploadToken });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to extract data");
        setProcessing(false);
        return;
      }
      setPreExtractSnapshot(billings.map((b) => ({ ...b })));
      setBillings((prev) =>
        prev.map((b) => {
          const match = (data.preview || []).find((p) => p.id === b.id);
          return match ? { ...b, paidValue: match.paid, bal: match.bal, status: match.status } : b;
        })
      );
      setUploadStage("extracted");
      toast.success(data.message || "Data extracted for review. Nothing has been saved yet.");
      if (data.errors && data.errors.length > 0) {
        toast.warn(`${data.errors.length} row(s) had issues — check the console for details.`);
        console.warn("Excel extraction issues:", data.errors);
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };
  const handleCommit = async () => {
    if (!uploadToken) {
      toast.error("Nothing to commit");
      return;
    }
    setProcessing(true);
    try {
      const response = await post("commit-billings-excel/", { token: uploadToken });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to commit changes");
        setProcessing(false);
        return;
      }
      toast.success(data.message || "Changes committed successfully!");
      window.location.reload();
    } catch (err) {
      toast.error("Network error: " + err.message);
      setProcessing(false);
    }
  };
  const handleRollback = async () => {
    if (!uploadToken) {
      toast.error("Nothing to roll back");
      return;
    }
    setProcessing(true);
    try {
      const response = await post("rollback-billings-excel/", { token: uploadToken });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to roll back");
        setProcessing(false);
        return;
      }
      if (preExtractSnapshot) setBillings(preExtractSnapshot);
      setUploadToken(null);
      setUploadStage("idle");
      setExcelFile(null);
      setPreExtractSnapshot(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.info(data.message || "Rolled back — no changes were saved.");
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };
  return (
    <>
      <div className={styles.mainDiv}>
        <h1>Billings</h1>
        <div style={{ marginBottom: "15px" }}>
          <button onClick={handleDownloadExcel} className={styles.btnSave}>
            Download Excel
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileSelect} disabled={isReviewing || processing} style={{ marginLeft: "10px" }} />
          <button onClick={handleUploadSheet} className={styles.btnSave} disabled={!excelFile || isReviewing || processing} style={{ marginLeft: "10px" }}>
            Upload Sheet
          </button>
          {isReviewing && (
            <span style={{ marginLeft: "15px", fontStyle: "italic" }}>
              {uploadStage === "uploaded" && "Sheet uploaded — click \"Extract Data\" to preview the changes."}
              {uploadStage === "extracted" && "Data extracted for review — click \"Commit\" to save, or \"Rollback\" to cancel."}
            </span>
          )}
          {isReviewing && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={handleExtractData} className={styles.btnSave} disabled={uploadStage !== "uploaded" || processing}>
                Extract Data
              </button>
              <button onClick={handleCommit} className={styles.btnSave} disabled={uploadStage !== "extracted" || processing} style={{ marginLeft: "10px" }}>
                Commit
              </button>
              <button onClick={handleRollback} className={styles.btnCancel} disabled={processing} style={{ marginLeft: "10px" }}>
                Rollback
              </button>
            </div>
          )}
        </div>
        <table className={styles.billingTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Usage</th>
              <th>Bill</th>
              <th>Prev Bal</th>
              <th>Pen/Disc</th>
              <th>Paid</th>
              <th>To pay</th>
              <th>Status</th>
              <th>Action</th>
              <th>Add Pen/Disc</th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => (
              <tr key={b.id}>
                <td>{b.sms_name}</td>
                <td>{b.units_used || 0}</td>
                <td>{b.bill || 0}</td>
                <td>{b.b_cd || 0}</td>
                <td>
                  {b.penalty > 0 && <span className={`${styles.penaltyBadge} ${styles.penaltyPositive}`}>+{b.penalty} Penalty</span>}
                  {b.penalty < 0 && <span className={`${styles.penaltyBadge} ${styles.penaltyNegative}`}>{b.penalty} Discount</span>}
                  {(!b.penalty || b.penalty === 0) && <span className={styles.penaltyNone}>None</span>}
                  {b.penalty !== 0 && (
                    <button onClick={() => handleResetPenalty(b)} className={styles.btnResetPenalty} title="Remove penalty/discount and restore original billing" disabled={isReviewing}>
                      Remove
                    </button>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={b.paidValue}
                    onChange={(e) => handlePaidChange(b.id, e.target.value)}
                    className={styles.BillingsInput}
                    disabled={isReviewing}
                    title={isReviewing ? "Finish reviewing the uploaded sheet first" : undefined}
                  />
                </td>
                <td>{b.bal != null ? b.bal : b.bill - b.paidValue}</td>
                <td>{b.status || "Unpaid"}</td>
                <td>
                  <button onClick={() => handleSave(b)} className={styles.btnSave} disabled={isReviewing}>
                    Save
                  </button>
                </td>
                <td>
                  <select className={styles.adjustSelect} value="" onChange={(e) => handleAdjustSelect(b, e.target.value)} disabled={isReviewing}>
                    <option value="">-- Select --</option>
                    <option value="penalty">Penalty</option>
                    <option value="discount">Discount</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adjustModal.open && (
        <div className={styles.modalOverlay} onClick={closeAdjustModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{adjustModal.type === "penalty" ? "Add Penalty" : "Add Discount"}</h2>
            <p className={styles.modalSubtitle}>
              Customer: <strong>{adjustModal.billing?.name}</strong>
            </p>
            <label className={styles.modalLabel}>{adjustModal.type === "penalty" ? "Penalty Amount (KES)" : "Discount Amount (KES)"}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              placeholder="Enter amount"
              value={adjustModal.amount}
              onChange={(e) => setAdjustModal((prev) => ({ ...prev, amount: e.target.value }))}
              className={styles.modalInput}
            />
            <p className={styles.modalHint}>
              {adjustModal.type === "penalty" ? "This will be added on top of the bill and previous balance." : "This will be subtracted from the bill and previous balance."}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={closeAdjustModal} disabled={adjustModal.saving}>
                Cancel
              </button>
              <button className={styles.btnSave} onClick={handleSaveAdjustment} disabled={adjustModal.saving}>
                {adjustModal.saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Billings;