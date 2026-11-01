import React, { useEffect, useState } from "react";
import styles from "../CssFiles/EmployeesList.module.css";
import { toast } from "react-toastify";
import { authFetch } from "../../api";
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
      const response = await authFetch("list_employees/");
      if (!response.ok) throw new Error();
      setEmployees(await response.json());
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };
  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const response = await authFetch(`delete_employee/${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setEmployees(employees.filter((emp) => emp.id !== id));
      toast.success("Employee deleted");
    } catch {
      toast.error("Delete failed");
    }
  };
  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditData({ username: emp.username, role: emp.role });
  };
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const saveUpdate = async (id) => {
    try {
      const response = await authFetch(`update_employee/${id}/`, { method: "PUT", body: JSON.stringify(editData) });
      if (!response.ok) throw new Error();
      setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, ...editData } : emp)));
      setEditingId(null);
      toast.success("Employee updated");
    } catch {
      toast.error("Update failed");
    }
  };
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All System Users</h2>
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
                <th>Registration date</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{editingId === emp.id ? <input name="username" value={editData.username} onChange={handleChange} /> : emp.username}</td>
                  <td>{editingId === emp.id ? <input name="role" value={editData.role} onChange={handleChange} /> : emp.role}</td>
                  <td>{emp.reg_on}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.status}</td>
                  <td>
                    {editingId === emp.id ? (
                      <>
                        <button onClick={() => saveUpdate(emp.id)}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(emp)}>Edit</button>
                        <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
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
                <h3>Billing Account</h3>
                <ol>
                  <li>Water readings table </li>
                  <li>Billings page</li>
                  <li>Analytics page</li>
                  <li>Logs page</li>
                </ol>
              </div>
              <div>
                <h3>Readings Account</h3>
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
                <p>Admin has access to everything. Assigning a worker this role, will grant him/her the access.</p>
              </strong>
              <p className={styles.DenyPoint}>
                To deny an access, set the role as <strong>none</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EmployeesList;