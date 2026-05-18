import styles from "./Analytics.module.css";
import React, { useEffect, useState } from "react";

function Analytics() {
  const [units_used, setUnitsUsed] = useState(0);
  const [bills, setBills] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [units, setUnits] = useState(0);
  const [paid, setPaid] = useState(0);
  const [error, setError] = useState("");
  const [bal, setBal] = useState(0);

  // ================= FETCH DATA =================

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_units/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setUnitsUsed(data.total_units || 0))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_bal/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setBal(data.total_bal || 0))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setBills(data.total_bill || 0))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_paid")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setPaid(data.total_paid || 0))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/total_cust/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data.total_cust || 0))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/avg_units")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setUnits(data.avg_units || 0))
      .catch((err) => setError(err.message));
  }, []);

  //Get the total cost to be paid (bill + bal)
  const total = Number(bills) + Number(bal);

  // ================= DERIVED METRICS =================

  const balance = total - paid;
  const efficiency = bills > 0 ? ((paid / total) * 100).toFixed(1) : 0;
  const avgBillPerCustomer =
    customers > 0 ? (bills / customers).toFixed(2) : 0;
  const avgPaidPerCustomer =
    customers > 0 ? (paid / customers).toFixed(2) : 0;
  const unpaid = balance;

  // ================= LOCAL TREND =================

  useEffect(() => {
    localStorage.setItem("prevBills", bills);
  }, [bills]);

  const prevBills = Number(localStorage.getItem("prevBills")) || 0;
  const billChange = bills - prevBills;

  // ================= INSIGHTS =================

  const getInsight = () => {
    if (efficiency < 50) return "⚠️ Poor collection rate";
    if (efficiency < 80) return "⚠️ Moderate collection";
    return "✅ Good collection performance";
  };

  // ================= ALERTS =================

  const alerts = [];
  if (balance > 10000) alerts.push("High unpaid balance!");
  if (efficiency < 60) alerts.push("Low collection rate!");
  if (customers === 0) alerts.push("No customers found!");

  // ================= UI =================

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Water Sales Analytics</h1>
      <p className={styles.subtitle}>
        Smart insights for monitoring system performance
      </p>

      {error && <p className={styles.error}>⚠️ {error}</p>}

      {/* KPI SECTION */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Customers</h3>
          <p>{customers}</p>
        </div>

        <div className={styles.card}>
          <h3>Units Used</h3>
          <p>{units_used}</p>
        </div>

        <div className={styles.card}>
          <h3>Current Bills</h3>
          <p>Ksh {bills}</p>
        </div>

        <div className={styles.card}>
          <h3>Prev Bal</h3>
          <p>Ksh {bal}</p>
        </div>

        <div className={styles.card}>
          <h3>Total Amount</h3>
          <p>Ksh {total}</p>
        </div>

        <div className={styles.card}>
          <h3>Total Paid</h3>
          <p className={styles.green}>Ksh {paid}</p>
        </div>

        <div className={styles.card}>
          <h3>Balance</h3>
          <p className={balance > 0 ? styles.red : styles.green}>
            Ksh {balance}
          </p>
        </div>

        <div className={styles.card}>
          <h3>Average Units</h3>
          <p>{units}</p>
        </div>
      </div>

      {/* FINANCIAL INSIGHTS */}
      <div className={styles.section}>
        <h2>Financial Insights</h2>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Collection Efficiency</h3>
            <p>{efficiency}%</p>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${efficiency}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Avg Bill / Customer</h3>
            <p>Ksh {avgBillPerCustomer}</p>
          </div>

          <div className={styles.card}>
            <h3>Avg Payment / Customer</h3>
            <p>Ksh {avgPaidPerCustomer}</p>
          </div>

          {/*<div className={styles.card}>
            <h3>Unpaid Revenue</h3>
            <p className={styles.red}>Ksh {unpaid}</p>
          </div>*/}
        </div>
      </div>

      {/* INSIGHT MESSAGE */}
      <div className={styles.insightBox}>
        <h3>System Insight</h3>
        <h4>Financial insight</h4>
        <p>{getInsight()}</p>
        <h4>Data insight</h4>
        <p>
          The system is currently optimizing service delivery for <strong>{customers}</strong> customers, 
          supported by a dedicated team of <strong>X</strong> personnel.
        </p>
      </div>

      {/* TREND */}
      <div className={styles.section}>
        <h2>Trend Indicator</h2>
        <p>
          Bills Change:{" "}
          <span className={billChange >= 0 ? styles.green : styles.red}>
            {billChange >= 0 ? "📈 +" : "📉 "}
            {billChange}
          </span>
        </p>
      </div>
     
      {/* ALERTS 
      <div className={styles.section}>
        <h2>Alerts</h2>
        {alerts.length === 0 ? (
          <p> No issues detected</p>
        ) : (
          alerts.map((a, i) => (
            <p key={i} className={styles.alert}>
               {a}
            </p>
          ))
        )}
      </div>*/}
    </div>
  );
}

export default Analytics;