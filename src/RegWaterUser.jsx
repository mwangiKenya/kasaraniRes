import { useState } from "react";
import styles from "./WaterUser.module.css";
import { toast } from "react-toastify";

function RegWaterUser() {
    const [reg, setReg] = useState({
        fname: "",
        phone: "",
        metre_num: "",
        zone: "",
        rate: ""
    });

    // Handle input changes
    const handleChange = (e) => {
        setReg({ ...reg, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!reg.fname || !reg.phone || !reg.metre_num || !reg.zone || !reg.rate) {
            toast.error("Please fill all the details to register user.");
            return;
        }

        try {
            //const res = await fetch("http://127.0.0.1:8000/api/new_user/", { // <-- Django endpoint
            const res = await fetch("https://python-back-2.onrender.com/api/new_user/", { // <-- Django endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reg),
            });

            if (res.ok) {
                toast.success(`${reg.fname} has been registered successfully.`);
                setReg({ fname: "", phone: "", metre_num: "", zone: "", rate: ""});
            } else {
                const data = await res.json();
                toast.error(data.detail || "Failed. Check user details and try again.");
            }
        } catch (error) {
            console.error("Failed to send data: ", error);
            toast.error("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className={styles.RegWaterUserDiv}>
            <h2>New User Registration</h2>
            <form className={styles.RegWaterUserForm} onSubmit={handleSubmit} autoComplete="off">
                <input
                    type="text"
                    placeholder="User name"
                    value={reg.fname}
                    name="fname"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                {/*<input
                    type="text"
                    placeholder="Last name"
                    value={reg.sname}
                    name="sname"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />*/}
                <input
                    type="tel"
                    placeholder="Phone number"
                    value={reg.phone}
                    name="phone"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    type="number"
                    placeholder="Metre Number"
                    value={reg.metre_num}
                    name="metre_num"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    type="text"
                    placeholder="Zone"
                    value={reg.zone}
                    name="zone"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <select
                      value={reg.rate}
                        name="rate"
                        onChange={handleChange}
                        className={styles.RegWaterUserInput}>
                    <option>
                        ---Select the billing rate---
                    </option>
                    <option> 100 </option>
                    <option> 120 </option>
                </select>
                <input
                    type="submit"
                    value="Register user"
                    className={styles.RegWaterUserAction}
                />
            </form>
        </div>
    );
}

export default RegWaterUser;
