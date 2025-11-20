import { useState } from "react";
import Footer from "./Footer";
import styles from "./RegPlots.module.css";
import { toast } from "react-toastify";
function RegPlots() {
    const [reg, setReg] = useState({
        code: "", Plot: "", status: "", tenant: "", phone: "", rent: ""
    });
    //Handle the input change
    const handleChange = (e) =>{
        setReg({...reg, [e.target.name] : [e.target.value]});
    }
    //Handle submit
    const handleSubmit = (e) =>{
        e.preventDefault();
        if(reg.code === "" || reg.Plot === "" || reg.status === "" || reg.tenant === "" || reg.phone === "" || reg.rent === ""){
            alert("Please fill in all details to save");
            return
        }
        else{
            toast.success("Data saved successifully");
            setReg({
                code: "", Plot: "", status: "", tenant: "", phone: "", rent: ""
            });
        }
    }
    return(
        <>
            <div className={styles.RegPlotsDiv}>
                <h1> Plots registration & Update  </h1>
                <div className={styles.RegPlotsDivForm}>
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <input type="text" placeholder="House Code eg. G02"
                          className={styles.RegPlotsInputs}
                          value={reg.code} name="code" onChange={handleChange}/>
                        <select className={styles.RegPlotsInputs}
                          value={reg.Plot} name="Plot" onChange={handleChange}>
                            <option> --Select plot-- </option>
                            <option> Plot A </option>
                            <option> Plot B </option>
                        </select>
                        <select className={styles.RegPlotsInputs}
                           value={reg.status} name="status" onChange={handleChange}>
                            <option> --Select status-- </option>
                            <option> Occupied </option>
                            <option> Vacant </option>
                        </select>
                        <input type="text" placeholder="Tenant name"
                           className={styles.RegPlotsInputs}
                             value={reg.tenant} name="tenant" onChange={handleChange}/>
                        <input type="tel" placeholder="Phone Number"
                            className={styles.RegPlotsInputs}
                             value={reg.phone} name="phone" onChange={handleChange}/>
                        <input type="number" placeholder="Rent"
                           className={styles.RegPlotsInputs}
                             value={reg.rent} name="rent" onChange={handleChange}/>
                        <input type="submit" value="Save" className={styles.RegPlotsSubmit}/>                    </form>
                </div>
            </div>
            
        </>
    );
}

export default RegPlots;