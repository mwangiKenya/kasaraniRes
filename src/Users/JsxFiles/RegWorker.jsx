import React, { useState } from "react";
import styles from "../CssFiles/RegWorker.module.css";
import { toast } from "react-toastify";
import { authFetch } from "../../api";
function RegWorker() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [reg_on, setReg_on] = useState("");
  const [status, setStatus] = useState("");
  const reset = () => {
    setUsername("");
    setPassword("");
    setRole("");
    setPhone("");
    setReg_on("");
    setStatus("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !role) {
      toast.info("All fields are required");
      return;
    }
    try {
      const response = await authFetch("register_user/", {
        method: "POST",
        body: JSON.stringify({ username, password, role, phone, reg_on, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "An error occurred. Please try again.");
        return;
      }
      toast.success("Employee registered successfully!");
      reset();
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Register New Employee</h2>
        <label className={styles.label}>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} placeholder="Enter username" />
        <label className={styles.label}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="Enter password" />
        <label className={styles.label}>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.select}>
          <option value="">--Select Role--</option>
          <option value="admin">admin</option>
          <option value="reader">reader</option>
          <option value="billing">billing</option>
        </select>
        <label className={styles.label}>Phone number</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={styles.input} placeholder="Enter phone number" />
        <label className={styles.label}>Reg Date</label>
        <input type="date" value={reg_on} onChange={(e) => setReg_on(e.target.value)} className={styles.input} />
        <label className={styles.label}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
          <option value="">--Select Status--</option>
          <option value="active">active</option>
          <option value="pending">pending</option>
          <option value="blocked">blocked</option>
        </select>
        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
}
export default RegWorker;