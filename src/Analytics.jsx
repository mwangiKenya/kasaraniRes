import styles from "./Analytics.module.css";
import React, {useEffect, useState} from "react";


//ADD A FUNCTION TO ENABLE THE USER TO DOWNLOAD READINGS EXCEL
//THIS DOWNLOADS THE READINGS DATA FILE
// src/components/DownloadExcelButton.jsx
function DownloadExcelButton() {
  const downloadExcel = async () => {
    try {
      {/*const response = await fetch("http://localhost:8000/api/export-readings/",*/} 
      const response = await fetch("https://python-back-2.onrender.com/api/export-readings", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "readings.xlsx"; // File name
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button onClick={downloadExcel} className={styles.fileButton}>
      Download Readings Excel
    </button>
  );
}


//=============================================================
//=================================================================
function BillingsFile() {
  const downloadExcel = async () => {
    try {
      {/*const response = await fetch("http://localhost:8000/api/export-billings/", */}
      const response = await fetch("https://python-back-2.onrender.com/api/export-billings/", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "billings.xlsx"; // File name
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button onClick={downloadExcel} className={styles.fileButton}>
      Download Billings Excel
    </button>
  );
}


//=============================================================
//=================================================================
function CustomersFile() {
  const downloadExcel = async () => {
    try {
      {/*const response = await fetch("http://localhost:8000/api/export-users/", */}
      const response = await fetch("https://python-back-2.onrender.com/api/export-users/", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xlsx"; // File name
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button onClick={downloadExcel} className={styles.fileButton}>
      Download Customers Excel
    </button>
  );
}

function Analytics(){
    const [units_used, setUnitsUsed] = useState([]);
    const [bills, setBills] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [units, setUnits] = useState([]);
    const [error, setError] = useState();
    const [paid, setPaid] = useState([]);

    //FETCH THE DATA FROM THE DATABASE
    //THIS USEEFFECT READS THE TOTAL UNITS USED FROM THE READINGS TABLE
    useEffect(() => {
        //fetch("http://127.0.0.1:8000/api/total_units")
        fetch("https://python-back-2.onrender.com/api/total_units")
        .then((res) => {
            if (!res.ok) throw new error ("Network error")
                return res.json();
        })
        .then((data) => {
            setUnitsUsed(data.total_units);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, [])

    //THIS USE EFFECT READS THE TOTAL AMOUNT BILLED FROM THE BILLINGS TABLE
    useEffect(() => {
        //fetch("http://127.0.0.1:8000/api/total_bill")
        fetch("https://python-back-2.onrender.com/api/total_bill/")
        .then((res) => {
            if (!res.ok) throw new error ("Network error")
                return res.json();
        })
        .then((data) => {
            setBills(data.total_bill);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, [])

    //THIS USE EFFECT READS THE TOTAL AMOUNT PAID FROM THE BILLINGS TABLE
    useEffect(() => {
        //fetch("http://127.0.0.1:8000/api/total_paid")
        fetch("https://python-back-2.onrender.com/api/total_paid")
        .then((res) => {
            if (!res.ok) throw new error ("Network error")
                return res.json();
        })
        .then((data) => {
            setPaid(data.total_paid);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, [])


    //FETCH THE TOTAL NUMBER OF CUSTOMERS FROM THE DATABASE
    useEffect(() => {
        //fetch("http://127.0.0.1:8000/api/total_cust")
        fetch("https://python-back-2.onrender.com/api/total_cust")
        .then((res) => {
            if (!res.ok) throw new error ("Network error")
                return res.json();
        })
        .then((data) => {
            setCustomers(data.total_cust);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, [])

    //READ THE AVERAGE OF UNTIS USED AND DISPLAY THEM
    useEffect(() => {
        //fetch("http://127.0.0.1:8000/api/avg_units")
        fetch("https://python-back-2.onrender.com/api/avg_units")
        .then((res) => {
            if (!res.ok) throw new error ("Network error")
                return res.json();
        })
        .then((data) => {
            setUnits(data.avg_units);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, [])

    const bal = Number(bills) - Number(paid)


    return(
        <>
            <div className={styles.MainDiv}>
                <h1 className={styles.titleOne}> Water Sale Analytics </h1>
                <p className={styles.pointOne}> Data analysis for the previous and current data, for decision making. </p>
                <p className={styles.filesTitle}> Computed data </p>

                {/*THE DIV PARTS FOR ANALYTICS SUMMARY */}
                <div className={styles.SumDiv}>
                    <div className={styles.sumSubDiv}>
                        <h2> Customers 🙍‍♂️ </h2>
                        <p> 
                            <strong className={styles.myStrong}>{customers} Customers </strong>
                        </p>
                    </div>
                    <div className={styles.sumSubDiv}>
                        <h2> Units Used </h2>
                      <p> 
                           <strong className={styles.myStrong}> {units_used} Units </strong>
                      </p>
                    </div>
                    <div className={styles.sumSubDiv}>
                        <h2> Total Bills </h2>
                        <p> 
                             <strong className={styles.myStrong}>Ksh. {bills} </strong>    
                         </p>
                    </div>
                    <div className={styles.sumSubDiv}>
                        <h2> Total Paid </h2>
                        <p> 
                             <strong className={styles.myStrong}>Ksh. {paid} </strong>    
                         </p>
                    </div>
                    <div className={styles.sumSubDiv}>
                        <h2> Balance  </h2>
                        <p> 
                             <strong className={styles.myStrong}>Ksh. {bal} </strong>    
                         </p>
                    </div>
                    
                    <div className={styles.sumSubDiv}>
                        <h2> Average Units </h2>
                        <p> 
                             <strong className={styles.myStrong}> {units} Units </strong>
                        </p>
                        
                    </div>
                </div>
                
            </div>
            <div className={styles.buttonsDiv}>
                <p className={styles.filesTitle}> Excel files download </p>
                <DownloadExcelButton/>
                <BillingsFile/>
                <CustomersFile/>
            </div>
        </>
    );
}

export default Analytics;