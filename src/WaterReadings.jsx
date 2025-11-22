import { useState } from "react";
import styles from "./WaterReadings.module.css";
import { useEffect } from "react";

function Readings() {
    const [userdata, setUserdata] = useState([]);

    //Fetch the user data from the database
    useEffect(() => {
        const fetchData = async () => {
            try {
                const waterdata = await fetch("https://kasarani.onrender.com/read-water-data");
                const seedata = await waterdata.json();

                setUserdata(seedata);
            }
            catch (err) {
                console.error("Error reading the data : ", err);
            }
        };
        fetchData();
    }, []);
    return(
        <>
           <div className={styles.ReadingsDiv}>
              <h1> Computed water reading data  </h1>
              <table>
                <thead>
                    <tr>
                        <th colSpan={2}> User data </th>
                        <th colSpan={2}> Previus readings </th>
                        <th colSpan={2}> Current readings </th>
                        <th colSpan={2}> Computed data </th>
                    </tr>
                                        
                </thead>
                
                    
                        <th> Name </th>
                        <th> Contact </th>
                        <th> Sup </th>
                        <th> User </th>
                        <th> Sup  </th>
                        <th> User  </th>
                        <th> Units used </th>
                        <th> Amount billed </th>
                
                <tbody>
                    {userdata.map((usd) => (
                        <tr key={usd.id}>
                            <td> {usd.name} </td>
                            <td> {usd.phone} </td>
                            <td> {usd.meter} </td>
                            <td> {usd.userr} </td>
                            <td> {usd.currentSup} </td>
                            <td> {usd.currentUser} </td>
                            <td> {usd.units_used} </td>
                            <td> {usd.amount_billed} </td>
                        </tr>
                    ))}
                </tbody>
              </table>
           </div>
        </>
    );
}

function WaterReadings() {
    return(
        <>
           <Readings/>
        </>
    );
}

export default WaterReadings;