import { useState } from "react";
import styles from "./SignIn.module.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
function SignIn() {
    const navigate = useNavigate();

    const [login, setLogin] = useState({email: "", password: ""});

    const handleChange = (e) => {
        setLogin({...login, [e.target.name] : e.target.value});
    }

    const checkLogin = (e) => {
        e.preventDefault();
        if(login.email === "" || login.password === "") {
            toast.error("Please fill out all detail to continue");
            return;
        }
        else{
        toast.success(`You are logged in as: ${login.email}`);
        navigate("/Dashboard");
        }
    }
    return(
        <>
            <div className={styles.SignInDiv}>
                <form autoComplete="off" onSubmit={checkLogin}>
                    <p> Login to continue </p>
                    <input type="email"  placeholder="Email Address"
                      className={styles.SignInInputs}
                       value={login.email} name="email" onChange={handleChange}/>
                    <input type="password"  placeholder="Password"
                      className={styles.SignInInputs}
                       value={login.password} name="password" onChange={handleChange}/>
                      <input type="checkbox"/> Remember me  <a href="#"> Forgot password </a><br/>
                      <input type="submit" value="Log in" className={styles.SignInLogin}/><br/><br/>
                    
                </form>
            </div>
            <Footer/>
        </>
    );
}

export default SignIn;