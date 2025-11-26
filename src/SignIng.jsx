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


    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch("https://kasarani.onrender.com/admin-login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(login)
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            
            return;
        }

        toast.success("Login successful!");
        navigate("/Dashboard");

    } catch (err) {
        console.error(err);
        toast.error("Login error");
    }
};

    return(
        <>
            <div className={styles.SignInDiv}>
                <form autoComplete="off" onSubmit={handleLogin}>
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