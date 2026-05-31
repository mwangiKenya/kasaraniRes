import styles from "./Sms.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function Sms() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] =
  useState(new Date());

const [confirmedDate, setConfirmedDate] =
  useState(new Date());

  // current billing cycle
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // dates
  // =========================================
// DYNAMIC DATES
// =========================================

// reading date
const readingDate = confirmedDate;

// due date = reading date + 12 days
const dueDate = new Date(readingDate);

dueDate.setDate(
  dueDate.getDate() + 12
);

const formattedReadingDate =
  readingDate.toLocaleDateString("en-GB");

const formattedDueDate =
  dueDate.toLocaleDateString("en-GB");
  // =========================================
  // GENERATE DEFAULT SMS
  // =========================================
  const generateMessage = (customer) => {
    return `
    Dear ${customer.sms_name},
  Water Bill as at ${formattedReadingDate}
  Prev Read:${customer.prev_user}
  Curr Read:${customer.cur_user}
  Usage:${customer.units_used}
  Current Bill:KES ${Number(customer.bill).toLocaleString()}
  ${Number(customer.b_cd) > 0 ? `Bal b/d: KES ${Number(customer.b_cd).toLocaleString()}\n` : ""}
  To Pay:KES ${Number(customer.bal).toLocaleString()}
  Pay by ${formattedDueDate}
  Send Money:
  0723311564 Or
  M-PESA Buy Goods:
  Kamengo Agencies
  Till No 544783
  Or: Kamengo Agencies
  A/C No 01192576824400
  Coop Bank Or
  Kamengo Agencies
  A/C No 1750278558907
  Equity Bank
  Reach out:0741088799`.trim();
  };

  // =========================================
  // FETCH CUSTOMERS
  // =========================================
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://python-back-2.onrender.com/api/bill/"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await res.json();

      // prepare fresh data
      const preparedData = data.map((customer) => {
        const defaultMessage =
          generateMessage(customer);

        // unique billing signature
        // changes automatically whenever
        // readings/bill changes
        const billingSignature = `
          ${customer.prev_user}
          ${customer.cur_user}
          ${customer.units_used}
          ${customer.bill}
          ${customer.b_cd}
          ${customer.bal}
        `;

        // local storage
        const savedData = localStorage.getItem(
          `sms_${customer.id}`
        );

        let smsData = null;

        if (savedData) {
          smsData = JSON.parse(savedData);
        }

        // ====================================
        // CHECK IF NEW BILLING EXISTS
        // ====================================

        const isNewBillingCycle =
          !smsData ||
          smsData.month !== currentMonth ||
          smsData.year !== currentYear ||
          smsData.billingSignature !==
            billingSignature;

        // ====================================
        // RESET TO FRESH MONTH DATA
        // ====================================
        if (isNewBillingCycle) {
          const newSmsData = {
            message: defaultMessage,

            smsStatus: "Unsent",

            // IMPORTANT:
            // reset edit status
            editStatus: "Default",

            sentDate: "-",

            month: currentMonth,
            year: currentYear,

            billingSignature,
          };

          // save fresh data
          localStorage.setItem(
            `sms_${customer.id}`,
            JSON.stringify(newSmsData)
          );

          return {
            ...customer,
            ...newSmsData,
          };
        }

        // ====================================
        // KEEP OLD DATA IF SAME BILLING
        // ====================================
        return {
          ...customer,
          ...smsData,
        };
      });

      setCustomers(preparedData);

      // initialize editable messages
      const messages = {};

      preparedData.forEach((c) => {
        messages[c.id] = c.message;
      });

      setEditedMessages(messages);
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SAVE CUSTOMER DATA
  // =========================================
  const saveCustomerData = (
    customerId,
    updates
  ) => {
    const customer = customers.find(
      (c) => c.id === customerId
    );

    if (!customer) return;

    const updatedCustomer = {
      ...customer,
      ...updates,
    };

    localStorage.setItem(
      `sms_${customerId}`,
      JSON.stringify({
        message: updatedCustomer.message,

        smsStatus:
          updatedCustomer.smsStatus,

        editStatus:
          updatedCustomer.editStatus,

        sentDate:
          updatedCustomer.sentDate,

        month: currentMonth,
        year: currentYear,

        billingSignature:
          updatedCustomer.billingSignature,
      })
    );

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? updatedCustomer
          : c
      )
    );
  };

  // =========================================
  // CHECKBOX SELECTION
  // =========================================
  const handleSelect = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find(
        (c) => c.id === customer.id
      );

      if (exists) {
        return prev.filter(
          (c) => c.id !== customer.id
        );
      }

      return [...prev, customer];
    });
  };

  const isSelected = (customer) => {
    return selectedCustomers.some(
      (c) => c.id === customer.id
    );
  };

  // =========================================
  // SELECT ALL
  // =========================================
  const allSelected =
    customers.length > 0 &&
    selectedCustomers.length ===
      customers.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers);
    }
  };

  // =========================================
  // OPEN PREVIEW
  // =========================================
  const openPreview = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // =========================================
  // HANDLE MESSAGE EDIT
  // =========================================
  const handleMessageChange = (value) => {
    setEditedMessages((prev) => ({
      ...prev,
      [selectedCustomer.id]: value,
    }));
  };

  // =========================================
  // SAVE MESSAGE
  // =========================================
  const saveMessage = () => {
    saveCustomerData(
      selectedCustomer.id,
      {
        message:
          editedMessages[
            selectedCustomer.id
          ],

        editStatus: "Edited",
      }
    );

    toast.success(
      "SMS updated successfully"
    );

    setShowModal(false);
  };

  // =========================================
  // SEND SINGLE SMS
  // =========================================
  const sendSingleSMS = async (
    customer
  ) => {
    try {
      setSending(true);

      const payload = {
        customers: [
          {
            phone: customer.phone,

            message:
              editedMessages[
                customer.id
              ],
          },
        ],
      };

      const res = await fetch(
        "https://python-back-2.onrender.com/api/send_sms_view/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to send SMS"
        );
      }

      const sentDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

      saveCustomerData(customer.id, {
        message:
          editedMessages[customer.id],

        smsStatus: "Sent",

        sentDate,
      });

      toast.success(
        `SMS sent to ${customer.name}`
      );
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to send SMS"
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================
  // SEND SELECTED SMS
  // =========================================
  const sendSMS = async () => {
    if (
      selectedCustomers.length === 0
    ) {
      toast.info(
        "Select at least one customer"
      );

      return;
    }

    try {
      setSending(true);

      const formattedCustomers =
        selectedCustomers.map((c) => ({
          phone: c.phone,

          message:
            editedMessages[c.id],
        }));

      const res = await fetch(
        "https://python-back-2.onrender.com/api/send_sms_view/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customers:
              formattedCustomers,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to send SMS"
        );
      }

      const sentDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

      // update statuses
      selectedCustomers.forEach(
        (customer) => {
          saveCustomerData(
            customer.id,
            {
              message:
                editedMessages[
                  customer.id
                ],

              smsStatus: "Sent",

              sentDate,
            }
          );
        }
      );

      toast.success(
        "SMS sent successfully"
      );
    } catch (err) {
      console.log(err);

      toast.error(
        "Failed to send SMS"
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================
// CONFIRM DATE
// =========================================
const handleUseDate = () => {
  setConfirmedDate(selectedDate);

  toast.success(
    "Billing date updated"
  );

  // regenerate messages
  fetchCustomers();
};

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div
        className={styles.headerSection}
      >
        <div>
          <h1
            className={styles.header1}
          >
            SMS Dashboard
          </h1>

          <p
            className={styles.subtitle}
          >
            Manage, edit and send
            billing SMS 
          </p>
        </div>

        <button
          className={styles.sendBtn}
          onClick={sendSMS}
          disabled={sending}
        >
          {sending
            ? "Sending..."
            : "Send Selected SMS"}
        </button>

        <div className={styles.dateSection}>
         {/*<input
          type="date"
          value={
            selectedDate
              .toISOString()
              .split("T")[0]
          }
          onChange={(e) =>
            setSelectedDate(
              new Date(e.target.value)
            )
          }
        />*/}
        
        {/*
        <button
          className={styles.useDateBtn}
          onClick={handleUseDate}
        >
          Use This Date
        </button>*/}
      </div>
      </div>

      {/* TABLE */}
      <div
        className={styles.tableWrapper}
      >
        <table
          className={
            styles.tableContainer
          }
        >
          <thead
            className={
              styles.tableRowHeader
            }
          >
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>

              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={
                    handleSelectAll
                  }
                />
              </th>

              <th>SMS Status</th>

              <th>Edit Status</th>

              <th>Sent Date</th>

              <th>Preview</th>

              <th>Send</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">
                  Loading
                  customers...
                </td>
              </tr>
            ) : customers.length ===
              0 ? (
              <tr>
                <td colSpan="9">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  className={
                    styles.tableRow
                  }
                >
                  <td>{c.id}</td>

                  <td>{c.name}</td>

                  <td>{c.phone}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(
                        c
                      )}
                      onChange={() =>
                        handleSelect(c)
                      }
                    />
                  </td>

                  {/* SMS STATUS */}
                  <td>
                    <span
                      className={
                        c.smsStatus ===
                        "Sent"
                          ? styles.sentBadge
                          : styles.unsentBadge
                      }
                    >
                      {c.smsStatus}
                    </span>
                  </td>

                  {/* EDIT STATUS */}
                  <td>
                    <span
                      className={
                        c.editStatus ===
                        "Edited"
                          ? styles.editedBadge
                          : styles.defaultBadge
                      }
                    >
                      {c.editStatus}
                    </span>
                  </td>

                  {/* SENT DATE */}
                  <td>
                    {c.sentDate}
                  </td>

                  {/* PREVIEW */}
                  <td>
                    <button
                      className={
                        styles.previewBtn
                      }
                      onClick={() =>
                        openPreview(c)
                      }
                    >
                      Preview
                    </button>
                  </td>

                  {/* SEND */}
                  <td>
                    <button
                      className={
                        styles.singleSendBtn
                      }
                      onClick={() =>
                        sendSingleSMS(
                          c
                        )
                      }
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal &&
        selectedCustomer && (
          <div
            className={
              styles.modalOverlay
            }
          >
            <div
              className={
                styles.modalBox
              }
            >
              <div
                className={
                  styles.modalHeader
                }
              >
                <div>
                  <h2>
                    SMS Editor
                  </h2>

                  <p>
                    Editing SMS
                    for{" "}
                    <strong>
                      {
                        selectedCustomer.name
                      }
                    </strong>
                  </p>
                </div>

                <button
                  className={
                    styles.modalClose
                  }
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  ✕
                </button>
              </div>

              <textarea
                className={
                  styles.smsTextarea
                }
                value={
                  editedMessages[
                    selectedCustomer
                      .id
                  ] || ""
                }
                onChange={(e) =>
                  handleMessageChange(
                    e.target.value
                  )
                }
              />

              <div
                className={
                  styles.modalActions
                }
              >
                <button
                  className={
                    styles.saveBtn
                  }
                  onClick={
                    saveMessage
                  }
                >
                  Save Changes
                </button>

                <button
                  className={
                    styles.sendModalBtn
                  }
                  onClick={() =>
                    sendSingleSMS(
                      selectedCustomer
                    )
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