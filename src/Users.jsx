import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./Users.module.css";

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

      const response = await fetch(
        "https://python-back-2.onrender.com/api/water_users/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ==============================
  // OPEN UPDATE MODAL
  // ==============================
  const openUpdateModal = (customer) => {
    // Make a copy so changes in the modal
    // don't immediately change the table
    setSelectedUser({ ...customer });
    setIsModalOpen(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================
  const closeModal = () => {
    if (isUpdating || isDeleting) return;

    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // ==============================
  // HANDLE MODAL INPUT CHANGES
  // ==============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // UPDATE USER
  // ==============================
  const updateCustomer = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);

    try {
      const response = await fetch(
        `https://python-back-2.onrender.com/api/update_user/${selectedUser.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedUser),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Update the table immediately
      setCustomers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );

      toast.success("User updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      closeModal();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Error updating user", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ==============================
  // DELETE USER
  // ==============================
  const deleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `https://python-back-2.onrender.com/api/delete_user/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let message = "Failed to delete user";

        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      // Remove user from table immediately
      setCustomers((prev) => prev.filter((user) => user.id !== id));

      toast.success("User deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Error deleting user", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==============================
  // DOWNLOAD USERS
  // ==============================
  const downloadUsers = () => {
    window.open(
      "https://python-back-2.onrender.com/api/download_users/",
      "_blank"
    );
  };

  // ==============================
  // UPDATE ALL CUSTOMERS
  // ==============================
  const updateAllCustomers = async () => {
    try {
      const response = await fetch(
        "https://python-back-2.onrender.com/api/update_all_users/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customers),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update users");
      }

      toast.success("All users updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      fetchCustomers();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Error updating users", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className={styles.mainDiv}>
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Registered Customers</h1>
          <p>Manage and update your registered water customers.</p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.actionButton} ${styles.downloadButton}`}
            onClick={downloadUsers}
          >
            <span>↓</span>
            Download Excel
          </button>

          <button
            className={`${styles.actionButton} ${styles.saveAllButton}`}
            onClick={updateAllCustomers}
          >
            <span>✓</span>
            Save All Changes
          </button>
        </div>
      </div>

      {/* =========================
          ERROR MESSAGE
      ========================== */}
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

      {/* =========================
          CUSTOMER COUNT
      ========================== */}
      {!error && (
        <div className={styles.tableInfo}>
          <div>
            <span className={styles.countNumber}>{customers.length}</span>
            <span className={styles.countText}>
              {customers.length === 1 ? "customer" : "customers"} registered
            </span>
          </div>
        </div>
      )}

      {/* =========================
          TABLE
      ========================== */}
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
                    <span className={styles.idBadge}>
                      #{customer.id}
                    </span>
                  </td>

                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {customer.fname
                          ? customer.fname.charAt(0).toUpperCase()
                          : "?"}
                      </div>

                      <span>{customer.fname || "—"}</span>
                    </div>
                  </td>

                  <td>{customer.phone || "—"}</td>

                  <td>{customer.metre_num || "—"}</td>

                  <td>
                    <span className={styles.zoneBadge}>
                      {customer.zone || "—"}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {customer.rate !== null &&
                      customer.rate !== undefined &&
                      customer.rate !== ""
                        ? `KSh ${customer.rate}`
                        : "—"}
                    </strong>
                  </td>

                  <td>
                    {customer.grp ? (
                      <span className={styles.groupBadge}>
                        {customer.grp}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{customer.parent || "—"}</td>

                  <td>
                    <button
                      className={styles.updateButton}
                      onClick={() => openUpdateModal(customer)}
                    >
                      <span>✎</span>
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
                    <p>
                      There are currently no registered customers to display.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          UPDATE USER MODAL
      ========================== */}
      {isModalOpen && selectedUser && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-user-title"
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <div className={styles.modalAvatar}>
                  {selectedUser.fname
                    ? selectedUser.fname.charAt(0).toUpperCase()
                    : "?"}
                </div>

                <div>
                  <h2 id="update-user-title">Update User</h2>
                  <p>
                    Edit the customer's information below.
                  </p>
                </div>
              </div>

              <button
                className={styles.closeButton}
                onClick={closeModal}
                disabled={isUpdating || isDeleting}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* ID */}
                <div className={styles.formGroup}>
                  <label>User ID</label>

                  <input
                    type="text"
                    value={selectedUser.id || ""}
                    readOnly
                    className={styles.readOnlyInput}
                  />

                  <small>System-generated user ID</small>
                </div>

                {/* Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="fname">
                    Name <span>*</span>
                  </label>

                  <input
                    id="fname"
                    name="fname"
                    type="text"
                    value={selectedUser.fname || ""}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={selectedUser.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* SMS Name / Meter Number */}
                <div className={styles.formGroup}>
                  <label htmlFor="metre_num">SMS Name</label>

                  <input
                    id="metre_num"
                    name="metre_num"
                    type="text"
                    value={selectedUser.metre_num || ""}
                    onChange={handleInputChange}
                    placeholder="Enter SMS name"
                  />
                </div>

                {/* Zone */}
                <div className={styles.formGroup}>
                  <label htmlFor="zone">Zone</label>

                  <div className={styles.readOnlyWrapper}>
                    <input
                      id="zone"
                      name="zone"
                      type="text"
                      value={selectedUser.zone || ""}
                      readOnly
                      className={styles.readOnlyInput}
                    />

                    <span className={styles.lockIcon}>🔒</span>
                  </div>

                  <small>Zone cannot be edited</small>
                </div>

                {/* Rate */}
                <div className={styles.formGroup}>
                  <label htmlFor="rate">Rate</label>

                  <input
                    id="rate"
                    name="rate"
                    type="number"
                    value={selectedUser.rate ?? ""}
                    onChange={handleInputChange}
                    placeholder="Enter rate"
                    min="0"
                  />
                </div>

                {/* Group */}
                <div className={styles.formGroup}>
                  <label htmlFor="grp">Group</label>

                  <input
                    id="grp"
                    name="grp"
                    type="text"
                    value={selectedUser.grp || ""}
                    onChange={handleInputChange}
                    placeholder="Enter group"
                  />
                </div>

                {/* Parent */}
                <div className={styles.formGroup}>
                  <label htmlFor="parent">Parent</label>

                  <input
                    id="parent"
                    name="parent"
                    type="text"
                    value={selectedUser.parent || ""}
                    onChange={handleInputChange}
                    placeholder="Enter parent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.modalDeleteButton}
                onClick={() => deleteCustomer(selectedUser.id)}
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span>🗑</span>
                    Delete
                  </>
                )}
              </button>

              <div className={styles.footerRight}>
                <button
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={isUpdating || isDeleting}
                >
                  Cancel
                </button>

                <button
                  className={styles.modalUpdateButton}
                  onClick={updateCustomer}
                  disabled={isUpdating || isDeleting}
                >
                  {isUpdating ? (
                    <>
                      <span className={styles.spinner}></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Update User
                    </>
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