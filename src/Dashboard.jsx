import { useState } from "react";
import styles from "./Dashboard.module.css";
import Readings from "./Readings";
import Billings from "./Billings";
import RegWaterUser from "./RegWaterUser";
import Users from "./Users";
import Analytics from "./Analytics";
import Logs from "./Logs";
import RegWorker from "./RegWorker";
import EmployeesList from "./EmployeesList";
import HistoryTable from "./HistoryTable";
import Sms from "./Sms";
import Reminder from "./Reminder";
import Payments from "./Payments";
import ReadingsHistory from "./ReadingsHistory";

function Dashboard() {
    const [activeView, setActiveView] = useState("analytics");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const renderContent = () => {
        switch (activeView) {
            case "analytics":
                return <Analytics/>
            case "readings":
                return <Readings />;
            case "billings":
                return <Billings />;
            case "register":
                return <RegWaterUser />;
            case "users":
                return <Users />;
            case "reminder":
                return <Reminder/>
            case "regw":
                return <RegWorker/>
            case "emp":
                return <EmployeesList/>
            case "hist":
                return <ReadingsHistory/>
            case "sms" :
                return <Sms/>
            case "payments" :
                return <Payments/>
            default:
                return <Analytics/>;
        }
    };

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
                <h2 className={styles.logo}>Admin Dashboard</h2>

                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeView === "analytics" ? styles.active : ""}`}
                        onClick={() => setActiveView("analytics")}
                    >
                        Analytics
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "readings" ? styles.active : ""}`}
                        onClick={() => setActiveView("readings")}
                    >
                        Readings
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "billings" ? styles.active : ""}`}
                        onClick={() => setActiveView("billings")}
                    >
                        Billings
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "register" ? styles.active : ""}`}
                        onClick={() => setActiveView("register")}
                    >
                        Register New Customer
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "users" ? styles.active : ""}`}
                        onClick={() => setActiveView("users")}
                    >
                        Registered Customers
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "sms" ? styles.active : ""}`}
                        onClick={() => setActiveView("sms")}
                    >
                        Send Billing sms
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "reminder" ? styles.active : ""}`}
                        onClick={() => setActiveView("reminder")}
                    >
                        Reminder SMS
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "hist" ? styles.active : ""}`}
                        onClick={() => setActiveView("hist")}
                    >
                        Readings History
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "payments" ? styles.active : ""}`}
                        onClick={() => setActiveView("payments")}
                    >
                        Payments History
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "regw" ? styles.active : ""}`}
                        onClick={() => setActiveView("regw")}
                    >
                        Register employees
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "emp" ? styles.active : ""}`}
                        onClick={() => setActiveView("emp")}
                    >
                        See employees
                    </button>
                </nav>
            </aside>

            {/* Toggle Button */}
            <button
                className={`${styles.toggleBtn} ${sidebarOpen ? "" : styles.toggleBtnCollapsed}`}
                onClick={() => setSidebarOpen((prev) => !prev)}
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
                {sidebarOpen ? "‹" : "›"}
            </button>

            {/* Main Content */}
            <main className={`${styles.content} ${sidebarOpen ? "" : styles.contentExpanded}`}>
                {renderContent()}
            </main>
        </div>
    );
}

export default Dashboard;