import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api"; // change if needed

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/logs/`); // make sure your endpoint exists
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error(`Failed to fetch logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Logs History</h2>
      {loading ? (
        <div className={styles.loading}>Loading logs...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reading ID</th>
                <th>Field Changed</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Changed At</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className={styles.row}>
                    <td>{log.id}</td>
                    <td>{log.reading}</td>
                    <td>{log.field_changed}</td>
                    <td>{log.old_val}</td>
                    <td>{log.new_val}</td>
                    <td>{new Date(log.changed_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Logs;