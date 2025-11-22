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
                
                    <tr>
                        <th> Name </th>
                        <th> Contact </th>
                        <th> Sup </th>
                        <th> User </th>
                        <th> Sup  </th>
                        <th> User  </th>
                        <th> Units used </th>
                        <th> Amount billed </th>
                    </tr>
                <tbody>
                    {userdata.map((usd) => (
                        <tr key={usd.id}>
                            <td data-label = "Name"> {usd.name} </td>
                            <td data-label = "Contact"> {usd.phone} </td>
                            <td data-label = "Prev. Sup"> {usd.meter} </td>
                            <td data-label = "Prev. User"> {usd.userr} </td>
                            <td data-label = "Cur. Sup"> {usd.currentSup} </td>
                            <td data-label = "Cur. User"> {usd.currentUser} </td>
                            <td data-label = "Units used"> {usd.units_used} </td>
                            <td data-label = "Amount billed"> {usd.amount_billed} </td>
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