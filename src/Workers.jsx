import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Workers.module.css";

const LOGIN_URL = "https://python-back-2.onrender.com/api/users_login/";
//const LOGIN_URL = "http://127.0.0.1:8000/api/users_login/";

// Role-based navigation
const ROUTES = {
  reader: "/ReaderDashboard",
  billing: "/BillingDashboard",
  admin: "/Dashboard",
};

const REMEMBER_KEY = "rememberedUsername";

const readRememberedUsername = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch (err) {
    return "";
  }
};

// =========================================
// SMALL INLINE ICONS (no extra dependencies)
// =========================================
function Icon({ size = 20, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const DropIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3.2c3.3 4.1 6 7.2 6 10.4a6 6 0 1 1-12 0c0-3.2 2.7-6.3 6-10.4z" />
  </Icon>
);

const UserIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Icon>
);

const LockIcon = (props) => (
  <Icon {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
);

const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Icon>
);

const EyeOffIcon = (props) => (
  <Icon {...props}>
    <path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M4 4l16 16" />
  </Icon>
);

const ShieldIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3l7 2.8v5.6c0 4.4-2.9 7.9-7 9.6-4.1-1.7-7-5.2-7-9.6V5.8L12 3z" />
    <path d="M9 12l2.2 2.2L15.2 10" />
  </Icon>
);

const ReceiptIcon = (props) => (
  <Icon {...props}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </Icon>
);

const AlertIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5" />
    <path d="M12 16.2h.01" />
  </Icon>
);

const FEATURES = [
  {
    icon: <ShieldIcon size={20} />,
    title: "Role-based access",
    text: "Meter readers, billing staff and administrators each get their own workspace.",
  },
  {
    icon: <LockIcon size={20} />,
    title: "Encrypted connection",
    text: "Your credentials travel over a secure HTTPS connection.",
  },
  {
    icon: <ReceiptIcon size={20} />,
    title: "Accurate billing",
    text: "Readings flow straight into customer bills and SMS notices.",
  },
];

function Workers() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(readRememberedUsername);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => Boolean(readRememberedUsername()));
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Focus the first empty field on desktop only (avoids popping the keyboard on phones)
  useEffect(() => {
    try {
      const isDesktop =
        window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (!isDesktop) return;
      if (username) passwordRef.current?.focus();
      else usernameRef.current?.focus();
    } catch (err) {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The server can take a while to wake up - explain the wait instead of leaving people guessing
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleCapsLock = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // ignore double taps / Enter while a request is running

    setError("");

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Save data
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // Remember the username only (never the password)
        try {
          if (remember) localStorage.setItem(REMEMBER_KEY, username.trim());
          else localStorage.removeItem(REMEMBER_KEY);
        } catch (err) {
          /* ignore */
        }

        // Role-based navigation
        navigate(ROUTES[data.role] || "/");
      } else {
        setError(data.error || "Login failed. Check your details and try again.");
      }
    } catch (err) {
      setError("Unable to reach the server. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <div className={styles.page}>
      {/* ================= BRAND (compact header on phones) ================= */}
      <aside className={styles.brand}>
        <div className={styles.ripples} aria-hidden="true" />

        <div className={styles.brandTop}>
          <div className={styles.logoMark}>
            <DropIcon size={24} />
          </div>
          <div>
            <p className={styles.brandName}>Kamengo Agencies</p>
            <p className={styles.brandSub}>Water Billing Management System</p>
          </div>
        </div>

        <div className={styles.brandBody}>
          <p className={styles.headline}>Every reading, bill and payment, accounted for.</p>
          <p className={styles.lead}>
            Sign in to manage customers, meter readings, billing and reminders from one secure
            workspace.
          </p>

          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f.title} className={styles.feature}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>
                  <strong className={styles.featureTitle}>{f.title}</strong>
                  <span className={styles.featureText}>{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.brandFoot}>
          &copy; {new Date().getFullYear()} Kamengo Agencies. All rights reserved.
        </p>
      </aside>

      {/* ================= SIGN IN ================= */}
      <main className={styles.formSide}>
        <div className={styles.card}>
          <span className={styles.badge}>
            <LockIcon size={16} />
            Secure staff sign-in
          </span>

          <h1 className={styles.title}>Login To Continue</h1>
          <p className={styles.subtitle}>
            Enter your staff credentials to open the management system.
          </p>

          {hasError && (
            <div className={`${styles.notice} ${styles.error}`} role="alert" id="login-error">
              <AlertIcon size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form} aria-busy={loading}>
            <div className={styles.field}>
              <label htmlFor="workers-username" className={styles.label}>
                Username
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <UserIcon size={20} />
                </span>
                <input
                  id="workers-username"
                  ref={usernameRef}
                  type="text"
                  className={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "login-error" : undefined}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="workers-password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <LockIcon size={20} />
                </span>
                <input
                  id="workers-password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.inputPassword}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                  onBlur={() => setCapsLock(false)}
                  autoComplete="current-password"
                  disabled={loading}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "login-error" : undefined}
                  required
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>

              {capsLock && (
                <p className={styles.hint} role="status">
                  <AlertIcon size={16} />
                  Caps Lock is on
                </p>
              )}
            </div>

            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              Remember my username
            </label>

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {loading && slow && (
              <div className={`${styles.notice} ${styles.slow}`} role="status">
                <span>
                  Still working. The server may be waking up, which can take up to a minute.
                  Please keep this page open.
                </span>
              </div>
            )}
          </form>

          <p className={styles.help}>
            Forgot your password or can&apos;t sign in? Contact your system administrator.
          </p>
        </div>

        <p className={styles.legal}>
          Authorized personnel only. Access to this system is restricted to Kamengo Agencies staff.
        </p>
      </main>
    </div>
  );
}

export default Workers;