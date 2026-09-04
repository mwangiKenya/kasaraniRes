import { useState, useEffect } from "react";
import styles from "./WaterUser.module.css";
import { toast } from "react-toastify";

function RegWaterUser() {
    const [reg, setReg] = useState({
        fname: "",
        phone: "",
        metre_num: "",
        zone: "",
        rate: "",
        grp: "",
        parent: "",
        username: "",
        role: ""
    });

    // Get logged-in user info from localStorage or context
    useEffect(() => {
        // Assuming you store user data in localStorage after login
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setReg(prev => ({
                    ...prev,
                    username: user.username || "admin",
                    role: user.role || "admin"
                }));
            } catch (e) {
                // Fallback defaults
                setReg(prev => ({
                    ...prev,
                    username: "admin",
                    role: "admin"
                }));
            }
        } else {
            // Fallback defaults if no user is logged in
            setReg(prev => ({
                ...prev,
                username: "admin",
                role: "admin"
            }));
        }
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        setReg({ ...reg, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation - all fields except grp and parent are required
        if (!reg.fname || !reg.phone || !reg.metre_num || !reg.zone || !reg.rate) {
            toast.error("Please fill all the required details to register user.");
            return;
        }

        // Prepare data for submission
        const submitData = {
            fname: reg.fname,
            phone: reg.phone,
            metre_num: reg.metre_num,
            zone: reg.zone,
            rate: reg.rate,
            grp: reg.grp || "", // Optional
            parent: reg.parent || "", // Optional
            username: reg.username || "admin",
            role: reg.role || "admin"
        };

        console.log("Submitting data:", submitData); // For debugging

        try {
            const res = await fetch("https://python-back-2.onrender.com/api/new_user/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();
            console.log("Response:", data); // For debugging

            if (res.ok) {
                toast.success(`${reg.fname} has been registered successfully.`);
                // Reset form
                setReg({
                    fname: "",
                    phone: "",
                    metre_num: "",
                    zone: "",
                    rate: "",
                    grp: "",
                    parent: "",
                    username: reg.username, // Keep username
                    role: reg.role // Keep role
                });
            } else {
                // Check for error message in different formats
                const errorMsg = data.error || data.detail || data.message || "Registration failed. Please check user details and try again.";
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error("Failed to send data: ", error);
            toast.error("Something went wrong. Please check your connection and try again later.");
        }
    };

    return (
        <div className={styles.RegWaterUserDiv}>
            <h2>New User Registration</h2>
            <form className={styles.RegWaterUserForm} onSubmit={handleSubmit} autoComplete="off">
                <input
                    type="text"
                    placeholder="User name *"
                    value={reg.fname}
                    name="fname"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input
                    type="tel"
                    placeholder="Phone number *"
                    value={reg.phone}
                    name="phone"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input
                    type="text"
                    placeholder="SMS Name (Meter Number) *"
                    value={reg.metre_num}
                    name="metre_num"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input
                    type="text"
                    placeholder="Zone *"
                    value={reg.zone}
                    name="zone"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input 
                    type="number" 
                    placeholder="Billing rate *" 
                    value={reg.rate}
                    name="rate"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input
                    type="text"
                    placeholder="Group (Optional)"
                    value={reg.grp}
                    name="grp"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    type="text"
                    placeholder="Parent (Optional)"
                    value={reg.parent}
                    name="parent"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    type="submit"
                    value="Register User"
                    className={styles.RegWaterUserAction}
                />
            </form>
        </div>
    );
}

export default RegWaterUser;