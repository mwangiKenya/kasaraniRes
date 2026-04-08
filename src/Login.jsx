import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ CAPTCHA STATES
  const [selectedImages, setSelectedImages] = useState([]);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // ✅ CAPTCHA DATA (replace with your own images in /public/images/)
  const captchaImages = [
  { id: 1, src: new URL("/images/car.jpeg", import.meta.url).href, correct: true },
  { id: 2, src: new URL("/images/tree.jpeg", import.meta.url).href, correct: false },
  { id: 3, src: new URL("/images/tree.jpeg", import.meta.url).href, correct: false },
  { id: 4, src: new URL("/images/car.jpeg", import.meta.url).href, correct: true },
];

  // ✅ HANDLE IMAGE CLICK
  const toggleImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id)
        ? prev.filter((img) => img !== id)
        : [...prev, id]
    );
  };

  // ✅ VERIFY CAPTCHA
  const verifyCaptcha = () => {
    const correctIds = captchaImages
      .filter((img) => img.correct)
      .map((img) => img.id);

    const isCorrect =
      correctIds.length === selectedImages.length &&
      correctIds.every((id) => selectedImages.includes(id));

    if (isCorrect) {
      setCaptchaVerified(true);
      setError("");
    } else {
      setCaptchaVerified(false);
      setError("Captcha failed. Try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ BLOCK LOGIN IF CAPTCHA NOT VERIFIED
    if (!captchaVerified) {
      setError("Please complete the captcha");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://python-back-2.onrender.com/api/login_user/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/Dashboard");
      } else {
        setError(data.error || "Invalid login credentials");xj
      }
    } catch (err) {
      setError("Failed to login. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Admin Login</h2>

        {error && <p className="error">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        {/* ✅ CAPTCHA UI */}
        <div className="captcha-box" style={{ marginTop: "15px" }}>
        <p> Verify Login </p>
          <p>Select all images with <strong>cars</strong></p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {captchaImages.map((img) => (
              <img
                key={img.id}
                src={img.src}
                alt=""
                onClick={() => toggleImage(img.id)}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  border: selectedImages.includes(img.id)
                    ? "3px solid green"
                    : "2px solid #ccc",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={verifyCaptcha}
            style={{ marginTop: "10px" }}
            disabled={loading}
          >
            Verify
          </button>

          {captchaVerified && (
            <p style={{ color: "green", marginTop: "5px" }}>
              ✔ Verified
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;