import React, { useEffect, useState } from "react";
import styles from "./HistoryTable.module.css";

const HistoryTable = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = (query = "") => {
    fetch(`https://python-back-2.onrender.com/api/hist_data/?name=${query}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchData(value);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Change History</h2>

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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Date</th>
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