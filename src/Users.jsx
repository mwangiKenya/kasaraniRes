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

  const deleteCustomer = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `https://python-back-2.onrender.com/api/delete_user/${id}/`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    // Remove deleted user from UI without refreshing
    setCustomers(customers.filter((c) => c.id !== id));

  } catch (error) {
    console.error(error);
    alert("Error deleting user");
  }
  };

  const updateCustomer = async (id, updatedData) => {
  try {
    const response = await fetch(
      `https://python-back-2.onrender.com/api/update_user/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Update failed");
    }

    alert("User updated successfully");

    fetchCustomers(); // refresh table

  } catch (error) {
    console.error(error);
    alert("Error updating user");
  }
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
            <th>SMS Name</th>
            <th>Zone</th>
            <th>Rate</th>
            {/*<th>Registered on</th>*/}
            <th>Group</th>
            <th>Parent</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
                <td>{c.id}</td>

                <td>
                  <input
                    value={c.fname}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, fname: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.phone}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, phone: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.metre_num}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, metre_num: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.zone}
                    readOnly
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, zone: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.rate}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, rate: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.grp}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, grp: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={c.parent}
                    onChange={(e) =>
                      setCustomers(prev =>
                        prev.map(u =>
                          u.id === c.id ? { ...u, parent: e.target.value } : u
                        )
                      )
                    }
                  />
                </td>

                {/*<td>{c.created_on}</td>*/}

                <td>
                  <button onClick={() => updateCustomer(c.id, c)}>
                    Update
                  </button>
                </td>

                <td>
                  <button onClick={() => deleteCustomer(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;