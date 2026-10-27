import { useState } from "react";
import styles from "../CssFiles/Billings.module.css";

import Readings from '../../Readings/JsxFiles/Readings';
import Billings from "./Billings";
import Analytics from "../../General/JsxFiles/Analytics";
import Logs from "../../General/JsxFiles/Analytics";


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

export default BillingDashboard;
