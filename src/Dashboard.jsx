import { useState } from "react";
import styles from "./Dashboard.module.css";

import Readings from "./Readings";
import Billings from "./Billings";
import RegWaterUser from "./RegWaterUser";
import Users from "./Users";
import Analytics from "./Analytics";
import SendBillingSMS from "./SendBillingSMS";
import Profile from './Profile';
import Logs from "./Logs";
import RegWorker from "./RegWorker";
import EmployeesList from "./EmployeesList";


function Sms() {
  return (
    <div>
      <SendBillingSMS />
    </div>
  );
}

function Dashboard() {
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
            case "logs":
                return <Logs/>
            case "regw":
                return <RegWorker/>
            case "emp":
                return <EmployeesList/>
            default:
                return <Readings />;
        }
    };

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>Admin Dashboard</h2>

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
                        className={`${styles.navItem} ${activeView === "analytics" ? styles.active : ""}`}
                        onClick={() => setActiveView("analytics")}
                    >
                        Analytics
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "profile" ? styles.active : ""}`}
                        onClick={() => setActiveView("profile")}
                    >
                        Profiles
                    </button>

                    <button
                        className={`${styles.navItem} ${activeView === "logs" ? styles.active : ""}`}
                        onClick={() => setActiveView("logs")}
                    >
                        Logs
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
                    <Sms/>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                {renderContent()}
            </main>
        </div>
    );
}

export default Dashboard;
