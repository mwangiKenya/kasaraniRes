import styles from "./Sms.module.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Sms() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  // selected customers
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // store editable sms per customer
  const [editedMessages, setEditedMessages] = useState({});

  // loading states
  const [sending, setSending] = useState(false);

  // fetch customers
  useEffect(() => {
    fetch("https://python-back-2.onrender.com/api/bill/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch customers");
        return res.json();
      })
      .then((data) => {
        setCustomers(data);

        // initialize messages
        const initialMessages = {};

        data.forEach((c) => {
          initialMessages[c.id] = generateMessage(c);
        });

        setEditedMessages(initialMessages);
      })
      .catch((err) => {
        setError(err.message);
        toast.error("Failed to load customers");
      });
  }, []);

  // dates
  const today = new Date();

  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 7);

  const formattedDueDate = dueDate.toLocaleDateString();

  // generate default sms
  const generateMessage = (customer) => {
    return `Dear ${customer.name},

Your water bill as at ${today.toLocaleDateString()}

Prev Read: ${customer.prev_user}
Curr Read: ${customer.cur_user}
Units Used: ${customer.units_used}

Current Bill: KES ${customer.bill}
Last Balance: KES ${customer.b_cd}
Total Bill: KES ${customer.bal}

Pay by ${formattedDueDate}

Payment Options:
M-PESA Send Money:
0723311564

Till Number:
544783

Bank:
01192576824499 Coop Bank.

Thank you.`;
  };

  // select one
  const handleSelect = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);

      if (exists) {
        return prev.filter((c) => c.id !== customer.id);
      }

      return [...prev, customer];
    });
  };

  // selected checker
  const isSelected = (customer) => {
    return selectedCustomers.some((c) => c.id === customer.id);
  };

  // select all
  const allSelected =
    customers.length > 0 &&
    selectedCustomers.length === customers.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers);
    }
  };

  // open modal
  const openPreview = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // edit sms
  const handleMessageChange = (value) => {
    setEditedMessages((prev) => ({
      ...prev,
      [selectedCustomer.id]: value,
    }));
  };

  // save edited sms
  const saveMessage = () => {
    toast.success("SMS updated successfully");
    setShowModal(false);
  };

  // send single sms
  const sendSingleSMS = async (customer) => {
    try {
      setSending(true);

      const payload = {
        customers: [
          {
            phone: customer.phone,
            message: editedMessages[customer.id],
          },
        ],
      };

      const res = await fetch(
        "https://python-back-2.onrender.com/api/send_sms_view/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send SMS");
      }

      toast.success(`SMS sent to ${customer.name}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  // send selected sms
  const sendSMS = async () => {
    if (selectedCustomers.length === 0) {
      toast.info("Select at least one customer");
      return;
    }

    try {
      setSending(true);

      const formattedCustomers = selectedCustomers.map((c) => ({
        phone: c.phone,
        message: editedMessages[c.id],
      }));

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

      if (!res.ok) {
        throw new Error("Failed to send SMS");
      }

      const data = await res.json();

      console.log(data);

      toast.success("SMS sent successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div>
          <h1 className={styles.header1}>SMS Dashboard</h1>
          <p className={styles.subtitle}>
            Preview, edit and send customized SMS to customers
          </p>
        </div>

        <button
          className={styles.sendBtn}
          onClick={sendSMS}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Selected SMS"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrapper}>
        <table className={styles.tableContainer}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Phone</th>

              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />{" "}
                Select All
              </th>

              <th>Preview/Edit</th>
              <th>Send</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>

                <td>{c.name}</td>

                <td>{c.phone}</td>

                <td>
                  <input
                    type="checkbox"
                    checked={isSelected(c)}
                    onChange={() => handleSelect(c)}
                  />
                </td>

                <td>
                  <button
                    className={styles.previewBtn}
                    onClick={() => openPreview(c)}
                  >
                    Preview
                  </button>
                </td>

                <td>
                  <button
                    className={styles.singleSendBtn}
                    onClick={() => sendSingleSMS(c)}
                    disabled={sending}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selectedCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div>
                <h2>SMS Editor</h2>

                <p>
                  Editing SMS for{" "}
                  <strong>{selectedCustomer.name}</strong>
                </p>
              </div>

              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <textarea
              className={styles.smsTextarea}
              value={editedMessages[selectedCustomer.id] || ""}
              onChange={(e) =>
                handleMessageChange(e.target.value)
              }
            />

            <div className={styles.modalActions}>
              <button
                className={styles.saveBtn}
                onClick={saveMessage}
              >
                Save Changes
              </button>

              <button
                className={styles.sendModalBtn}
                onClick={() =>
                  sendSingleSMS(selectedCustomer)
                }
              >
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sms;