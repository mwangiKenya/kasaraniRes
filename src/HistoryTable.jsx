import React, { useEffect, useState } from "react";
import styles from "./HistoryTable.module.css";

const HistoryTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/hist_data/")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.loader}>Loading history...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Change History</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Date Changed</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <span className={styles.badge}>{item.field}</span>
                </td>
                <td className={styles.old}>{item.old_val}</td>
                <td className={styles.new}>{item.new_val}</td>
                <td>{item.changes_on}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;