import styles from "./Users.module.css";
import React, { useEffect, useState } from "react";

function Users() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    //fetch("http://127.0.0.1:8000/api/water_users/")
    fetch("https://python-back-2.onrender.com/api/water_users/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message));
  };
  
  // Delete customer
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    //fetch(`http://127.0.0.1:8000/api/water_user/${id}/`, {
    fetch(`https://python-back-2.onrender.com/api/water_user/${id}/`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        // Remove customer from state
        setCustomers(customers.filter((c) => c.id !== id));
      })
      .catch((err) => setError(err.message));
  };

  // Update customer
  const handleUpdate = (id) => {
    const customer = customers.find((c) => c.id === id);
    const newPhone = prompt("Enter new phone number:", customer.phone);
    if (!newPhone) return;

    //fetch(`http://127.0.0.1:8000/api/water_user/${id}/`, {
    fetch(`https://python-back-2.onrender.com/api/water_user/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...customer, phone: newPhone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((updatedCustomer) => {
        setCustomers(
          customers.map((c) => (c.id === id ? updatedCustomer : c))
        );
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className={styles.mainDiv}>
      <h1>Registered Customers</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            {/*<th>Last Name</th>*/}
            <th>Phone</th>
            <th>Metre num</th>
            <th>Zone</th>
            <th>Rate</th>
            <th>Registered on</th>
            {/*<th>Update</th>
            <th>Delete</th>*/}
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.fname}</td>
              {/*<td>{c.sname}</td>*/}
              <td>{c.phone}</td>
              <td>{c.metre_num}</td>
              <td>{c.zone}</td>
              <td>{c.rate}</td>
              <td>{c.created_on}</td>
              {/*<td>
                <button onClick={() => handleUpdate(c.id)} className={styles.btnUpdate}>Update</button>
              </td>
              <td>
                <button onClick={() => handleDelete(c.id)} className={styles.btnDelete}>Delete</button>
              </td>*/}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;