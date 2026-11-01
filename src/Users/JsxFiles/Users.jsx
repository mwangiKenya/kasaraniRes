import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "../CssFiles/Users.module.css";
import { authFetch } from "../../api";
const ok = (m) => toast.success(m, { position: "top-right", autoClose: 3000 });
const fail = (m) => toast.error(m, { position: "top-right", autoClose: 4000 });
const initial = (name) => (name ? name.charAt(0).toUpperCase() : "?");
function Users() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    fetchCustomers();
  }, []);
  const fetchCustomers = async () => {
    try {
      setError(null);
      const response = await authFetch("water_users/");
      if (!response.ok) throw new Error("Failed to fetch users");
      setCustomers(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };
  const openUpdateModal = (customer) => {
    setSelectedUser({ ...customer });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    if (isUpdating || isDeleting) return;
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };
  const updateCustomer = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      const response = await authFetch(`update_user/${selectedUser.id}/`, {
        method: "PUT",
        body: JSON.stringify(selectedUser),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Update failed");
      setCustomers((prev) => prev.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
      ok("User updated successfully!");
      setIsUpdating(false);
      closeModal();
    } catch (err) {
      fail(err.message || "Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?\n\nThis action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(`delete_user/${id}/`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete user");
      }
      setCustomers((prev) => prev.filter((user) => user.id !== id));
      ok("User deleted successfully!");
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      fail(err.message || "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };
  const updateAllCustomers = async () => {
    try {
      const response = await authFetch("update_all_users/", {
        method: "PUT",
        body: JSON.stringify(customers),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update users");
      }
      ok("All users updated successfully!");
      fetchCustomers();
    } catch (err) {
      fail(err.message || "Error updating users");
    }
  };
  return (
    <div className={styles.mainDiv}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Registered Customers</h1>
          <p>Manage and update your registered water customers.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.actionButton} ${styles.saveAllButton}`} onClick={updateAllCustomers}>
            <span>✓</span>
            Save All Changes
          </button>
        </div>
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠</span>
          <div>
            <strong>Unable to load customers</strong>
            <p>{error}</p>
          </div>
          <button onClick={fetchCustomers}>Retry</button>
        </div>
      )}
      {!error && (
        <div className={styles.tableInfo}>
          <div>
            <span className={styles.countNumber}>{customers.length}</span>
            <span className={styles.countText}>{customers.length === 1 ? "customer" : "customers"} registered</span>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>SMS Name</th>
              <th>Zone</th>
              <th>Rate</th>
              <th>Group</th>
              <th>Parent</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className={styles.idBadge}>{customer.id}</span>
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{initial(customer.fname)}</div>
                      <span>{customer.fname || "—"}</span>
                    </div>
                  </td>
                  <td>{customer.phone || "—"}</td>
                  <td>{customer.metre_num || "—"}</td>
                  <td>
                    <span className={styles.zoneBadge}>{customer.zone || "—"}</span>
                  </td>
                  <td>
                    <strong>
                      {customer.rate !== null && customer.rate !== undefined && customer.rate !== "" ? `KSh ${customer.rate}` : "—"}
                    </strong>
                  </td>
                  <td>{customer.grp ? <span className={styles.groupBadge}>{customer.grp}</span> : "—"}</td>
                  <td>{customer.parent || "—"}</td>
                  <td>
                    <button className={styles.updateButton} onClick={() => openUpdateModal(customer)}>
                      Update User
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h3>No customers found</h3>
                    <p>There are currently no registered customers to display.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && selectedUser && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="update-user-title">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <div className={styles.modalAvatar}>{initial(selectedUser.fname)}</div>
                <div>
                  <h2 id="update-user-title">Update User</h2>
                  <p>Edit the customer's information below.</p>
                </div>
              </div>
              <button className={styles.closeButton} onClick={closeModal} disabled={isUpdating || isDeleting} aria-label="Close modal">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>User ID</label>
                  <input type="text" value={selectedUser.id || ""} readOnly className={styles.readOnlyInput} />
                  <small>System-generated user ID</small>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="fname">
                    Name <span>*</span>
                  </label>
                  <input id="fname" name="fname" type="text" value={selectedUser.fname || ""} onChange={handleInputChange} placeholder="Enter customer name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>
                  <input id="phone" name="phone" type="text" value={selectedUser.phone || ""} onChange={handleInputChange} placeholder="Enter phone number" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="metre_num">SMS Name</label>
                  <input id="metre_num" name="metre_num" type="text" value={selectedUser.metre_num || ""} onChange={handleInputChange} placeholder="Enter SMS name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="gen_name">Gen Name</label>
                  <input id="gen_name" name="gen_name" type="text" value={selectedUser.gen_name || ""} onChange={handleInputChange} placeholder="Enter Gen name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="zone">Zone</label>
                  <div className={styles.readOnlyWrapper}>
                    <input id="zone" name="zone" type="text" value={selectedUser.zone || ""} readOnly className={styles.readOnlyInput} />
                    <span className={styles.lockIcon}></span>
                  </div>
                  <small>Zone cannot be edited</small>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="rate">Rate</label>
                  <input id="rate" name="rate" type="number" value={selectedUser.rate ?? ""} onChange={handleInputChange} placeholder="Enter rate" min="0" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="grp">Group</label>
                  <input id="grp" name="grp" type="text" value={selectedUser.grp || ""} onChange={handleInputChange} placeholder="Enter group" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="parent">Parent</label>
                  <select value={selectedUser.parent || ""} onChange={handleInputChange} name="parent" id="parent">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalDeleteButton} onClick={() => deleteCustomer(selectedUser.id)} disabled={isUpdating || isDeleting}>
                {isDeleting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
              <div className={styles.footerRight}>
                <button className={styles.cancelButton} onClick={closeModal} disabled={isUpdating || isDeleting}>
                  Cancel
                </button>
                <button className={styles.modalUpdateButton} onClick={updateCustomer} disabled={isUpdating || isDeleting}>
                  {isUpdating ? (
                    <>
                      <span className={styles.spinner}></span>
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Users;