import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Workers() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://python-back-2.onrender.com/api/users_login/", {
      //const response = await fetch("http://127.0.0.1:8000/api/users_login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save data
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // ✅ Role-based navigation
        const routes = {
          reader: "/ReaderDashboard",
          billing: "/BillingDashboard",
          //admin: "/AdminDashboard"
        };

        navigate(routes[data.role] || "/");

      } else {
        setError(data.error || "Login failed");
      }

    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login To Continue</h2>

        {error && <p className="error">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Workers;