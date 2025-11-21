import { useState } from "react";
import styles from "./Dashboard.module.css";

// Import your task components
import Readings from "./Readings";
import Finances from "./Finances";
import ErrorPage from "./ErrorPage";
import Plots from "./Plots";
import RegWaterUser from "./RegWaterUser";
import Footer from "./Footer";
import RegPlots from "./RegPlots";
import WaterReadings from "./WaterReadings";

function Dashboard() {
    const [activeTask, setActiveTask] = useState("Readings"); // Track which task is active

    return (
        <>
        <div className={styles.Container}>
            {/* Left Sidebar */}
            <div className={styles.Sidebar}>
                {/*<div className={styles.UserInfo}>
                    <p>KasaraniRes Ltd, Nairobi</p>
                </div>*/}

                <div className={styles.Tasks}>
                    <p className={styles.TasksTitle}>Select a task to proceed </p>
                    <button
                        className={activeTask === "Readings" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("Readings")}
                    >
                        Update Water Readings
                    </button>
                    <button
                        className={activeTask === "WaterReadings" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("WaterReadings")}
                    >
                        See water readings 
                    </button>
                    <button
                        className={activeTask === "Finances" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("Finances")}
                    >
                        Financial Dashboard
                    </button>
                    <button
                        className={activeTask === "ErrorPage" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("ErrorPage")}
                    >
                        Water Data
                    </button>
                    <button
                        className={activeTask === "Plots" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("Plots")}
                    >
                        Plot Management
                    </button>
                    <button
                        className={activeTask === "RegWaterUser" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("RegWaterUser")}
                    >
                        Register new user
                    </button>
                    <button
                        className={activeTask === "RegPlots" ? styles.ActiveTask : ""}
                        onClick={() => setActiveTask("RegPlots")}
                    >
                        Update new house 
                    </button>
                </div>
            </div>

            {/* Right Content Area */}
            <div className={styles.Content}>
                {activeTask === "" && (
                    <p className={styles.Placeholder}>
                        Please select a task from the left to begin.
                    </p>
                )}
                {activeTask === "Readings" && <Readings />}
                {activeTask === "Finances" && <Finances />}
                {activeTask === "ErrorPage" && <ErrorPage />}
                {activeTask === "Plots" && <Plots />}
                {activeTask === "RegWaterUser" && <RegWaterUser/>}
                {activeTask === "RegPlots" && <RegPlots/>}
                {activeTask === "WaterReadings" && <WaterReadings/>}
            </div>
        </div>
        <Footer/>
        </>
    );
}

export default Dashboard;
