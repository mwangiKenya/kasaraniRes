import { useState, useEffect } from "react";
import styles from "../CssFiles/WaterUser.module.css";
import { toast } from "react-toastify";
import mainUrl from "../../api";

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
        role: "",
        gen_name: "",
        email: "",
        password: "",
        agency: "",
    });

    useEffect(() => {
        const myagency = localStorage.getItem("agency");
        setReg(prev => ({
            ...prev,
            agency: myagency || ""
        }));
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setReg(prev => ({
                    ...prev,
                    username: user.username || "admin",
                    role: user.role || "admin"
                }));
            } catch (e) {
                setReg(prev => ({
                    ...prev,
                    username: "admin",
                    role: "admin"
                }));
            }
        } else {
            setReg(prev => ({
                ...prev,
                username: "admin",
                role: "admin"
            }));
        }
    }, []);

    const handleChange = (e) => {
        setReg({ ...reg, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reg.fname || !reg.phone || !reg.metre_num || !reg.zone || !reg.rate) {
            toast.error("Please fill all the required details to register user.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Your session has expired. Please log in again.");
            return;
        }

        const submitData = {
            fname: reg.fname,
            phone: reg.phone,
            metre_num: reg.metre_num,
            zone: reg.zone,
            rate: reg.rate,
            grp: reg.grp || "",
            parent: reg.parent || "",
            username: reg.username || "admin",
            role: reg.role || "admin",
            gen_name: reg.gen_name || "",
            email: reg.email || "",
            password: reg.password || "",
            agency: reg.agency ? Number(reg.agency) : null
        };

        try {
            const res = await fetch(`${mainUrl}new_user/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`${reg.fname} has been registered successfully.`);

                setReg({
                    fname: "",
                    phone: "",
                    metre_num: "",
                    zone: "",
                    rate: "",
                    grp: "",
                    parent: "",
                    username: reg.username,
                    role: reg.role,
                    gen_name: "",
                    email: "",
                    password: "",
                    agency: reg.agency
                });
            } else {
                const errorMsg = data.error || data.detail || data.message || "Registration failed. Please check user details and try again.";
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error("Failed to send data: ", error);
            toast.error("Something went wrong. Please check your connection and try again later.");
        }
    };

    const agency = reg.agency;

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
                    placeholder="SMS Name*"
                    value={reg.metre_num}
                    name="metre_num"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                />
                <input
                    type="text"
                    placeholder="Gen.Name Optional"
                    value={reg.gen_name}
                    name="gen_name"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
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
                    placeholder="Group"
                    value={reg.grp}
                    name="grp"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <select
                    name="parent"
                    value={reg.parent}
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    required
                >
                    <option value="">--Parent--</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
                <input
                    type="email"
                    placeholder="Email"
                    value={reg.email}
                    name="email"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={reg.password}
                    name="password"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                />
                <input
                    style={{ display: "none" }}
                    type="number"
                    placeholder="Agency"
                    value={reg.agency}
                    name="agency"
                    onChange={handleChange}
                    className={styles.RegWaterUserInput}
                    readOnly
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