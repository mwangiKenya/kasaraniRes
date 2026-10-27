import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../CssFiles/Workers.module.css";
import mainUrl from "../../api";

const LOGIN_URL = `${mainUrl}users_login/`;

const ROUTES = {
  admin: "/Dashboard",
  reader: "/ReaderDashboard",
  billing: "/BillingDashboard",
};

function Workers() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        navigate(ROUTES[data.role] || "/");
      } else {
        setError(data.error || "Login failed. Check details.");
      }
    } catch (err) {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.formSide} style={{ marginTop: "60px" }}>
        <div className={styles.card}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Enter your login credentials to continue.</p>

          {error && (
            <div className={`${styles.notice} ${styles.error}`} role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form} aria-busy={loading}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={styles.input}
                  style={{ paddingLeft: "16px" }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                  style={{ paddingLeft: "16px" }}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? <div className={styles.spinner}></div> : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Workers;
