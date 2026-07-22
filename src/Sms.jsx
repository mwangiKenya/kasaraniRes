import styles from "./Sms.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

// =========================================
// SAFE DATE LOADER (persists across sessions,
// never silently falls back to "today" unless
// nothing valid has ever been saved)
// =========================================
const loadStoredDate = (key, fallbackFn) => {
  const saved = localStorage.getItem(key);

  if (saved) {
    const parsed = new Date(saved);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallbackFn();
};

function Sms() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [extraPhones, setExtraPhones] = useState({});
  const [newPhone, setNewPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");

  // =========================================
  // BILLING / DUE DATES
  // These are ONLY ever changed when the user
  // explicitly clicks "Apply Dates". They are
  // never reset to "today" on reload or on a
  // new billing cycle.
  // =========================================
  const [selectedDate, setSelectedDate] = useState(() =>
    loadStoredDate("billingDate", () => new Date())
  );

  const [confirmedDate, setConfirmedDate] = useState(() =>
    loadStoredDate("billingDate", () => new Date())
  );

  const [selectedDueDate, setSelectedDueDate] = useState(() =>
    loadStoredDate("dueDate", () => {
      const d = new Date();
      d.setDate(d.getDate() + 12);
      return d;
    })
  );

  const [confirmedDueDate, setConfirmedDueDate] = useState(() =>
    loadStoredDate("dueDate", () => {
      const d = new Date();
      d.setDate(d.getDate() + 12);
      return d;
    })
  );

  // State for discount/penalty modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustingCustomer, setAdjustingCustomer] = useState(null);

  // current billing cycle
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // dates
  // =========================================
  // DYNAMIC DATES
  // =========================================

  // reading date
  const readingDate = confirmedDate;

  // due date
  const dueDate = confirmedDueDate;

  const formattedReadingDate = readingDate.toLocaleDateString("en-GB");
  const formattedDueDate = dueDate.toLocaleDateString("en-GB");

  const applyDates = (message) => {
    const msg = String(message ?? "");
    return msg
      .replaceAll("{{READING_DATE}}", formattedReadingDate)
      .replaceAll("{{DUE_DATE}}", formattedDueDate);
  };

  // =========================================
  // EXTRA PHONE NUMBERS (LOCAL STORAGE)
  // =========================================

  const getCustomerPhones = (customer) => {
    const saved = extraPhones[customer.id] || [];

    // remove all old primary numbers
    const extrasOnly = saved.filter((p) => !p.primary);

    return [
      {
        number: customer.phone,
        primary: true,
        selected: true,
      },
      ...extrasOnly,
    ];
  };

  const loadExtraPhones = () => {
    const data = {};

    customers.forEach((c) => {
      const saved = localStorage.getItem(`phones_${c.id}`);

      data[c.id] = saved ? JSON.parse(saved) : [];
    });

    setExtraPhones(data);
  };

  const savePhones = (customerId, phones) => {
    localStorage.setItem(`phones_${customerId}`, JSON.stringify(phones));

    setExtraPhones((prev) => ({
      ...prev,
      [customerId]: phones,
    }));
  };

  // =========================================
  // ADJUSTMENT (PENALTY / DISCOUNT) HELPERS
  // These build the transparent breakdown lines
  // shown on the SMS. We NEVER hide the math -
  // Current Bill, Bal b/d, Penalty and Discount
  // are all shown as their own figures, and the
  // final "To Pay" is the number the customer
  // actually owes once everything is applied.
  // =========================================
  const buildAdjustmentLines = (c) => {
    let balanceLine = "";
    let adjustmentLine = "";

    const penalty = Number(c.penalty || 0);
    const discount = Number(c.discount || 0);

    if (Number(c.b_cd) > 0) {
      balanceLine = `Bal b/d:KES ${Number(c.b_cd).toLocaleString()}\n`;
    } else if (Number(c.b_cd) < 0) {
      balanceLine = `Bal b/d:KES (${Math.abs(Number(c.b_cd)).toLocaleString()})\n`;
    }

    if (penalty > 0) {
      adjustmentLine += `Penalty: KES ${penalty.toLocaleString()}\n`;
    }

    if (discount > 0) {
      adjustmentLine += `Discount: KES ${discount.toLocaleString()}\n`;
    }

    // Bal already represents (Current Bill + Bal b/d) from the backend.
    // We only ever add the penalty / subtract the discount on top of it,
    // so the customer can trace exactly how "To Pay" was reached from
    // the figures shown above it.
    let finalToPay = Number(c.bal || 0);

    if (penalty > 0) {
      finalToPay += penalty;
    }

    if (discount > 0) {
      finalToPay -= discount;
    }

    // If there's no carried-forward balance and no penalty/discount, the
    // amount to pay is identical to the Current Bill already shown above -
    // showing "To Pay" again would just be repeating the same figure, so
    // we leave it out and let "Current Bill" stand as the amount owed.
    const hasBalance = Number(c.b_cd) !== 0;
    const hasAdjustment = penalty > 0 || discount > 0;
    const showToPay = hasBalance || hasAdjustment;

    const toPayLine = showToPay ? `To Pay:KES ${finalToPay.toLocaleString()}\n` : "";

    return { balanceLine, adjustmentLine, toPayLine, finalToPay, penalty, discount, showToPay };
  };

  // =========================================
  // GENERATE DEFAULT SMS
  // =========================================
  const generateMessage = (customer) => {
    const { balanceLine, adjustmentLine, toPayLine } = buildAdjustmentLines(customer);

    return `
    Dear ${customer.sms_name},
Water Bill as at {{READING_DATE}}
Prev Read:${customer.prev_user}
Curr Read:${customer.cur_user}
Usage:${customer.units_used}
Current Bill:KES ${Number(customer.bill).toLocaleString()}
${balanceLine}${adjustmentLine}${toPayLine}
Pay by {{DUE_DATE}}

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

  const getGroupCustomers = (customer) => {
    if (!customer.grp) {
      return [customer];
    }
    return customers.filter((c) => c.grp === customer.grp);
  };

  const generateGroupMessage = (customer) => {
    const groupCustomers = customer.__groupCustomers || getGroupCustomers(customer);
    const isSingle = groupCustomers.length === 1;

    const parentCustomer = groupCustomers.find(isParent);
    const sender = parentCustomer || customer;

    // =========================
    // SINGLE USER FORMAT
    // =========================
    if (isSingle) {
      const c = groupCustomers[0];

      const { balanceLine, adjustmentLine, toPayLine } = buildAdjustmentLines(c);

      return `
Dear ${c.sms_name},
Water Bill as at {{READING_DATE}}
Prev Read:${c.prev_user}
Curr Read:${c.cur_user}
Usage:${c.units_used}
Current Bill:KES ${Number(c.bill).toLocaleString()}
${balanceLine}${adjustmentLine}${toPayLine}
Pay by {{DUE_DATE}}

Send Money: 0723311564

Or: M-PESA Buy Goods:
Kamengo Agencies
Till No 544783

Or: Kamengo Agencies
A/C No 01192576824400
Coop Bank

A/C No 1750278558907
Equity Bank

Contact us on: 0741088799
    `.trim();
    }

    // =========================
    // MULTI USER FORMAT
    // =========================
    let totalBase = 0; // sum of each member's (bill + bal b/d)
    let totalPenalty = 0;
    let totalDiscount = 0;

    const breakdown = groupCustomers
      .map((c) => {
        const bill = Number(c.bill || 0);

        const { balanceLine, adjustmentLine, penalty, discount } = buildAdjustmentLines(c);

        // Base amount for this member BEFORE penalty/discount, i.e. bill + bal b/d.
        // "bal" already represents (Current Bill + Bal b/d) from the backend.
        totalBase += Number(c.bal || 0);
        totalPenalty += penalty;
        totalDiscount += discount;

        return `
${c.sms_name}
Prev Read:${c.prev_user}
Curr Read:${c.cur_user}
Usage:${c.units_used}
Current Bill:KES ${bill.toLocaleString()}
${balanceLine}${adjustmentLine}
    `.trim();
      })
      .join("\n\n");

    let totalAdjustmentLine = "";
    if (totalPenalty > 0) {
      totalAdjustmentLine += `\nTotal Penalty: KES ${totalPenalty.toLocaleString()}`;
    }
    if (totalDiscount > 0) {
      totalAdjustmentLine += `\nTotal Discount: KES ${totalDiscount.toLocaleString()}`;
    }

    // Grand total to pay includes every member's own bill + bal b/d,
    // plus the penalty, minus the discount - so nothing is hidden and
    // every connection's adjustment is reflected in the final figure.
    const finalTotal = totalBase + totalPenalty - totalDiscount;

    return `
Dear ${sender.sms_name},
Water Bill as at {{READING_DATE}}

${breakdown}
${totalAdjustmentLine}
To pay:KES ${finalTotal.toLocaleString()}

Pay by {{DUE_DATE}}

Send Money:0723311564

Or: M-PESA Buy Goods:
Kamengo Agencies
Till No 544783

Or: Kamengo Agencies
A/C No 01192576824400
Coop Bank

A/C No 1750278558907
Equity Bank

Contact us on: 0741088799
  `.trim();
  };

  const getCustomerMessage = (customer) => {
    const edited = editedMessages[customer.id];

    if (edited) {
      return edited;
    }

    if (customer.message) {
      return customer.message;
    }

    return generateGroupMessage(customer);
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

      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await res.json();

      // prepare fresh data
      const preparedData = data.map((customer) => {
        const defaultMessage = generateMessage(customer);

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
        const savedData = localStorage.getItem(`sms_${customer.id}`);

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
          smsData.billingSignature !== billingSignature;

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

            // Initialize penalty and discount
            penalty: 0,
            discount: 0,
          };

          // save fresh data
          localStorage.setItem(`sms_${customer.id}`, JSON.stringify(newSmsData));

          return {
            ...customer,
            ...newSmsData,
          };
        }

        // ====================================
        // KEEP OLD DATA IF SAME BILLING
        // ====================================

        let migratedMessage = smsData.message
          .replace(/Water Bill as at .*/g, "Water Bill as at {{READING_DATE}}")
          .replace(/Pay by .*/g, "Pay by {{DUE_DATE}}");

        return {
          ...customer,
          ...smsData,
          message: migratedMessage,
          penalty: smsData.penalty || 0,
          discount: smsData.discount || 0,
        };
      }); // <-- CLOSE data.map() HERE

      setCustomers(preparedData);

      const phoneData = {};

      preparedData.forEach((c) => {
        const saved = localStorage.getItem(`phones_${c.id}`);

        phoneData[c.id] = saved ? JSON.parse(saved) : [];
      });

      setExtraPhones(phoneData);
      // initialize editable messages
      const messages = {};

      preparedData.forEach((c) => {
        // Always use the FULL prepared customer list
        const groupCustomers = c.grp ? preparedData.filter((x) => x.grp === c.grp) : [c];

        if (c.editStatus === "Edited") {
          messages[c.id] = c.message;
        } else {
          messages[c.id] = generateGroupMessage({
            ...c,
            __groupCustomers: groupCustomers,
          });
        }
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

    const updatedCustomer = {
      ...customer,
      ...updates,
    };

    localStorage.setItem(
      `sms_${customerId}`,
      JSON.stringify({
        message: updatedCustomer.message,

        smsStatus: updatedCustomer.smsStatus,

        editStatus: updatedCustomer.editStatus,

        sentDate: updatedCustomer.sentDate,

        month: currentMonth,
        year: currentYear,

        billingSignature: updatedCustomer.billingSignature,

        penalty: updatedCustomer.penalty || 0,
        discount: updatedCustomer.discount || 0,
      })
    );

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? updatedCustomer : c)));

    // Update the edited message with the new message
    setEditedMessages((prev) => ({
      ...prev,
      [customerId]: updatedCustomer.message,
    }));

    // If this customer is currently selected in the modal, update the selected customer
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updatedCustomer);
    }

    return updatedCustomer;
  };

  // =========================================
  // PHONE MANAGEMENT
  // =========================================

  const addPhoneNumber = (customerId, phone) => {
    if (!phone.trim()) return;

    const customer = customers.find((c) => c.id === customerId);

    const current = getCustomerPhones(customer);

    const updated = [
      ...current,
      {
        number: phone,
        selected: true,
      },
    ];

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
      p.number === number
        ? {
            ...p,
            selected: !p.selected,
          }
        : p
    );

    savePhones(customerId, updated);
  };

  // =========================================
  // CHECKBOX SELECTION
  // =========================================
  const handleSelect = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);

      if (exists) {
        return prev.filter((c) => c.id !== customer.id);
      }

      return [...prev, customer];
    });
  };

  const isSelected = (customer) => {
    return selectedCustomers.some((c) => c.id === customer.id);
  };
  // =========================================
  // SELECT ALL
  // =========================================
  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length;

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
    setEditedMessages((prev) => ({
      ...prev,
      [customer.id]: getCustomerMessage(customer),
    }));

    setSelectedCustomer(customer);
    setShowModal(true);
  };
  // =========================================
  // HANDLE MESSAGE EDIT
  // =========================================
  const handleMessageChange = (value) => {
    const storedValue = value
      .replaceAll(formattedReadingDate, "{{READING_DATE}}")
      .replaceAll(formattedDueDate, "{{DUE_DATE}}");

    setEditedMessages((prev) => ({
      ...prev,
      [selectedCustomer.id]: storedValue,
    }));
  };
  // =========================================
  // SAVE MESSAGE
  // A group shares ONE message (it's sent to the
  // parent on behalf of everyone in the group), so
  // saving an edit on any member propagates the same
  // text to every member's stored message - this way
  // previewing ANY of them shows the same, correct SMS.
  // =========================================
  const saveMessage = () => {
    const newMessage = editedMessages[selectedCustomer.id];

    propagateMessageToGroup(selectedCustomer, newMessage);

    toast.success("SMS updated successfully");

    setShowModal(false);
  };

  // =========================================
  // APPLY / REMOVE ADJUSTMENT (PENALTY/DISCOUNT)
  // Single source of truth used by both the
  // modal and the quick "remove" action in the
  // table, so the SMS always regenerates using
  // the freshest data - including for grouped
  // (multi-connection) customers.
  // =========================================
  // Saves `message` to EVERY member of the customer's group (or just the
  // customer if they aren't in a group). This is what guarantees that
  // previewing or sending from ANY member - including the parent, who is
  // the one the bill actually goes to - always shows the same, up to date
  // combined SMS. `extraUpdates` lets the specific customer that triggered
  // the change (e.g. the one who got a penalty/discount) also persist
  // their own field changes (penalty/discount) alongside the message.
  const propagateMessageToGroup = (customer, message, extraUpdates = {}) => {
    const groupCustomers = customer.grp
      ? customers.filter((c) => c.grp === customer.grp)
      : [customer];

    let lastSaved = null;

    groupCustomers.forEach((c) => {
      const memberUpdates =
        c.id === customer.id
          ? { ...extraUpdates, message, editStatus: "Edited" }
          : { message, editStatus: "Edited" };

      const saved = saveCustomerData(c.id, memberUpdates);

      if (c.id === customer.id) {
        lastSaved = saved;
      }
    });

    return lastSaved;
  };

  const applyAdjustmentToCustomer = (customerId, updates) => {
    const customer = customers.find((c) => c.id === customerId);

    if (!customer) return null;

    const updatedCustomer = { ...customer, ...updates };

    // Build the group array but make sure the member being adjusted
    // uses the freshly updated data, not the stale copy still sitting
    // in `customers` state - this is what actually reflects the
    // penalty/discount on the SMS preview.
    const rawGroupCustomers = customer.grp
      ? customers.filter((c) => c.grp === customer.grp)
      : [customer];

    const groupCustomers = rawGroupCustomers.map((c) =>
      c.id === customerId ? updatedCustomer : c
    );

    const newMessage = generateGroupMessage({
      ...updatedCustomer,
      __groupCustomers: groupCustomers,
    });

    // Push the freshly generated message (with the adjustment baked in)
    // out to EVERY member of the group, not just the one being adjusted -
    // this is the fix that makes the penalty/discount visible no matter
    // which member of the group you preview or send from.
    return propagateMessageToGroup(customer, newMessage, updates);
  };

  const handleAdjustmentChange = (customer, type) => {
    setAdjustingCustomer(customer);
    setAdjustmentType(type);

    // Prefill with the existing amount if this type is already applied,
    // so re-opening the modal lets the user see/edit/remove it.
    const existing = type === "penalty" ? customer.penalty : customer.discount;
    setAdjustmentAmount(existing > 0 ? String(existing) : "");

    setShowAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setAdjustmentAmount("");
    setAdjustingCustomer(null);
  };

  const saveAdjustment = () => {
    if (!adjustmentAmount || isNaN(adjustmentAmount) || Number(adjustmentAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = Number(adjustmentAmount);

    const updates =
      adjustmentType === "penalty"
        ? { penalty: amount, discount: 0 } // mutually exclusive
        : { discount: amount, penalty: 0 };

    applyAdjustmentToCustomer(adjustingCustomer.id, updates);

    toast.success(
      `${adjustmentType.charAt(0).toUpperCase() + adjustmentType.slice(1)} applied successfully`
    );

    closeAdjustmentModal();
  };

  // Removes whatever adjustment (penalty or discount) is currently on
  // the customer, regenerates the SMS back to its original figures,
  // and saves it. Can be triggered from the modal or directly from the
  // table row.
  const removeAdjustment = (customer = adjustingCustomer) => {
    if (!customer) return;

    applyAdjustmentToCustomer(customer.id, { penalty: 0, discount: 0 });

    toast.success("Adjustment removed");

    closeAdjustmentModal();
  };

  // =========================================
  // SEND SINGLE SMS
  // =========================================
  const sendSingleSMS = async (customer) => {
    if (!isParent(customer)) {
      toast.info("Only parent contacts can recieve this bill");
      return;
    }

    try {
      setSending(true);

      const groupCustomers = getGroupCustomers(customer);

      const parentCustomer = groupCustomers.find((c) => isParent(c));

      const sender = parentCustomer || customer;

      const groupMessage = getCustomerMessage(sender);

      const savedPhones = getCustomerPhones(sender);

      const selectedPhones = savedPhones.filter((p) => p.selected);

      const recipients =
        selectedPhones.length > 0
          ? selectedPhones.map((p) => ({
              phone: p.number,
              message: applyDates(groupMessage),
            }))
          : [
              {
                phone: sender.phone,
                message: applyDates(groupMessage),
              },
            ];

      const payload = {
        customers: recipients,
      };

      const res = await fetch("https://python-back-2.onrender.com/api/send_sms_view/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send SMS");
      }

      const sentDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

      groupCustomers.forEach((c) => {
        saveCustomerData(c.id, {
          message: editedMessages[c.id],
          smsStatus: "Sent",
          sentDate,
        });
      });

      toast.success(`bill sent to ${customer.sms_name}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  const isParent = (customer) => {
    return String(customer.parent).toLowerCase() === "yes";
  };

  // =========================================
  // SEND SELECTED SMS
  // =========================================
  const sendSMS = async () => {
    if (selectedCustomers.length === 0) {
      toast.info("Select at least one customer");
      return;
    }

    try {
      setSending(true);

      // STEP 1: get ONLY unique groups
      const uniqueGroups = {};

      selectedCustomers.forEach((c) => {
        if (!c.grp) return;

        if (!isParent(c)) {
          toast.info(`${c.name} is not a primary reciever of this sms`);
          return;
        }

        uniqueGroups[c.grp] = c;
      });

      const formattedCustomers = [];

      // STEP 2: for each group, send only once
      Object.values(uniqueGroups).forEach((customer) => {
        const groupCustomers = customers.filter((c) => c.grp === customer.grp);

        const parentCustomer = groupCustomers.find((c) => isParent(c));

        // fallback if no parent found
        const sender = parentCustomer || customer;

        const message = getCustomerMessage(sender);

        const savedPhones = getCustomerPhones(sender);

        const selectedPhones = savedPhones.filter((p) => p.selected);

        if (selectedPhones.length > 0) {
          selectedPhones.forEach((p) => {
            formattedCustomers.push({
              phone: p.number,
              message: applyDates(message),
            });
          });
        } else {
          formattedCustomers.push({
            phone: sender.phone,
            message: applyDates(message),
          });
        }
        // update ALL in group as sent
        groupCustomers.forEach((c) => {
          saveCustomerData(c.id, {
            message: editedMessages[c.id],
            smsStatus: "Sent",
            sentDate: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          });
        });
      });

      const res = await fetch("https://python-back-2.onrender.com/api/send_sms_view/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customers: formattedCustomers,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send SMS");
      }

      toast.success("Bill SMS sent successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  // =========================================
  // CONFIRM DATE
  // Only place these dates are ever written to
  // localStorage / applied - so they stay as
  // set until the user explicitly changes them
  // again, no matter how much time passes.
  // =========================================
  const handleUseDate = () => {
    setConfirmedDate(selectedDate);
    setConfirmedDueDate(selectedDueDate);

    localStorage.setItem("billingDate", selectedDate.toISOString());

    localStorage.setItem("dueDate", selectedDueDate.toISOString());

    toast.success("Dates updated");
  };

  const updateAllPhones = async () => {
    if (!testPhone.trim()) {
      toast.error("Enter a phone number");
      return;
    }

    try {
      const response = await fetch("https://python-back-2.onrender.com/api/update_all_bill_phones/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: testPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("All phone numbers updated");

      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  //DOWNLOAD THE SMS EXCEL
  const downloadSMSExcel = () => {
    console.log("DOWNLOAD BUTTON CLICKED");
    try {
      const rows = [];

      // Prevent duplicate groups
      const exportedGroups = new Set();

      customers.forEach((customer) => {
        // Only export parent customer once per group
        if (customer.grp) {
          if (!isParent(customer)) return;

          if (exportedGroups.has(customer.grp)) return;

          exportedGroups.add(customer.grp);
        }

        const groupCustomers = getGroupCustomers(customer);

        const sender = groupCustomers.find(isParent) || customer;

        const message = applyDates(getCustomerMessage(sender));

        rows.push({
          Selected: false,
          ID: sender.user_id,
          Customer: sender.sms_name,
          Phone: sender.phone,
          Group: sender.grp,
          Parent: sender.parent,
          "Previous Reading": sender.prev_user,
          "Current Reading": sender.cur_user,
          Units: sender.units_used,
          Bill: sender.bill,
          Balance: sender.bal,
          Penalty: sender.penalty || 0,
          Discount: sender.discount || 0,
          SMS: message,
          Status: sender.smsStatus,
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Make the SMS column wider
      worksheet["!cols"] = [
        { wch: 10 }, // ID
        { wch: 25 }, // Customer
        { wch: 18 }, // Phone
        { wch: 10 }, // Group
        { wch: 10 }, // Parent
        { wch: 12 }, // Prev
        { wch: 12 }, // Curr
        { wch: 10 }, // Units
        { wch: 12 }, // Bill
        { wch: 12 }, // Balance
        { wch: 12 }, // Penalty
        { wch: 12 }, // Discount
        { wch: 90 }, // SMS
        { wch: 12 }, // Status
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "SMS");

      XLSX.writeFile(workbook, "SMS_Billings_Data.xlsx");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel.");
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.header1}>SMS Dashboard,,</h1>
          <p className={styles.subtitle}>Manage, edit and send billing SMS</p>
        </div>
        <button className={styles.sendBtn} onClick={sendSMS} disabled={sending}>
          {sending ? "Sending..." : "Send Selected SMS"}
        </button>

        <div className={styles.dateSection}>
          <div className={styles.dateSection}>
            <div>
              <label>Billing Date</label>

              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>

            <div>
              <label>Pay By Date</label>

              <input
                type="date"
                value={selectedDueDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDueDate(new Date(e.target.value))}
              />
            </div>

            <button className={styles.useDateBtn} onClick={handleUseDate}>
              Apply Dates
            </button>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Testing phone number"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className={styles.TestingPhoneNumber}
              />

              <button onClick={updateAllPhones} className={styles.TestingPhoneButton}>
                Update All Phones
              </button>
              {/*DOWNLOAD THE SMS EXCEL*/}
              <button
                variant="contained"
                color="success"
                onClick={downloadSMSExcel}
                className={styles.downloadSheetBtn}
              >
                Download SMS Excel sheet
              </button>
            </div>
          </div>
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

              <th>
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
              </th>

              <th>SMS Status</th>

              <th>Edit Status</th>

              <th>Sent Date</th>

              <th>Preview</th>

              <th>Send</th>
              <th>Group</th>
              <th>Parent</th>
              <th>Adjustment</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12">Loading customers...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="12">No customers found</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td>{c.user_id}</td>

                  <td>{c.sms_name}</td>

                  <td>{c.phone}</td>

                  <td>
                    <input type="checkbox" checked={isSelected(c)} onChange={() => handleSelect(c)} />
                  </td>

                  {/* SMS STATUS */}
                  <td>
                    <span className={c.smsStatus === "Sent" ? styles.sentBadge : styles.unsentBadge}>
                      {c.smsStatus}
                    </span>
                  </td>

                  {/* EDIT STATUS */}
                  <td>
                    <span className={c.editStatus === "Edited" ? styles.editedBadge : styles.defaultBadge}>
                      {c.editStatus}
                    </span>
                  </td>

                  {/* SENT DATE */}
                  <td>{c.sentDate}</td>

                  {/* PREVIEW */}
                  <td>
                    <button className={styles.previewBtn} onClick={() => openPreview(c)}>
                      Preview
                    </button>
                  </td>

                  {/* SEND */}
                  <td>
                    <button className={styles.singleSendBtn} onClick={() => sendSingleSMS(c)}>
                      Send
                    </button>
                  </td>
                  <td>{c.grp}</td>
                  <td>{c.parent}</td>
                  <td>
                    <select
                      className={styles.adjustmentSelect}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "penalty" || value === "discount") {
                          handleAdjustmentChange(c, value);
                        }
                        e.target.value = "";
                      }}
                      value=""
                    >
                      <option value="">Select</option>
                      <option value="penalty">Penalty</option>
                      <option value="discount">Discount</option>
                    </select>
                    {(c.penalty > 0 || c.discount > 0) && (
                      <span className={styles.adjustmentBadgeWrapper}>
                        <span className={styles.adjustmentBadge}>
                          {c.penalty > 0 ? `Penalty: ${c.penalty}` : `Discount: ${c.discount}`}
                        </span>
                        <button
                          type="button"
                          className={styles.adjustmentRemoveInlineBtn}
                          onClick={() => removeAdjustment(c)}
                          title="Remove adjustment"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </td>
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
                <h2>SMS Editor</h2>

                <p>
                  Managing SMS for <strong>{selectedCustomer.name}</strong>
                </p>
              </div>

              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <h4>SMS Recipients</h4>

              {getCustomerPhones(selectedCustomer).map((p, index) => (
                <div key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() => togglePhoneSelection(selectedCustomer.id, p.number)}
                    />
                    {p.number}

                    {p.primary && " (Primary)"}
                  </label>

                  {!p.primary && (
                    <button onClick={() => deletePhoneNumber(selectedCustomer.id, p.number)}>Delete</button>
                  )}
                </div>
              ))}

              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Add phone number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />

                <button onClick={() => addPhoneNumber(selectedCustomer.id, newPhone)}>Add</button>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4>Current Adjustments:</h4>
              {selectedCustomer.penalty > 0 && <p>Penalty: KES {selectedCustomer.penalty.toLocaleString()}</p>}
              {selectedCustomer.discount > 0 && <p>Discount: KES {selectedCustomer.discount.toLocaleString()}</p>}
              {!selectedCustomer.penalty && !selectedCustomer.discount && <p>No adjustments applied</p>}
            </div>

            <textarea
              className={styles.smsTextarea}
              value={applyDates(getCustomerMessage(selectedCustomer))}
              onChange={(e) => handleMessageChange(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveMessage}>
                Save Changes
              </button>

              <button className={styles.sendModalBtn} onClick={() => sendSingleSMS(selectedCustomer)}>
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && adjustingCustomer && (
        <div className={styles.adjustmentModalOverlay}>
          <div className={styles.adjustmentModalBox}>
            <div className={styles.adjustmentModalHeader}>
              <h3>
                {adjustmentType.charAt(0).toUpperCase() + adjustmentType.slice(1)} for {adjustingCustomer.sms_name}
              </h3>
              <button className={styles.adjustmentModalClose} onClick={closeAdjustmentModal}>
                ✕
              </button>
            </div>

            <div className={styles.adjustmentModalBody}>
              <p>
                Current Bill: KES {Number(adjustingCustomer.bal || 0).toLocaleString()}
                {adjustingCustomer.penalty > 0 && `, Penalty: KES ${adjustingCustomer.penalty.toLocaleString()}`}
                {adjustingCustomer.discount > 0 && `, Discount: KES ${adjustingCustomer.discount.toLocaleString()}`}
              </p>

              <label>
                Enter {adjustmentType} amount:
                <input
                  type="number"
                  className={styles.adjustmentInput}
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder={`Enter ${adjustmentType} amount`}
                  min="0"
                  step="1"
                />
              </label>
            </div>

            <div className={styles.adjustmentModalFooter}>
              <button className={styles.adjustmentCancelBtn} onClick={closeAdjustmentModal}>
                Cancel
              </button>

              {((adjustmentType === "penalty" && adjustingCustomer.penalty > 0) ||
                (adjustmentType === "discount" && adjustingCustomer.discount > 0)) && (
                <button
                  className={styles.adjustmentRemoveBtn}
                  onClick={() => removeAdjustment(adjustingCustomer)}
                >
                  Remove {adjustmentType}
                </button>
              )}

              <button className={styles.adjustmentSaveBtn} onClick={saveAdjustment}>
                Apply {adjustmentType.charAt(0).toUpperCase() + adjustmentType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sms;