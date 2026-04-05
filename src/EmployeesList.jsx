import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EmployeesList.module.css";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api"; // change to your backend URL

function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/list_employees/`);
      setEmployees(response.data); // assuming backend returns a JSON array
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Employees</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.username}</td>
                  <td>{emp.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeesList;