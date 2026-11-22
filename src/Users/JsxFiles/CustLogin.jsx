import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../CssFiles/Login.module.css";
import mainUrl from "../../api";

function CustLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${mainUrl}water_user_login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Include credentials so Django sets the session cookie
                credentials: "include", 
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to the route rendering Portal.jsx
                navigate("/Portal");
                localStorage.setItem("user_id", data.user_id);
            } else {
                setError(data.error || "Invalid email or password.");
            }
        } catch (err) {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h3 className={styles.title}>Login to Continue</h3>

                {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required
                />
                <input
                    type="submit"
                    value={loading ? "Logging in..." : "Login"}
                    disabled={loading}
                    className={styles.submitButton}
                />
            </form>
        </div>
    );
}

export default CustLogin;
