import styles from "./Sms.module.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Sms() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message));
  }, []);

  // dates
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 7);
  const formattedDueDate = dueDate.toLocaleDateString();

  // ✅ checkbox (FIXED using ID)
  const handleSelect = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);
      if (exists) {
        return prev.filter((c) => c.id !== customer.id);
      } else {
        return [...prev, customer];
      }
    });
  };

  const isSelected = (customer) => {
    return selectedCustomers.some((c) => c.id === customer.id);
  };

  // ✅ send SMS (formatted properly)
  const sendSMS = async () => {
    if (selectedCustomers.length === 0) {
      toast.info("Select at least one customer");
      return;
    }

    // build payload properly
    const formattedCustomers = selectedCustomers.map((c) => ({
      phone: c.phone, // make sure backend has phone field
      message: `Dear ${c.name}, 
      Your water bill as at ${new Date().toLocaleDateString()}
      Prev read: ${c.prev_user}
      Curr read: ${c.cur_user}
      Units Used: ${c.units_used}
      Current Bill: KES ${c.bill}
      Last Balance: KES ${c.b_cd}
      Total Bill: KES ${c.bal}
      Pay by ${formattedDueDate}
      Payment options:
      Via mpesa: send money:
      0723311564, Till no: 544783
      Bank: 01192576824499 Coop.`
    }));

    try {
      const res = await fetch(
        "https://python-back-2.onrender.com/api/send_sms_view/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customers: formattedCustomers,
          }),
        }
      );

      const data = await res.json();
      toast.success("SMS sent successfully");
      console.log(data);
    } catch (err) {
      toast.error("Failed to send SMS");
    }
  };

      //  check if all are selected
    const allSelected =
      customers.length > 0 && selectedCustomers.length === customers.length;

    // toggle select all
    const handleSelectAll = () => {
      if (allSelected) {
        setSelectedCustomers([]);
      } else {
        setSelectedCustomers(customers);
      }
    };

  return (
    <div className={styles.container}>
      <h1 className={styles.header1}>SMS Dashboard</h1>

      <button className={styles.sendBtn} onClick={sendSMS}>
        Send SMS Now
      </button>

      <table className={styles.tableContainer}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {/*<th>Sms</th>*/}
            {/*<th>Status</th>*/}
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
              />{" "}
              Select All
            </th>
            <th>Preview</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              {/*<td>Your invoice is ready...</td>*/}
              {/*<td>Not sent</td>*/}

              <td>
                <input
                  type="checkbox"
                  checked={isSelected(c)}
                  onChange={() => handleSelect(c)}
                />
              </td>

              <td>
                <button
                  onClick={() => {
                    setSelectedCustomer(c);
                    setShowModal(true);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && selectedCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2>SMS Preview</h2>

            <p>
              Dear {selectedCustomer.name}, <br />
              Your water bill as at {new Date().toLocaleDateString()}
              <br />
              Prev read: {selectedCustomer.prev_user}<br/>
              Curr read: {selectedCustomer.cur_user}<br/>
              Units Used: {selectedCustomer.units_used} <br />
              Current Bill: KES {selectedCustomer.bill} <br />
              Last Bill: KES {selectedCustomer.b_cd}<br/>
              Total Bill: KES {selectedCustomer.bal}<br/>
              Pay by {formattedDueDate}<br/>
              Payment options:<br/>
              Via mpesa: send money:<br/>
              0723311564, Till no: 544783<br/>
              Bank: 01192576824499 Coop.<br/>
            </p>

            <button onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sms;