import styles from "./Reminder.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SMS_TYPES = {
  REMINDER: "REMINDER",
  DUE_FOR_DISCONNECTION: "DUE_FOR_DISCONNECTION",
  DISCONNECTION_NOTICE: "DISCONNECTION_NOTICE",
};

const SMS_TYPE_LABELS = {
  REMINDER: "Reminder",
  DUE_FOR_DISCONNECTION: "Due For Disconnection",
  DISCONNECTION_NOTICE: "Disconnection Notice",
};

function Reminder() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [extraPhones, setExtraPhones] = useState({});
  const [newPhone, setNewPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [globalSmsType, setGlobalSmsType] = useState(SMS_TYPES.REMINDER);

  const [selectedDueDate, setSelectedDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [confirmedDueDate, setConfirmedDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });

  const [selectedReadingDate, setSelectedReadingDate] = useState(() => {
    const d = new Date();
    return d;
  });

  const [confirmedReadingDate, setConfirmedReadingDate] = useState(() => {
    const d = new Date();
    return d;
  });

  const formattedReadingDate = confirmedReadingDate.toLocaleDateString("en-GB");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const formattedDueDate = confirmedDueDate.toLocaleDateString("en-GB");

  // =========================================
  // APPLY DATE PLACEHOLDERS
  // =========================================
  const applyDates = (message) => {
    const msg = String(message ?? "");
    return msg
      .replaceAll("{{DUE_DATE}}", formattedDueDate)
      .replaceAll("{{READING_DATE}}", formattedReadingDate);
  };

  // =========================================
  // HELPER: IS PARENT
  // =========================================
  const isParent = (customer) => {
    return String(customer.parent).toLowerCase() === "yes";
  };

  // =========================================
  // HELPER: GET GROUP CUSTOMERS
  // =========================================
  const getGroupCustomers = (customer) => {
    if (!customer.grp) return [customer];
    return customers.filter((c) => c.grp === customer.grp);
  };

  // =========================================
  // HELPER: GET AMOUNT
  // =========================================
  const getAmount = (customer) => {
    return Number(customer.bal) > 0
      ? `KES ${Number(customer.bal).toLocaleString()}`
      : `KES ${Number(customer.bill).toLocaleString()}`;
  };

  const getGroupTotal = (groupCustomers) => {
    let total = 0;
    groupCustomers.forEach((c) => {
      total += Number(c.bal) > 0 ? Number(c.bal) : Number(c.bill || 0);
    });
    return total;
  };

  // =========================================
  // PHONE MANAGEMENT
  // =========================================
  const getCustomerPhones = (customer) => {
    const saved = extraPhones[customer.id] || [];
    const primaryExists = saved.find((p) => p.number === customer.phone);
    if (primaryExists) return saved;
    return [{ number: customer.phone, primary: true, selected: true }, ...saved];
  };

  const savePhones = (customerId, phones) => {
    localStorage.setItem(`phones_${customerId}`, JSON.stringify(phones));
    setExtraPhones((prev) => ({ ...prev, [customerId]: phones }));
  };

  const addPhoneNumber = (customerId, phone) => {
    if (!phone.trim()) return;
    const customer = customers.find((c) => c.id === customerId);
    const current = getCustomerPhones(customer);
    const updated = [...current, { number: phone, selected: true }];
    savePhones(customerId, updated);
    setNewPhone("");
  };

  const deletePhoneNumber = (customerId, number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer.phone === number) {
      toast.info("Primary number cannot be deleted");
      return;
    }
    const current = getCustomerPhones(customer);
    const updated = current.filter((p) => p.number !== number);
    savePhones(customerId, updated);
  };

  const togglePhoneSelection = (customerId, number) => {
    const phones = getCustomerPhones(customers.find((c) => c.id === customerId));
    const updated = phones.map((p) =>
      p.number === number ? { ...p, selected: !p.selected } : p
    );
    savePhones(customerId, updated);
  };

  // =========================================
  // TEMPLATE GENERATORS
  // =========================================
  const generateReminderMessage = (customer) => {
    const groupCustomers = getGroupCustomers(customer);
    const isSingle = groupCustomers.length === 1;
    const parentCustomer = groupCustomers.find(isParent);
    const sender = parentCustomer || customer;

    if (isSingle) {
      const c = groupCustomers[0];
      const outstanding = getAmount(c);

      return `BILL PAST DUE DATE

Your Water Bill as at reading
date:{{READING_DATE}} ${outstanding} was due
on {{DUE_DATE}}. It is now past due
date.

Mpesa Send money 0723311564

Or buy goods name, Kamengo
Agencies Till Number 544783.

Or deposit to: Kamengo Agencies
a/c No. 01192576824400
Coop Bank
TRM Branch

Or deposit to: Kamengo Agencies
a/c No. 1750278558907
Equity Bank
Garden city Branch

Thank you

Contact us on: 0741088799`.trim();
    }

    let total = 0;
    const breakdown = groupCustomers.map((c) => {
      const amount = Number(c.bal) > 0 ? Number(c.bal) : Number(c.bill || 0);
      total += amount;
      return `${c.sms_name}: KES ${amount.toLocaleString()}`;
    }).join("\n");

    return `Dear ${sender.sms_name},
This is a reminder for outstanding water bills due by {{DUE_DATE}}.

${breakdown}

Total: KES ${total.toLocaleString()}

Kindly clear your balance to avoid disconnection.

Send Money: 0723311564

Or: M-PESA Buy Goods:
Kamengo Agencies
Till No 544783

Or: Kamengo Agencies
A/C No 01192576824400
Coop Bank

A/C No 1750278558907
Equity Bank

Contact us on: 0741088799`.trim();
  };

  const generateDisconnectionDueMessage = (customer) => {
    const groupCustomers = getGroupCustomers(customer);
    const isSingle = groupCustomers.length === 1;
    const parentCustomer = groupCustomers.find(isParent);
    const sender = parentCustomer || customer;

    if (isSingle) {
      const c = groupCustomers[0];
      const outstanding = getAmount(c);

      return `DUE FOR DISCONNECTION

Your Water Bill as at reading
date:{{READING_DATE}} ${outstanding} was due
on {{DUE_DATE}}. It is past due and
due for disconnection.

Note that once disconnected, a
reconnection charge of KES 500
applies.

Mpesa Send money 0723311564

Or buy goods, Kamengo Agencies
Till No. 544783.

Or deposit to: Kamengo Agencies
a/c No. 01192576824400
Coop Bank
TRM Branch

Or deposit to: Kamengo Agencies
a/c No. 1750278558907
Equity Bank
Garden city Branch

Contact us on: 0741088799`.trim();
    }

    let total = 0;
    const breakdown = groupCustomers.map((c) => {
      const amount = Number(c.bal) > 0 ? Number(c.bal) : Number(c.bill || 0);
      total += amount;
      return `${c.sms_name}: KES ${amount.toLocaleString()}`;
    }).join("\n");

    return `Dear ${sender.sms_name},
Your water bills are past due and your account is due for disconnection by {{DUE_DATE}}.

${breakdown}

Total: KES ${total.toLocaleString()}

Note that once disconnected, a reconnection charge of KES 500 applies.

Send Money: 0723311564

Or: M-PESA Buy Goods:
Kamengo Agencies
Till No 544783

Or: Kamengo Agencies
A/C No 01192576824400
Coop Bank

A/C No 1750278558907
Equity Bank

Contact us on: 0741088799`.trim();
  };

  const generateDisconnectionNoticeMessage = (customer) => {
    const groupCustomers = getGroupCustomers(customer);
    const parentCustomer = groupCustomers.find(isParent);
    const sender = parentCustomer || customer;

    const isSingle = groupCustomers.length === 1;

    if (isSingle) {
      const c = groupCustomers[0];
      const amount =
        Number(c.bal) > 0
          ? Number(c.bal)
          : Number(c.bill);

      const toPay = amount + 500;
      return `DISCONNECTION NOTICE

Kindly note that your water is
disconnected due to non payment.

The account will be reconnected
on full payment.

An additional reconnection fee of
KES 500 has been charged on your
account as per agreement.

Kindly pay ${toPay.toLocaleString()} for
reconnection.

Thankyou.

Contact us on: 0741088799`.trim();
    }

    let total = 0;
    const breakdown = groupCustomers.map((c) => {
      const amount = Number(c.bal) > 0 ? Number(c.bal) : Number(c.bill || 0);
      total += amount;
      return `${c.sms_name}: KES ${amount.toLocaleString()}`;
    }).join("\n");

    return `Dear ${sender.sms_name},
DISCONNECTION NOTICE

Kindly note that your water is disconnected due to non payment.

The account will be reconnected on full payment.

An additional reconnection fee of KES 500 has been charged on your account as per agreement.

${breakdown}

Total due for reconnection: KES ${total.toLocaleString()}

Thankyou.

Contact us on: 0741088799`.trim();
  };

  // =========================================
  // MASTER MESSAGE GENERATOR
  // =========================================
  const generateMessageByType = (customer, smsType) => {
    switch (smsType) {
      case SMS_TYPES.DUE_FOR_DISCONNECTION:
        return generateDisconnectionDueMessage(customer);
      case SMS_TYPES.DISCONNECTION_NOTICE:
        return generateDisconnectionNoticeMessage(customer);
      case SMS_TYPES.REMINDER:
      default:
        return generateReminderMessage(customer);
    }
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

      const res = await fetch("https://python-back-2.onrender.com/api/bill/");

      if (!res.ok) throw new Error("Failed to fetch customers");

      const data = await res.json();

      const preparedData = data.map((customer) => {
        const billingSignature = `
          ${customer.prev_user}
          ${customer.cur_user}
          ${customer.units_used}
          ${customer.bill}
          ${customer.b_cd}
          ${customer.bal}
        `;

        const savedData = localStorage.getItem(`reminder_${customer.id}`);
        let reminderData = savedData ? JSON.parse(savedData) : null;

        const isNewBillingCycle =
          !reminderData ||
          reminderData.month !== currentMonth ||
          reminderData.year !== currentYear ||
          reminderData.billingSignature !== billingSignature;

        const smsType = reminderData?.smsType || SMS_TYPES.REMINDER;

        if (isNewBillingCycle) {
          const defaultMessage = generateMessageByType(customer, SMS_TYPES.REMINDER);
          const fresh = {
            message: defaultMessage,
            reminderStatus: "Unsent",
            editStatus: "Default",
            sentDate: "-",
            month: currentMonth,
            year: currentYear,
            billingSignature,
            smsType: SMS_TYPES.REMINDER,
          };
          localStorage.setItem(`reminder_${customer.id}`, JSON.stringify(fresh));
          return { ...customer, ...fresh };
        }

        let migratedMessage = reminderData.message
          .replace(/due by .*/g, "due by {{DUE_DATE}}")
          .replace(/Pay by .*/g, "Pay by {{DUE_DATE}}");
        migratedMessage = migratedMessage.replace(
          /reading\s*date:[^\n]*/gi,
          "reading date:{{READING_DATE}}"
        );

        return { ...customer, ...reminderData, message: migratedMessage, smsType };
      });

      setCustomers(preparedData);

      const phoneData = {};
      preparedData.forEach((c) => {
        const saved = localStorage.getItem(`phones_${c.id}`);
        phoneData[c.id] = saved ? JSON.parse(saved) : [];
      });
      setExtraPhones(phoneData);

      const messages = {};
      preparedData.forEach((c) => {
        messages[c.id] = c.message;
      });
      setEditedMessages(messages);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SAVE CUSTOMER DATA
  // =========================================
  const saveCustomerData = (customerId, updates) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const updatedCustomer = { ...customer, ...updates };

    localStorage.setItem(
      `reminder_${customerId}`,
      JSON.stringify({
        message: updatedCustomer.message,
        reminderStatus: updatedCustomer.reminderStatus,
        editStatus: updatedCustomer.editStatus,
        sentDate: updatedCustomer.sentDate,
        month: currentMonth,
        year: currentYear,
        billingSignature: updatedCustomer.billingSignature,
        smsType: updatedCustomer.smsType,
      })
    );

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? updatedCustomer : c))
    );
  };

  // =========================================
  // GLOBAL SMS TYPE CHANGE
  // =========================================
  const handleGlobalSmsTypeChange = (newType) => {
    setGlobalSmsType(newType);
    setCustomers((prev) =>
      prev.map((c) => {
        const newMessage = generateMessageByType(c, newType);
        const updated = { ...c, smsType: newType, message: newMessage, editStatus: "Default" };
        localStorage.setItem(
          `reminder_${c.id}`,
          JSON.stringify({
            message: newMessage,
            reminderStatus: updated.reminderStatus,
            editStatus: "Default",
            sentDate: updated.sentDate,
            month: currentMonth,
            year: currentYear,
            billingSignature: updated.billingSignature,
            smsType: newType,
          })
        );
        return updated;
      })
    );
    setEditedMessages((prev) => {
      const updated = { ...prev };
      customers.forEach((c) => {
        updated[c.id] = generateMessageByType(c, newType);
      });
      return updated;
    });
  };

  // =========================================
  // PER-CUSTOMER SMS TYPE CHANGE
  // =========================================
  const handleCustomerSmsTypeChange = (customerId, newType) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    const newMessage = generateMessageByType(customer, newType);
    saveCustomerData(customerId, { smsType: newType, message: newMessage, editStatus: "Default" });
    setEditedMessages((prev) => ({ ...prev, [customerId]: newMessage }));
  };

  // =========================================
  // CHECKBOX SELECTION
  // =========================================
  const handleSelect = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);
      if (exists) return prev.filter((c) => c.id !== customer.id);
      return [...prev, customer];
    });
  };

  const isSelected = (customer) =>
    selectedCustomers.some((c) => c.id === customer.id);

  const allSelected =
    customers.length > 0 &&
    selectedCustomers.length === customers.length;

  const handleSelectAll = () => {
    if (allSelected) setSelectedCustomers([]);
    else setSelectedCustomers(customers);
  };

  // =========================================
  // FILTERED CUSTOMERS LIST
  // =========================================
  const displayedCustomers = filterOverdue
    ? customers.filter((c) => Number(c.bal) > 0 || Number(c.bill) > 0)
    : customers;

  // =========================================
  // OPEN PREVIEW MODAL
  // =========================================
  const openPreview = (customer) => {
    const smsType = customer.smsType || SMS_TYPES.REMINDER;
    const msg = generateMessageByType(customer, smsType);
    setEditedMessages((prev) => ({ ...prev, [customer.id]: msg }));
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // =========================================
  // HANDLE MESSAGE EDIT
  // =========================================
  const handleMessageChange = (value) => {
    let storedValue = value;

    storedValue = storedValue.replaceAll(formattedDueDate, "{{DUE_DATE}}");
    storedValue = storedValue.replaceAll(formattedReadingDate, "{{READING_DATE}}");

    setEditedMessages((prev) => ({
      ...prev,
      [selectedCustomer.id]: storedValue,
    }));
  };

  const handleUseReadingDate = () => {
    setConfirmedReadingDate(selectedReadingDate);
    toast.success("Reading date updated");
  };

  // =========================================
  // SAVE MESSAGE
  // =========================================
  const saveMessage = () => {
    saveCustomerData(selectedCustomer.id, {
      message: editedMessages[selectedCustomer.id],
      editStatus: "Edited",
    });
    toast.success("Reminder updated successfully");
    setShowModal(false);
  };

  // =========================================
  // APPLY DATE BUTTON
  // =========================================
  const handleUseDate = () => {
    setConfirmedDueDate(selectedDueDate);
    toast.success("Due date updated");
  };

  // =========================================
  // SEND SINGLE REMINDER
  // =========================================
  const sendSingleReminder = async (customer) => {
    if (!isParent(customer)) {
      toast.info("Only parent contacts can receive this reminder");
      return;
    }

    try {
      setSending(true);

      const groupCustomers = getGroupCustomers(customer);
      const parentCustomer = groupCustomers.find(isParent);
      const sender = parentCustomer || customer;

      const smsType = customer.smsType || SMS_TYPES.REMINDER;
      const message = generateMessageByType(sender, smsType);

      const savedPhones = getCustomerPhones(sender);
      const selectedPhones = savedPhones.filter((p) => p.selected);

      const recipients =
        selectedPhones.length > 0
          ? selectedPhones.map((p) => ({ phone: p.number, message: applyDates(message) }))
          : [{ phone: sender.phone, message: applyDates(message) }];

      const res = await fetch("https://python-back-2.onrender.com/api/send_sms_view/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: recipients }),
      });

      if (!res.ok) throw new Error("Failed to send reminder");

      const sentDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

      groupCustomers.forEach((c) => {
        saveCustomerData(c.id, {
          message: editedMessages[c.id],
          reminderStatus: "Sent",
          sentDate,
        });
      });

      toast.success(`Reminder sent to ${customer.sms_name}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send reminder");
    } finally {
      setSending(false);
    }
  };

  // =========================================
  // SEND SELECTED REMINDERS
  // =========================================
  const sendSelectedReminders = async () => {
    if (selectedCustomers.length === 0) {
      toast.info("Select at least one customer");
      return;
    }

    try {
      setSending(true);

      const uniqueGroups = {};
      selectedCustomers.forEach((c) => {
        if (!c.grp) return;
        if (!isParent(c)) {
          toast.info(`${c.sms_name} is not a primary receiver`);
          return;
        }
        uniqueGroups[c.grp] = c;
      });

      const formattedCustomers = [];

      Object.values(uniqueGroups).forEach((customer) => {
        const groupCustomers = customers.filter((c) => c.grp === customer.grp);
        const parentCustomer = groupCustomers.find(isParent);
        const sender = parentCustomer || customer;

        const smsType = customer.smsType || SMS_TYPES.REMINDER;
        const message = generateMessageByType(sender, smsType);

        const savedPhones = getCustomerPhones(sender);
        const selectedPhones = savedPhones.filter((p) => p.selected);

        if (selectedPhones.length > 0) {
          selectedPhones.forEach((p) => {
            formattedCustomers.push({ phone: p.number, message: applyDates(message) });
          });
        } else {
          formattedCustomers.push({ phone: sender.phone, message: applyDates(message) });
        }

        groupCustomers.forEach((c) => {
          saveCustomerData(c.id, {
            message: editedMessages[c.id],
            reminderStatus: "Sent",
            sentDate: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          });
        });
      });

      const res = await fetch("https://python-back-2.onrender.com/api/send_sms_view/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: formattedCustomers }),
      });

      if (!res.ok) throw new Error("Failed to send reminders");

      toast.success("Reminders sent successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send reminders");
    } finally {
      setSending(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.header1}>Reminder Dashboard</h1>
          <p className={styles.subtitle}>
            Compose and send payment reminder SMS to customers
          </p>
        </div>

        <button
          className={styles.sendBtn}
          onClick={sendSelectedReminders}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Selected Reminders"}
        </button>

        {/* DATE + FILTER CONTROLS */}
        <div className={styles.controls}>
          <div className={styles.dateSection}>
            <div>
              <label>Pay By Date</label>
              <input
                type="date"
                value={selectedDueDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDueDate(new Date(e.target.value))}
              />
            </div>
            <button className={styles.useDateBtn} onClick={handleUseDate}>
              Apply Date
            </button>
          </div>

          <div className={styles.dateSection}>
            <div>
              <label>Reading Date</label>
              <input
                type="date"
                value={selectedReadingDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setSelectedReadingDate(new Date(e.target.value))
                }
              />
            </div>
            <button
              className={styles.useDateBtn}
              onClick={handleUseReadingDate}
            >
              Apply Reading Date
            </button>
          </div>

          {/* GLOBAL SMS TYPE SELECTOR */}
          <div className={styles.dateSection}>
            <div>
              <label>SMS Type For All Customers</label>
              <select
                value={globalSmsType}
                onChange={(e) => handleGlobalSmsTypeChange(e.target.value)}
                className={styles.smsTypeSelect}
              >
                <option value={SMS_TYPES.REMINDER}>Reminder</option>
                <option value={SMS_TYPES.DUE_FOR_DISCONNECTION}>Due For Disconnection</option>
                <option value={SMS_TYPES.DISCONNECTION_NOTICE}>Disconnection Notice</option>
              </select>
            </div>
          </div>

          <label className={styles.filterToggle}>
            <input
              type="checkbox"
              checked={filterOverdue}
              onChange={() => setFilterOverdue((v) => !v)}
            />
            Show only customers with outstanding balance
          </label>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.tableContainer}>
          <thead className={styles.tableRowHeader}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Balance (KES)</th>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>SMS Type</th>
              <th>Reminder Status</th>
              <th>Edit Status</th>
              <th>Sent Date</th>
              <th>Preview</th>
              <th>Send</th>
              <th>Group</th>
              <th>Parent</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13">Loading customers...</td>
              </tr>
            ) : displayedCustomers.length === 0 ? (
              <tr>
                <td colSpan="13">No customers found</td>
              </tr>
            ) : (
              displayedCustomers.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td>{c.id}</td>
                  <td>{c.sms_name}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span
                      className={
                        Number(c.bal) > 0
                          ? styles.balanceOwed
                          : styles.balanceClear
                      }
                    >
                      {Number(c.bal) > 0
                        ? `${Number(c.bal).toLocaleString()}`
                        : "0"}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(c)}
                      onChange={() => handleSelect(c)}
                    />
                  </td>

                  {/* SMS TYPE */}
                  <td>
                    <select
                      value={c.smsType || SMS_TYPES.REMINDER}
                      onChange={(e) =>
                        handleCustomerSmsTypeChange(c.id, e.target.value)
                      }
                      className={styles.smsTypeSelect}
                    >
                      <option value={SMS_TYPES.REMINDER}>Reminder</option>
                      <option value={SMS_TYPES.DUE_FOR_DISCONNECTION}>Due For Disconnection</option>
                      <option value={SMS_TYPES.DISCONNECTION_NOTICE}>Disconnection Notice</option>
                    </select>
                  </td>

                  {/* REMINDER STATUS */}
                  <td>
                    <span
                      className={
                        c.reminderStatus === "Sent"
                          ? styles.sentBadge
                          : styles.unsentBadge
                      }
                    >
                      {c.reminderStatus}
                    </span>
                  </td>

                  {/* EDIT STATUS */}
                  <td>
                    <span
                      className={
                        c.editStatus === "Edited"
                          ? styles.editedBadge
                          : styles.defaultBadge
                      }
                    >
                      {c.editStatus}
                    </span>
                  </td>

                  <td>{c.sentDate}</td>

                  {/* PREVIEW */}
                  <td>
                    <button
                      className={styles.previewBtn}
                      onClick={() => openPreview(c)}
                    >
                      Preview
                    </button>
                  </td>

                  {/* SEND */}
                  <td>
                    <button
                      className={styles.singleSendBtn}
                      onClick={() => sendSingleReminder(c)}
                      disabled={sending}
                    >
                      Send
                    </button>
                  </td>

                  <td>{c.grp}</td>
                  <td>{c.parent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selectedCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Reminder Editor</h2>
                <p>
                  Editing reminder for{" "}
                  <strong>{selectedCustomer.sms_name}</strong>
                  {" — "}
                  <em>{SMS_TYPE_LABELS[selectedCustomer.smsType || SMS_TYPES.REMINDER]}</em>
                </p>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* PHONE MANAGEMENT */}
            <div className={styles.phoneSection}>
              <h4>SMS Recipients</h4>

              {getCustomerPhones(selectedCustomer).map((p, index) => (
                <div key={index} className={styles.phoneRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() =>
                        togglePhoneSelection(selectedCustomer.id, p.number)
                      }
                    />
                    {p.number}
                    {p.primary && " (Primary)"}
                  </label>
                  {!p.primary && (
                    <button
                      className={styles.deletePhoneBtn}
                      onClick={() =>
                        deletePhoneNumber(selectedCustomer.id, p.number)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}

              <div className={styles.addPhone}>
                <input
                  type="text"
                  placeholder="Add phone number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <button
                  onClick={() =>
                    addPhoneNumber(selectedCustomer.id, newPhone)
                  }
                >
                  Add
                </button>
              </div>
            </div>

            {/* MESSAGE TEXTAREA */}
            <textarea
              className={styles.smsTextarea}
              value={applyDates(editedMessages[selectedCustomer.id] || "")}
              onChange={(e) => handleMessageChange(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveMessage}>
                Save Changes
              </button>
              <button
                className={styles.sendModalBtn}
                onClick={() => sendSingleReminder(selectedCustomer)}
                disabled={sending}
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminder;