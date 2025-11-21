import { useState } from "react";
import styles from "./WaterUser.module.css";
import { toast } from "react-toastify";
function RegWaterUser() {
    const [reg, setReg] = useState({
        name: "", phone: "", meter: "", userr: ""
    });
    //Handle the input change.
    const handleChange = (e) => {
        setReg({...reg, [e.target.name] : e.target.value});
    };
    //Handle the submit of the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (reg.name === "" || reg.phone === "" || reg.meter === "" || reg.userr === "") {
            toast.error("Please fill all the details to register user.");
            return;
        }

        try {
            const res = await fetch("https://kasarani.onrender.com/water-reg", {
                method : "POST",
                headers : {"content-type" : "application/json"},
                body : JSON.stringify(reg),
            });

            //If the data is sent successifully
            if(res.ok) {
                toast.success(`${reg.name} has been registered successifully on the system.`);
                //Reset the form
                setReg({name: "",  phone: "", meter: "", userr: ""});
            }
            else {
                toast.error("Failed. Check user details and try again");
            }
        }
        catch(error) {
            console.error("Failed to send data, ", error);
            alert("Something went wrong.");
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
                    {/*<input type="email" 
                     placeholder="Email Address" value={reg.email} name="email"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/> */}
                    <input type="tel" 
                     placeholder="Phone number" value={reg.phone} name="phone"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="number" 
                     placeholder="Supplier reading" value={reg.meter} name="meter"
                     onChange={handleChange}
                      className={styles.RegWaterUserInput}/>
                    <input type="number" placeholder="User reading"
                      className={styles.RegWaterUserInput}
                       value={reg.userr} name="userr" onChange={handleChange}/>
                    <input type="reset" value="Reset" className={styles.RegWaterUserAction}/>
                    <input type="submit" value="Register user"
                      className={styles.RegWaterUserAction}/>
                </form>
            </div>
        </>
    );
}

export default RegWaterUser;