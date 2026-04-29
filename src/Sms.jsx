import styles from "./Sms.module.css";
import { useState } from "react";

function Sms() {
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);

    const fetchCustomers = () => {
    //fetch("http://127.0.0.1:8000/api/water_users/")
    fetch("https://python-back-2.onrender.com/api/bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message));
    };
    
    return (
        <div className={styles.container}>
        <h1 className={styles.header1}>SMS Dashboard</h1>
        
        <div>
            <button className={styles.sendBtn}>Send SMS Now</button>
            
            <table className={styles.tableContainer}>
            <thead>
                <tr>
                <th colSpan="5" className={styles.tableHeaderMain}>
                    Customers Billing SMS
                </th>
                </tr>
                <tr className={styles.tableRowHeader}>
                <th>ID</th>
                <th>Name</th>
                <th>Sms</th>
                <th>Status</th>
                <th>Toggle</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((c) => (
                <tr className={styles.tableRow}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>Your invoice is ready...</td>
                <td><span className={styles.statusBadge}>Sent</span></td>
                <td><input type="checkbox" /></td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
}

export default Sms;