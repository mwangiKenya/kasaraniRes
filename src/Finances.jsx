
import { toast } from "react-toastify";
import styles from "./Finances.module.css";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Expenses() {
    const [expense, setExpense] = useState({
        date: "", month: "", period: "", amount: "", comment: ""
    });
    //Handle the input change
    const handlechange = (e) => {
        setExpense({...expense, [e.target.name] : e.target.value});
    }
    const savee = (e) =>{
        e.preventDefault();
        if(expense.date === "" || expense.month === "" || expense.period === "" || expense.amount === "" || expense.comment === "") {
            toast.error("Please fill all fields to save data.");
            return;
        }
        else {
            toast.success("Expense data saved successifully.");
        }
    }
    return (
        <>
            <div className={styles.ExpensesDiv}>
                <h2> Record Expense </h2>

                <form className={styles.ExpensesForm} onSubmit={savee}>
                    <label>Expense Date</label>
                    <input type="date" className={styles.InputField}
                      value={expense.date} name="date" onChange={handlechange}/>

                    <label>Month</label>
                    <select className={styles.InputField}
                    value={expense.month} name="month" onChange={handlechange}>
                        <option value="">Select month</option>
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                        <option>April</option>
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                        <option>August</option>
                        <option>September</option>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>

                    <label>Period (Quarter)</label>
                    <select className={styles.InputField}
                       value={expense.period} name="period" onChange={handlechange}>
                        <option value="">Select period</option>
                        <option>Q1 (Jan – Mar)</option>
                        <option>Q2 (Apr – Jun)</option>
                        <option>Q3 (Jul – Sep)</option>
                        <option>Q4 (Oct – Dec)</option>
                    </select>

                    <label>Expense Amount</label>
                    <input type="number" placeholder="Enter amount" className={styles.InputField}
                      value={expense.amount} name="amount" onChange={handlechange}/>

                    <label>Comment</label>
                    <select className={styles.InputField}
                      value={expense.comment} name="comment" onChange={handlechange}>
                        <option value="">Select comment type</option>
                        <option>Planned</option>
                        <option>Emergency</option>
                        <option>Maintenance</option>
                        <option>Operational</option>
                    </select>

                    <button type="submit" className={styles.SaveButton}> Save Expense </button>
                </form>
            </div>
        </>
    );
}




function Income() {
    const [income, setIncome] = useState({
        datei: "", monthi: "", periodi: "", amounti: "", commenti: ""
    });
    //Handle the change
    const handlechangeI = (e) => {
        setIncome({...income, [e.target.name] : e.target.value});
    }
    const savei = (e) =>{
        e.preventDefault();
        if(income.datei === "" || income.monthi === "" || income.periodi === "" || income.amounti === "" || income.commenti === ""){
            toast.error("Fill all the felds to save data.");
            return;
        }
        else {
            toast.success("Income data saved successifully.");
        }
    }
    return (
        <div className={styles.FormContainer}>
            <h2 className={styles.FormTitle}>Record Income</h2>

            <form className={styles.FormBox} onSubmit={savei}>

                {/* Income Date */}
                <div className={styles.FormGroup}>
                    <label className={styles.FormLabel}>Income Date</label>
                    <input type="date" className={styles.FormInput}
                     value={income.datei} name="datei" onChange={handlechangeI}/>
                </div>

                {/* Month */}
                <div className={styles.FormGroup}>
                    <label className={styles.FormLabel}>Month</label>
                    <select className={styles.FormInput}
                      value={income.monthi} name="monthi" onChange={handlechangeI}>
                        <option> --Select month-- </option>
                        <option>January</option><option>February</option>
                        <option>March</option><option>April</option>
                        <option>May</option><option>June</option>
                        <option>July</option><option>August</option>
                        <option>September</option><option>October</option>
                        <option>November</option><option>December</option>
                    </select>
                </div>

                {/* Period — 4 periods of 3 months */}
                <div className={styles.FormGroup}>
                    <label className={styles.FormLabel}>Period</label>
                    <select className={styles.FormInput}
                     value={income.periodi} name="periodi" onChange={handlechangeI}>
                        <option> --Select period-- </option>
                        <option>Period 1 (Jan – Mar)</option>
                        <option>Period 2 (Apr – Jun)</option>
                        <option>Period 3 (Jul – Sep)</option>
                        <option>Period 4 (Oct – Dec)</option>
                    </select>
                </div>

                {/* Income */}
                <div className={styles.FormGroup}>
                    <label className={styles.FormLabel}>Income Amount</label>
                    <input type="number" className={styles.FormInput} placeholder="Enter amount"
                      value={income.amounti} name="amounti" onChange={handlechangeI}/>
                </div>

                {/* Comment */}
                <div className={styles.FormGroup}>
                    <label className={styles.FormLabel}>Comment</label>
                    <select className={styles.FormInput}
                      value={income.commenti} name="commenti" onChange={handlechangeI}>
                        <option> --Select Comment-- </option>
                        <option>Expected</option>
                        <option>Bonus</option>
                        <option>Late Payment</option>
                        <option>Other</option>
                    </select>
                </div>

                {/* Save Button */}
                <button className={styles.FormButton}>Save Income</button>
            </form>
            
        </div>
    );
}


function Finances() {
    const navigate = useNavigate();
    //Show ErrorPage
    const Continue = (e) => {
        navigate("/ErrorPage");
    }
    return(
        <>
            <Expenses/>
            <Income/>
            <div style={{textAlign: "center", marginBottom: "30px"}}>
                <button className={styles.FormButton}
                  onClick={Continue}> See graphs and Analytics </button>
            </div>
            
        </>
    );
}

export default Finances;