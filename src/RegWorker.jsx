import React, { useState } from "react";
import axios from "axios";
import styles from "./RegWorker.module.css";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api"; 
//const BACKEND_URL = "http://127.0.0.1:8000/api";

function RegWorker() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // default role

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !role) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/register_user/`, {
        username,
        password,
        role,
      });

      if (response.status === 201) {
        toast.success("Employee registered successfully!");
        setUsername("");
        setPassword("");
        setRole("employee");
      } else {
        toast.error("Failed to register employee");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Register New Employee</h2>

        <label className={styles.label}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          placeholder="Enter username"
        />

        <label className={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="Enter password"
        />

        <label className={styles.label}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={styles.select}
        >
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="viewer">Viewer</option>
        </select>

        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
}

export default RegWorker;