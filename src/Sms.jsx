import styles from "./Sms.module.css";
import { useState, useEffect } from "react";

function Sms() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  // 👇 modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message));
  }, []);

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const formattedDueDate = dueDate.toLocaleDateString();

  return (
    <div className={styles.container}>
      <h1 className={styles.header1}>SMS Dashboard</h1>

      <div>
        <button className={styles.sendBtn}>Send SMS Now</button>

        <table className={styles.tableContainer}>
          <thead>
            <tr>
              <th colSpan="6" className={styles.tableHeaderMain}>
                Customers Billing SMS
              </th>
            </tr>

            <tr className={styles.tableRowHeader}>
              <th>ID</th>
              <th>Name</th>
              <th>Sms</th>
              <th>Status</th>
              <th>Toggle</th>
              <th>View Sms</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr className={styles.tableRow} key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>Your invoice is ready...</td>
                <td>
                  <span className={styles.statusBadge}>Not sent</span>
                </td>
                <td>
                  <input type="checkbox" />
                </td>

                <td>
                  <button
                    className={styles.sendBtn}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowModal(true);
                    }}
                  >
                    View Sms structure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= MODAL ================= */}
        {showModal && selectedCustomer && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h2>SMS Structure Preview</h2>

              <p>
                Dear {selectedCustomer.name}, <br />
                Your water bill as at {new Date().toLocaleDateString()}<br/>
                are as follows: <br/>
                Units Used: {selectedCustomer.units_used} <br />
                Total Bill: {selectedCustomer.bill} <br />
                Pay by {formattedDueDate} <br/>
                <strong><p>Payment options:</p></strong><br/>
                Via Mpesa send money: 0723311564<br/>
                Buy goods, Kamengo agencies <br/>
                Till number: 544783<br/>
                Kamengo agencies: <br/>
                a/c No: xxxxxxxxxxxx<br/>
                Coop, TRM Branch <br/>
                Or, Kamengo agencies <br/>
                a/c No: xxxxxxxxxxxxx<br/>
                Equity garden city branch
              </p>


              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* ========================================= */}
      </div>
    </div>
  );
}

export default Sms;