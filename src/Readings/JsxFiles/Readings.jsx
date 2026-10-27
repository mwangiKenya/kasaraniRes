import React, { useEffect, useState } from "react";
import styles from "../CssFiles/Readings.module.css";
import { toast } from "react-toastify";
import mainUrl from "../../api";
const JSON_H = { "Content-Type": "application/json" };
function Readings() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState(0);
  const [file, setFile] = useState(null);
  const load = () => fetch(`${mainUrl}read_data/`).then(r => r.json()).then(setRows).catch(e => toast.error(`Failed to fetch data: ${e.message}`));
  useEffect(() => {
    load();
    fetch(`${mainUrl}total_cust/`).then(r => r.json()).then(d => setCustomers(d.total_cust || 0)).catch(() => {});
  }, []);
  const send = async (path, init, msg) => {
    try {
      const res = await fetch(`${mainUrl}${path}`, { method: "POST", ...init });
      const data = await res.json();
      if (res.ok) { toast.success(msg || data.message); load(); } else toast.error(data.error || "Request failed");
    } catch { toast.error("Network error"); }
  };
  const edit = (id, f, v) => setRows(rs => rs.map(r => (r.id === id ? { ...r, [f]: v === "" ? null : Number(v) } : r)));
  const save = r => {
    if (r.cur_user != null && r.cur_sup != null && (r.cur_user < r.prev_user || r.cur_sup < r.prev_sup)) return toast.info("Current readings must be greater than previous");
    send("submit_new_reading/", { headers: JSON_H, body: JSON.stringify({ user_id: r.user_id || r.id, cur_user: r.cur_user, cur_sup: r.cur_sup }) }, "Reading saved");
  };
  const upload = () => {
    if (!file) return toast.error("Please select a file first");
    const fd = new FormData();
    fd.append("file", file);
    send("upload_readings_excel/", { body: fd });
  };
  const shift = () => window.confirm("Move current readings to previous and clear current readings?") && send("shift_readings/", {});
  const status = r => {
    if (r.cur_user == null || r.cur_sup == null) return "No Reading";
    if (!r.cur_user) return "Invalid";
    const s = r.cur_sup - r.prev_sup;
    return s && Math.abs(((s - (r.cur_user - r.prev_user)) / s) * 100) <= 5 ? "Good" : "Leakage";
  };
  const num = (r, f) => <input type="number" className={styles.wateruserInput} value={r[f] ?? ""} onChange={e => edit(r.id, f, e.target.value)} />;
  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Water Readings</h2>
      <p>Total Customers Registered for billing : <strong>{customers}</strong></p>
      <div className={styles.dataUpload}>
        <button onClick={() => window.open(`${mainUrl}download_readings_template/`)}>Download Excel Sheet</button>
        <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
        <button onClick={upload}>Submit Data File</button>
        <button onClick={shift}>Shift Readings</button>
      </div>
      <table className={styles.readingsTable}>
        <thead>
          <tr>
            <th colSpan={1}>User Data</th>
            <th colSpan={2}>{rows[0]?.prev_date}</th>
            <th colSpan={2}>{rows[0]?.cur_date}</th>
            <th colSpan={3}>Action</th>
          </tr>
          <tr>{["Name", "User", "Sup", "User", "Sup", "Rate", "Status", "Save"].map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.prev_user ?? 0}</td><td>{r.prev_sup ?? 0}</td>
              <td>{num(r, "cur_user")}</td><td>{num(r, "cur_sup")}</td>
              <td>{r.rate}</td><td>{status(r)}</td>
              <td><button className={styles.saveButton} onClick={() => save(r)}>Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Readings;