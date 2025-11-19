import { useState } from "react";
import styles from "./Tenant.module.css";
import { toast } from "react-toastify";
function Tenant() {
    const [login, setLogin] = useState({tel: "", password: ""});

    const handleChange = (e) => {
        setLogin({...login, [e.target.name] : [e.target.value]});
    }

    //Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if(login.tel === "" || login.password === "") {
            toast.error("All fields are required");
            return;
        }
        else {
            toast.success("Invalid logins. try again");
        }
    }
    return(
        <>
            <div className={styles.TenantDiv}>
                <h2 className={styles.TenantHeader}> User Login </h2>
                <p className={styles.TenantPoint}> Login to continue </p>
                <form autoComplete="off" className={styles.TenantForm} onSubmit={handleSubmit}>
                    <input type="tel" placeholder="Phone Number" className={styles.TenantInput}
                     value={login.tel} name="tel" onChange={handleChange}/>
                    <input type="password" placeholder="Password" className={styles.TenantInput}
                     value={login.password} name="password" onChange={handleChange}/>
                    <a href="#"> Forgot password </a>
                    <input type="submit" value="Login"/>
                </form>
            </div>
        </>
    );
}

export default Tenant;