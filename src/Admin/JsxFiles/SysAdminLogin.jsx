
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaEye, FaEyeSlash, FaLock, FaUserShield } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import styles from '../CssFiles/AdminLogin.module.css';
import mainUrl from '../../api';

function SysAdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Please enter your username and password.');
            return;
        }

        if (!captchaVerified) {
            setError('Please confirm that you are not a robot.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${mainUrl}login_user/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/MgtDashboard');
            } else {
                setError(
                    data.error ||
                    (response.ok
                        ? 'Login succeeded, but no authentication token was returned.'
                        : 'Invalid login credentials.')
                );
            }
        } catch (err) {
            setError('Unable to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.backgroundGlow} />

            <main className={styles.loginContainer}>
                <section className={styles.brandPanel}>
                    <div className={styles.brandContent}>
                        <div className={styles.brandIcon}>
                            <MdAdminPanelSettings />
                        </div>

                        <span className={styles.brandLabel}>
                            SYSTEM CONTROL CENTER
                        </span>

                        <h1>
                            Manage everything.
                            <br />
                            <span>Securely.</span>
                        </h1>

                        <p>
                            Access your administrative workspace to manage
                            users, monitor activity, and keep your system
                            running smoothly.
                        </p>

                        <div className={styles.securityCard}>
                            <div className={styles.securityIcon}>
                                <FaShieldAlt />
                            </div>
                            <div>
                                <strong>Protected access</strong>
                                <span>Authorized administrators only</span>
                            </div>
                            <span className={styles.statusDot} />
                        </div>
                    </div>

                    <div className={styles.brandFooter}>
                        <span>ADMINISTRATION PORTAL</span>
                        <span>SECURE ACCESS</span>
                    </div>
                </section>

                <section className={styles.formPanel}>
                    <div className={styles.formHeader}>
                        <div className={styles.mobileBrandIcon}>
                            <MdAdminPanelSettings />
                        </div>

                        <div className={styles.welcomeLabel}>
                            <span className={styles.headerDot} />
                            SYSTEM ADMINISTRATOR
                        </div>

                        <h2>Welcome back</h2>
                        <p>Sign in to access your control panel.</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <div className={styles.inputWrapper}>
                                <FaUserShield className={styles.inputIcon} />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    disabled={loading}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <label className={styles.captcha}>
                            <input
                                type="checkbox"
                                checked={captchaVerified}
                                onChange={(e) => setCaptchaVerified(e.target.checked)}
                                disabled={loading}
                            />
                            <span className={styles.customCheckbox} />
                            <span className={styles.captchaText}>
                                I'm not a robot
                                <small>Security verification</small>
                            </span>
                            <FaShieldAlt className={styles.captchaIcon} />
                        </label>

                        {error && (
                            <div className={styles.errorMessage} role="alert">
                                <span>!</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign in securely
                                    <span className={styles.buttonArrow}>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.formFooter}>
                        <FaShieldAlt />
                        <span>Your session is protected by secure authentication.</span>
                    </div>
                </section>
            </main>

            <footer className={styles.pageFooter}>
                <span>© {new Date().getFullYear()} System Administration</span>
                <span>Authorized access only</span>
            </footer>
        </div>
    );
}

export default SysAdminLogin;
