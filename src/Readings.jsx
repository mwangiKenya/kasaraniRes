import { useState } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function MyUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([
    { id: 1, name: "Alice", phone: "0712345678", prevs: "567", prevu: "67", reading: "", userr: "" },
    { id: 2, name: "Bob", phone: "0723456789", prevs: "464", prevu: "989", reading: "", userr: "" },
    { id: 3, name: "Charlie", phone: "0734567890", prevs: "1234", prevu: "34", reading: "", userr: "" },
  ]);

  const handleChange = (id, value) => {
    setUsers(users.map(user => user.id === id ? { ...user, reading: value } : user));
  };

  const handleUser = (id, value) => {
    setUsers(users.map(user => user.id === id ? { ...user, userr: value } : user));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if(users.some(user => user.userr === "" || user.reading === "")){
      toast.error("Enter all readings to continue.");
      return;
    }
    else{
      console.log("Saved readings:", users);
      toast.success("Water readings saved successfully. View results from dashboard.");
    }
    
  };

  const toWater = () => {
    navigate("/WaterData");
  };

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Enter Water Readings</h2>

      <table className={styles.readingsTable}>
        <thead>
          <tr>
            <th colSpan={2}>User Data</th>
            <th colSpan={2}>Previous Reading</th>
            <th colSpan={2}>Current Reading</th>
            <th colSpan={2}>Difference</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Sup</th>
            <th>User</th>
            <th>Sup</th>
            <th>User</th>
            <th>Sup</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const difference = Number(user.reading || 0) - Number(user.prevu || 0);
            const diff = Number(user.userr || 0) - Number(user.prevs || 0);
            return (
              <tr key={user.id}>
                <td data-label="Name">{user.name}</td>
                <td data-label="Phone">{user.phone}</td>
                <td data-label="Sup">{user.prevs}</td>
                <td data-label="User">{user.prevu}</td>
                <td data-label="Sup">
                  <input
                    type="number"
                    value={user.userr}
                    name="userr"
                    onChange={(e) => handleUser(user.id, e.target.value)}
                    placeholder="Enter Sup readings"
                    className={styles.readingInput}
                  />
                </td>
                <td data-label="User">
                  <input
                    type="number"
                    name="reading"
                    value={user.reading}
                    onChange={(e) => handleChange(user.id, e.target.value)}
                    placeholder="Enter user reading"
                    className={styles.readingInput}
                  />
                </td>
                <td data-label="Sup">{diff}</td>
                <td data-label="User">{difference}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className={styles.saveBtn} onClick={handleSave}>
        Save Readings
      </button>
      <button className={styles.saveBtn} onClick={toWater}>
        See The Results
      </button>
    
    </div>
  );
}

function WaterUsers() {

  const [wateruser, setWaterUser] = useState([]);
  const [inputs, setInputs] = useState([]);

  //Fetch the water user data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetch("https://kasarani.onrender.com/read-user");
        const userres = await userData.json();
        setWaterUser(userres);
      }
      catch (err) {
        console.error("Error fetching data: ", err);
      }
    };
    fetchData();
  }, []);

  //Handle the input change
  const handleInputChange = (id, field, value) => {
    setInputs(prev => ({
      ...prev,
      [id] : {
        ...prev[id],
        [field] : value
      }
    }));
  };


  //Add the save button
  const saveReadings = async (id) => {
  const readings = inputs[id];

  if (!readings?.sup || !readings?.user) {
    alert("Please fill both readings");
    return;
  }

  try {
    await fetch("https://kasarani.onrender.com/update-readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        sup: readings.sup,
        user: readings.user
      })
    });

    toast.success("Readings updated successfully!");
    //Clear the inputs
    setInputs(prev => ({
      ...prev,
      [id]: { sup: "", user: "" }
    }));
  } catch (err) {
    console.error("Error updating readings:", err);
  }
};

  return(
    <>
       <div className={styles.tableContainer}>
        <h2 className={styles.title}>Enter Water Readings</h2>
        <table className={styles.readingsTable}>
          <thead>
            <tr>
              <th colSpan={2}> User Data </th>
              <th colSpan={2}> Previus readings </th>
              <th colSpan={2}> Current readings </th>
              <th> Action </th>
            </tr>
           <tr>
            <th> Name </th>
            <th> Contact </th>
            <th> Sup </th>
            <th> User </th>
            <th> Sup  </th>
            <th> User  </th>
            <th> Save </th>
           </tr>
          </thead>

          <tbody>
            {wateruser.map((watu) => (
              <tr key={watu.id}>
                <td> {watu.name} </td>
                <td> {watu.phone} </td>
                <td> {watu.meter} </td>
                <td> {watu.userr} </td>
              
                <td> <input type="number"
                  className={styles.wateruserInput} 
                  value={inputs[watu.id]?.sup || ""}
                  onChange={(e) =>
                   handleInputChange(watu.id, "sup", e.target.value)
                  }/> </td>
                <td> <input type="number"
                   className={styles.wateruserInput}
                   value={inputs[watu.id]?.user || ""}
                   onChange={(e) =>
                    handleInputChange(watu.id, "user", e.target.value)
                  }/> </td>
                  <td>
                    <button onClick={() => saveReadings(watu.id)}>
                      Save
                    </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
    </>
  );
}

function Readings() {
  return(
    <>
        <div>
          {/*<MyUsers/>*/}
          <WaterUsers/>
        </div>
    </>
  );
}

export default Readings;
