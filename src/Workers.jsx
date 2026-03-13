import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Workers() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    //const response = await fetch("http://127.0.0.1:8000/api/users_login/", {
    const response = await fetch("https://kasarani-1.onrender.com/api/users_login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      navigate("/Readings");
    } else {
      setError(data.error);
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
         {/*
        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="staff">reader</option>
          <option value="technician">Technician</option>
          <option value="accountant">Accountant</option>
        </select>
        */}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Workers;