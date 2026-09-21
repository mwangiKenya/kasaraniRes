import { useState } from "react";
import axios from "axios";
import styles from "./Dashboard.module.css";
import Readings from "./Readings";
import Billings from "./Billings";
import RegWaterUser from "./RegWaterUser";
import Users from "./Users";
import Analytics from "./Analytics";
import RegWorker from "./RegWorker";
import EmployeesList from "./EmployeesList";
import Sms from "./Sms";
import Reminder from "./Reminder";
import Payments from "./Payments";
import ReadingsHistory from "./ReadingsHistory";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api";
// const BACKEND_URL = "http://127.0.0.1:8000/api";

function Dashboard() {
    const [activeView, setActiveView] = useState("analytics");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Change password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [changingPassword, setChangingPassword] = useState(false);


    const renderContent = () => {
        switch (activeView) {
            case "analytics":
                return <Analytics />;

            case "readings":
                return <Readings />;

            case "billings":
                return <Billings />;

            case "register":
                return <RegWaterUser />;

            case "users":
                return <Users />;

            case "reminder":
                return <Reminder />;

            case "regw":
                return <RegWorker />;

            case "emp":
                return <EmployeesList />;

            case "hist":
                return <ReadingsHistory />;

            case "sms":
                return <Sms />;

            case "payments":
                return <Payments />;

            default:
                return <Analytics />;
        }
    };


    // ============================================================
    // OPEN CHANGE PASSWORD MODAL
    // ============================================================

    const openPasswordModal = () => {
        setCurrentPassword("");
        setNewPassword("");
        setShowPasswordModal(true);
    };


    // ============================================================
    // CLOSE CHANGE PASSWORD MODAL
    // ============================================================

    const closePasswordModal = () => {
        if (changingPassword) return;

        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
    };


    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword) {
            toast.info("Please enter your current password and new password.");
            return;
        }

        if (newPassword.length < 6) {
            toast.info("New password must be at least 6 characters.");
            return;
        }

        if (currentPassword === newPassword) {
            toast.info("New password must be different from your current password.");
            return;
        }

        // Get logged-in username
        const username = localStorage.getItem("username");

        if (!username) {
            toast.error("User session not found. Please login again.");
            return;
        }

        try {
            setChangingPassword(true);

            const response = await axios.post(
                `${BACKEND_URL}/change_password/`,
                {
                    username,
                    current_password: currentPassword,
                    new_password: newPassword,
                }
            );

            if (response.status === 200) {
                toast.success("Password changed successfully!");

                setCurrentPassword("");
                setNewPassword("");
                setShowPasswordModal(false);
            }

        } catch (error) {
            console.error("Password change error:", error);

            if (error.response) {
                toast.error(
                    error.response.data?.error ||
                    "Failed to change password."
                );
            } else {
                toast.error(
                    "Unable to connect to the server. Please try again."
                );
            }

        } finally {
            setChangingPassword(false);
        }
    };


    return (
        <div className={styles.dashboard}>

            {/* ============================================================
                SIDEBAR
            ============================================================ */}

            <aside
                className={`${styles.sidebar} ${
                    sidebarOpen ? "" : styles.sidebarCollapsed
                }`}
            >
                <h2 className={styles.logo}>Admin Dashboard</h2>

                <nav className={styles.nav}>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "analytics" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("analytics")}
                    >
                        Analytics
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "readings" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("readings")}
                    >
                        Readings
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "billings" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("billings")}
                    >
                        Billings
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "register" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("register")}
                    >
                        Register New Customer
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "users" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("users")}
                    >
                        Registered Customers
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "sms" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("sms")}
                    >
                        Send Billing sms
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "reminder" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("reminder")}
                    >
                        Reminder SMS
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "hist" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("hist")}
                    >
                        Readings History
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "payments" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("payments")}
                    >
                        Payments History
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "regw" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("regw")}
                    >
                        Register System Users
                    </button>

                    <button
                        className={`${styles.navItem} ${
                            activeView === "emp" ? styles.active : ""
                        }`}
                        onClick={() => setActiveView("emp")}
                    >
                        See System Users
                    </button>

                    {/* ====================================================
                        CHANGE PASSWORD
                    ==================================================== */}

                    <button
                        className={styles.navItem}
                        onClick={openPasswordModal}
                    >
                        Change Password
                    </button>

                </nav>
            </aside>


            {/* ============================================================
                TOGGLE BUTTON
            ============================================================ */}

            <button
                className={`${styles.toggleBtn} ${
                    sidebarOpen ? "" : styles.toggleBtnCollapsed
                }`}
                onClick={() => setSidebarOpen((prev) => !prev)}
                title={
                    sidebarOpen
                        ? "Hide sidebar"
                        : "Show sidebar"
                }
            >
                {sidebarOpen ? "‹" : "›"}
            </button>


            {/* ============================================================
                MAIN CONTENT
            ============================================================ */}

            <main
                className={`${styles.content} ${
                    sidebarOpen ? "" : styles.contentExpanded
                }`}
            >
                {renderContent()}
            </main>


            {/* ============================================================
                CHANGE PASSWORD MODAL
            ============================================================ */}

            {showPasswordModal && (
                <div
                    className={styles.passwordModalOverlay}
                    onClick={closePasswordModal}
                >
                    <div
                        className={styles.passwordModal}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className={styles.passwordModalHeader}>
                            <h2>Change Password</h2>

                            <button
                                type="button"
                                className={styles.closeModalButton}
                                onClick={closePasswordModal}
                                disabled={changingPassword}
                            >
                                ×
                            </button>
                        </div>


                        <p className={styles.passwordModalDescription}>
                            Enter your current password and choose a new password.
                        </p>


                        <form
                            onSubmit={handleChangePassword}
                            className={styles.passwordForm}
                        >

                            {/* Current password */}

                            <label>
                                Current Password
                            </label>

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="Enter current password"
                                disabled={changingPassword}
                                autoComplete="current-password"
                            />


                            {/* New password */}

                            <label>
                                New Password
                            </label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                placeholder="Enter new password"
                                disabled={changingPassword}
                                autoComplete="new-password"
                            />


                            {/* Buttons */}

                            <div className={styles.passwordModalActions}>

                                <button
                                    type="button"
                                    className={styles.cancelPasswordButton}
                                    onClick={closePasswordModal}
                                    disabled={changingPassword}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.changePasswordButton}
                                    disabled={changingPassword}
                                >
                                    {changingPassword
                                        ? "Changing..."
                                        : "Change Password"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;