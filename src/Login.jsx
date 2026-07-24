import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

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
        setError(data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Failed to login. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h2 className={styles.title}>Admin Login</h2>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        {/* ✅ CAPTCHA UI */}
        <div className={styles.captchaBox}>
          <p className={styles.captchaTitle}>Verify Login</p>
          <p className={styles.captchaSubtitle}>
            Select all images with <strong>cars</strong>
          </p>

          <div className={styles.captchaGrid}>
            {captchaImages.map((img) => (
              <img
                key={img.id}
                src={img.src}
                alt=""
                onClick={() => toggleImage(img.id)}
                className={`${styles.captchaImage} ${
                  selectedImages.includes(img.id) ? styles.captchaImageSelected : ""
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={verifyCaptcha}
            className={styles.verifyButton}
            disabled={loading}
          >
            Verify
          </button>

          {captchaVerified && (
            <p className={styles.captchaVerified}>✔ Verified</p>
          )}
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <>
              <span className={styles.spinner}></span> Logging in...
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