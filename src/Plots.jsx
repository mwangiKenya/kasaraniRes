import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import styles from "./Plots.module.css";



function PlotMgt( {showError, RegPlots} ) {
    
    
    return(
        <>
            <div>
                <h1 className={styles.Guide}> Plot Management </h1>
                <table>
                    <tr>
                        <th> Task </th>
                        <th> Description </th>
                        <th> Action </th>
                    </tr>
                    <tr>
                        <td> View Plots </td>
                        <td>
                            See a list of all plots and their details. 
                        </td>
                        <td>
                            <button className={styles.buttona}
                             onClick={showError}> Continue </button>
                        </td>
                    </tr>
                    <tr>
                        <td> Register new plots/ houses </td>
                        <td> Add new plots/houses into the system </td>
                        <td> <button className={styles.buttona}
                           onClick={RegPlots}> Continue </button></td>
                    </tr>
                    <tr>
                        <td>Update plot information </td>
                        <td> Change details, eg. rent, availability </td>
                        <td><button className={styles.buttona}
                           onClick={RegPlots}> Continue </button></td>
                    </tr>
                </table>
            </div>
        </>
    );
}

function TenantMgt( {showError} ) {
    return(
        <>
            <div>
                <h1 className={styles.Guide}> Tenant Management </h1>
                <table>
                    <tr>
                        <th> Task </th>
                        <th> Description </th>
                        <th> Action </th>
                    </tr>
                    <tr>
                        <td> Add tenant </td>
                        <td> Record new tenant details to the system </td>
                        <td> <button className={styles.buttona}
                           onClick={showError}> Continue </button></td>
                    </tr>
                    <tr>
                        <td>Assign tenant to plots </td>
                        <td>Link tenants to specific plots they occupy </td>
                        <td> <button className={styles.buttona}
                           onClick={showError}> Continue </button></td>
                    </tr>
                    <tr>
                        <td> Track tenant history </td>
                        <td> See past & current tenants for each plot </td>
                        <td> <button className={styles.buttona}
                            onClick={showError}> Continue </button></td>
                    </tr>
                </table>
            </div>
        </>
    );
}

function Alerts( {showError} ) {
    return(
        <>
            <div>
                <h1 className={styles.Guide}> Notifications, Alters, and Analytics </h1>
                <table>
                    <tr>
                        <th> Task </th>
                        <th> Description </th>
                        <th> Role </th>
                    </tr>
                    <tr>
                        <td>Payments reminders </td>
                        <td> Notify tenants when rent is due </td>
                        <td> <button className={styles.buttona}
                           onClick={showError}> Continue </button> </td>
                    </tr>
                    <tr>
                        <td>Maitenance reminders </td>
                        <td>Shedule maitenance tasks for plots </td>
                        <td > <button className={styles.buttona}
                           onClick={showError}> Continue </button> </td>
                    </tr>
                    <tr>
                        <td> Revenue report </td>
                        <td> Track income from rent over time </td>
                        <td> <button className={styles.buttona}
                            onClick={showError}> Continue </button></td>
                    </tr>
                </table>
            </div>
        </>
    );
}

function Finances( {showError} ) {
    
    return(
        <>
            <div className={styles.FinancesDiv}>
                <h2> Update finances for decision making; </h2>
                <p> Record expenses eg; electricity biil, cleaning, etc. and 
                    incomes for decision making. 
                </p>
                
            </div>
        </>
    );
}

function Plots() {
    const navigate = useNavigate();

    //Allow navigation to the error page
    const showError = (e) => {
        navigate("/ErrorPage");
    }
    const RegPlots = (e) => {
        navigate("/RegPlots")
    }
    return(
        <>
           <PlotMgt showError = {showError} RegPlots={RegPlots}/>
           <TenantMgt showError = {showError}/>
           <Alerts showError = {showError}/>
           <hr/>
           <Finances showError = {showError}/>
           <hr/>
           
        </>
    );
}

export default Plots;