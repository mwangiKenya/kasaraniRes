import { useState } from "react";
import styles from "./Dashboard.module.css";

import Readings from "./Readings";
import Billings from "./Billings";
import Analytics from "./Analytics";
import Logs from "./Logs";


function BillingDashboard() {
    const [activeView, setActiveView] = useState("readings");

    const renderContent = () => {
        switch (activeView) {
            case "readings":
                return <Readings />;
            case "billings":
                return <Billings />;
            case "analytics":
                return <Analytics/>
            case "logs":
                return <Logs/>
            default:
                return <Readings />;
        }
    };

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>Billing Officer Dashboard</h2>

                <nav className={styles.nav}>
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
                        className={`${styles.navItem} ${activeView === "analytics" ? styles.active : ""}`}
                        onClick={() => setActiveView("analytics")}
                    >
                        Analytics
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "logs" ? styles.active : ""}`}
                        onClick={() => setActiveView("logs")}
                    >
                        Logs
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

export default BillingDashboard;
