import { useState } from "react";
import styles from "./Profile.module.css";
import Footer from "./Footer";

function Profile() {
  const [inputId, setInputId] = useState(""); // store admin input
  const [profileId, setProfileId] = useState(null); // id used for fetch
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // handle errors

  const fetchProfile = async () => {
    if (!inputId) {
      setError("Please enter a User ID");
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);

    try {
      //const res = await fetch(`http://127.0.0.1:8000/api/user-profile/${inputId}/`);
      const res = await fetch(`https://kasarani-1.onrender.com/api/user-profile/${inputId}/`);
      const data = await res.json();

      if (res.status === 404 || data.error) {
        setError(data.error || "User not found");
      } else {
        setProfile(data);
        setProfileId(inputId);
      }
    } catch (e) {
      setError("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.majordiv}>
       {/* Input to enter User ID */}
        <div className={styles.inputContainer}>
          <input
            type="number"
            placeholder="Enter User ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className={styles.input}
          />
          <button onClick={fetchProfile} className={styles.button}>
            See Profile
          </button>
        </div>

      <div className={styles.container}>

        {/* Loading & Error Messages */}
        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {/* Profile Display */}
        {profile && (
          <>
            <div className={styles.card}>
              <h2>Personal Information</h2>
              <p><strong> ID: </strong>{profile.personal_info.id}</p>
              <p><strong>Name:</strong> {profile.personal_info.name}</p>
              <p><strong>Phone:</strong> {profile.personal_info.phone}</p>
              <p><strong>Zone:</strong> {profile.personal_info.zone}</p>
            </div>

            <div className={styles.card}>
              <h2>Water Usage Summary</h2>
              <p><strong> Metre No: </strong>{profile.personal_info.metre} </p>
              <p><strong> Prev. read: </strong>{profile.usage_summary.prev} units </p>
              <p><strong> Cur. read: </strong>{profile.usage_summary.cur} units </p>
              <p><strong>Units Used:</strong> {profile.usage_summary.total_units_used} units </p>
              <p><strong>Total Readings:</strong> {profile.usage_summary.number_of_readings}</p>
            </div>

            <div className={styles.card}>
              <h2>Billing Summary</h2>
              <p><strong> Billings rate: </strong>{profile.personal_info.rate} </p>
              <p><strong>Total Bill:</strong> {profile.billing_summary.total_bill}</p>
              <p><strong>Total Paid:</strong> {profile.billing_summary.total_paid}</p>
              <p><strong>Balance:</strong> {profile.billing_summary.total_balance}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    profile.billing_summary.status === "Paid"
                      ? styles.paid
                      : styles.unpaid
                  }
                >
                  {profile.billing_summary.status}
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Profile;