import { useState } from "react";
import styles from "./Dashboard.module.css";

import Readings from "./Readings";
import RegWaterUser from "./RegWaterUser";
import Users from "./Users";

function ReaderDashboard() {
    const [activeView, setActiveView] = useState("readings");

    const renderContent = () => {
        switch (activeView) {
            case "readings":
                return <Readings />;
            case "register":
                return <RegWaterUser />;
            case "users":
                return <Users />;
            default:
                return <Readings />;
        }
    };

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>Water reader Dashboard</h2>

                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeView === "readings" ? styles.active : ""}`}
                        onClick={() => setActiveView("readings")}
                    >
                        Readings
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
                    <button>
                        Request access to another page
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                {renderContent()}
            </main>
        </div>
    );
}

export default ReaderDashboard;
