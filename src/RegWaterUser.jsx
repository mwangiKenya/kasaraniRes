import { useState } from "react";
import styles from "./WaterUser.module.css";
import { toast } from "react-toastify";
function RegWaterUser() {
    const [reg, setReg] = useState({
        name: "", email: "", phone: "", meter: ""
    });
    //Handle the input change.
    const handleChange = (e) => {
        setReg({...reg, [e.target.name] : [e.target.value]});
    };
    //Handle the submit of the form
    const handleSubmit = (e) => {
        e.preventDefault();
        if(reg.name === "" || reg.email === "" || reg.phone === "" || reg.meter === "") {
            toast.error("Please fill all the details to register user.");
            return;
        }
        else {
            toast.success(`${reg.name} has been registered successifully on the system.`);
            //Clear the form
            setReg({name: "", email: "", phone: "", meter: ""});
        }
    }
    return(
        <>
            <div className={styles.RegWaterUserDiv}>
                <h2> New user registration </h2>
                <form className={styles.RegWaterUserForm} onSubmit={handleSubmit}>
                    <input type="text" 
                     placeholder="Full name" value={reg.name} name="name"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="email" 
                     placeholder="Email Address" value={reg.email} name="email"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="tel" 
                     placeholder="Phone number" value={reg.phone} name="phone"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="number" 
                     placeholder="Metre reading eg. 0" value={reg.meter} name="meter"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="reset" value="Reset" className={styles.RegWaterUserAction}/>
                    <input type="submit" value="Register user"
                      className={styles.RegWaterUserAction}/>
                </form>
            </div>
        </>
    );
}

export default RegWaterUser;