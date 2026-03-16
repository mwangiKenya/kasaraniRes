import { useState } from "react";
import styles from "./Dashboard.module.css";

import Readings from "./Readings";
import Billings from "./Billings";
import RegWaterUser from "./RegWaterUser";
import Users from "./Users";
import Analytics from "./Analytics";
import SendBillingSMS from "./SendBillingSMS";
import Profile from './Profile';


function Sms() {
  return (
    <div>
      <SendBillingSMS />
    </div>
  );
}

function ReaderDashboard() {
    const [activeView, setActiveView] = useState("readings");

    const renderContent = () => {
        switch (activeView) {
            case "readings":
                return <Readings />;
            case "billings":
                return <Billings />;
            case "register":
                return <RegWaterUser />;
            case "users":
                return <Users />;
            case "analytics":
                return <Analytics/>
            case "profile":
                return <Profile/>
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

                    {/*<button
                        className={`${styles.navItem} ${activeView === "billings" ? styles.active : ""}`}
                        onClick={() => setActiveView("billings")}
                    >
                        Billings
                    </button>*/}

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

                    {/*<button
                        className={`${styles.navItem} ${activeView === "analytics" ? styles.active : ""}`}
                        onClick={() => setActiveView("analytics")}
                    >
                        Analytics
                    </button>*/}

                    <button
                        className={`${styles.navItem} ${activeView === "profile" ? styles.active : ""}`}
                        onClick={() => setActiveView("profile")}
                    >
                        Profiles
                    </button>
                    {/*<Sms/>*/}
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
