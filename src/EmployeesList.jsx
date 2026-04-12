import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EmployeesList.module.css";
import { toast } from "react-toastify";

const BACKEND_URL = "https://python-back-2.onrender.com/api";

function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ username: "", role: "" });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/list_employees/`);
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/delete_employee/${id}/`);

      setEmployees(employees.filter((emp) => emp.id !== id));
      toast.success("Employee deleted");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  // ✅ START EDIT
  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditData({ username: emp.username, role: emp.role });
  };

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ SAVE UPDATE
  const saveUpdate = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/update_employee/${id}/`, editData);

      setEmployees(
        employees.map((emp) =>
          emp.id === id ? { ...emp, ...editData } : emp
        )
      );

      setEditingId(null);
      toast.success("Employee updated");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>

                  <td>
                    {editingId === emp.id ? (
                      <input
                        name="username"
                        value={editData.username}
                        onChange={handleChange}
                      />
                    ) : (
                      emp.username
                    )}
                  </td>

                  <td>
                    {editingId === emp.id ? (
                      <input
                        name="role"
                        value={editData.role}
                        onChange={handleChange}
                      />
                    ) : (
                      emp.role
                    )}
                  </td>

                  <td>
                    {editingId === emp.id ? (
                      <>
                        <button onClick={() => saveUpdate(emp.id)}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(emp)}>Edit</button>
                        <button onClick={() => deleteEmployee(emp.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          <div className={styles.AccessControl}>
            <h3> Access granted </h3>
            <div className={styles.SubAccessControl}>
              <div className={styles.ActualRoleHolder}>
                <h3>Billing officer</h3>
                <ol>
                  <li>Water readings table </li>
                  <li>Billings page</li>
                  <li>Analytics page</li>
                  <li>Logs page</li>
                </ol>
              </div>
              <div>
                <h3>Metre reader</h3>
                <ol>
                  <li>Water readings table</li>
                  <li>Customer registration page</li>
                  <li>Registred customers page</li>
                </ol>
              </div>
            </div>
            <div className={styles.ActualRoleHolder}>
              <h3>Role assignment</h3>
              <p>Assigning a worker a different role will grant him/her the access to the 
                new dashboard as per the role assigned.
              </p>
              <p> A person cannot access two dashboards at the same time. ie: cannot have two roles</p>
              <p> To have access to the normal dashboard, the admin should grant him/her the original 
                role.
              </p>
              <strong>
                <p> Assign a woker a different role to perform a certain duty in a different dashboard.</p>
                <p>Admin has access to everythin. Assigning a worker this role, will grant hime the access.</p>
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesList;