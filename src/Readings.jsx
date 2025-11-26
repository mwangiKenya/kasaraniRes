import { useState, useEffect } from "react";
import styles from "./Readings.module.css";
import { toast } from "react-toastify";

function WaterUsers() {
  const [wateruser, setWaterUser] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [file, setFile] = useState(null);

  // Fetch water users from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://kasarani.onrender.com/read-user");
        const data = await res.json();
        setWaterUser(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (id, field, value) => {
    setInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save single row readings manually
  const saveReadings = async (id) => {
    const readings = inputs[id];
    if (!readings?.sup || !readings?.user) {
      toast.error("Please fill both readings");
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
      setInputs(prev => ({ ...prev, [id]: { sup: "", user: "" } }));
    } catch (err) {
      console.error("Error updating readings:", err);
      toast.error("Failed to update readings");
    }
  };

  // Handle Excel export
  const handleExport = () => {
    fetch("https://kasarani.onrender.com/export-waterusers")
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "waterusers.xlsx";
        a.click();
      })
      .catch(err => {
        console.error("Error exporting Excel:", err);
        toast.error("Failed to export Excel");
      });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle Excel upload
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://kasarani.onrender.com/import-waterusers", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        toast.success("Excel uploaded successfully!");
        setFile(null);
        // Refresh the water users data
        const refreshed = await fetch("https://kasarani.onrender.com/read-user");
        setWaterUser(await refreshed.json());
      } else {
        toast.error("Failed to upload Excel");
      }
    } catch (err) {
      console.error("Error uploading Excel:", err);
      toast.error("Error uploading Excel");
    }
  };

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Enter Water Readings</h2>

      <table className={styles.readingsTable}>
        <thead>
          <tr>
            <th colSpan={2}>User Data</th>
            <th colSpan={2}>Previous Readings</th>
            <th colSpan={2}>Current Readings</th>
            <th>Action</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Sup</th>
            <th>User</th>
            <th>Sup</th>
            <th>User</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {wateruser.map((watu) => (
            <tr key={watu.id}>
              <td data-label="Name">{watu.name}</td>
              <td data-label="Contact">{watu.phone}</td>
              <td data-label="Prev. Sup">{watu.meter}</td>
              <td data-label="Prev. User">{watu.userr}</td>
              <td data-label="Cur. Sup">
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={inputs[watu.id]?.sup || ""}
                  onChange={(e) =>
                    handleInputChange(watu.id, "sup", e.target.value)
                  }
                />
              </td>
              <td data-label="Cur. User">
                <input
                  type="number"
                  className={styles.wateruserInput}
                  value={inputs[watu.id]?.user || ""}
                  onChange={(e) =>
                    handleInputChange(watu.id, "user", e.target.value)
                  }
                />
              </td>
              <td data-label="Save">
                <button onClick={() => saveReadings(watu.id)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Excel workflow */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleExport}>Download Excel</button>
        <div style={{ marginTop: "10px" }}>
          <input type="file" accept=".xlsx" onChange={handleFileChange} />
          <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
            Upload Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaterUsers;
