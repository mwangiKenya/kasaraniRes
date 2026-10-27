import styles from "../CssFiles/Reminder.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainUrl from "../../api";
const TYPES = { REMINDER: "Reminder", DUE_FOR_DISCONNECTION: "Due For Disconnection", DISCONNECTION_NOTICE: "Disconnection Notice" };
const api = (path, method = "GET", body) =>
  fetch(`${mainUrl}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const isParent = (c) => String(c.parent).trim().toLowerCase() === "yes";
const fmt = (d) => d.split("-").reverse().join("/");
const amount = (c) => {
  const bal = Number(c.bal);
  const bill = Number(c.bill);
  return bal > 0 ? bal : Number.isFinite(bill) ? bill : 0;
};
const build = (type, group) => {
  const one = group.length === 1;
  const total = group.reduce((sum, c) => sum + amount(c), 0);
  const cur = one ? "KES" : "Ksh";
  const sp = one ? " " : "";
  const dot = one ? "." : "";
  const bodies = {
    REMINDER: `BILL PAST DUE DATE

Your Water Bill as at reading
date:{{READING_DATE}} KES ${total.toLocaleString()} was due
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

Contact us on: 0741088799`,
    DUE_FOR_DISCONNECTION: `DUE FOR DISCONNECTION

Your Water Bill as at reading
date:{{READING_DATE}} ${cur} ${total.toLocaleString()} was due
on {{DUE_DATE}}. It is past due and
due for disconnection. Note that${sp}
once disconnected, a reconnection${sp}
charge of ${cur} 500 applies.

Mpesa Send money 0723311564

Or buy goods, Kamengo Agencies
Till No. 544783${dot}

Or deposit to: Kamengo Agencies
a/c No. 01192576824400
Coop, TRM Branch

Or deposit to: Kamengo Agencies
a/c No. 1750278558907
Equity, Garden city Branch

Contact us on: 0741088799`,
    DISCONNECTION_NOTICE: `DISCONNECTION NOTICE

Kindly note that your water is
disconnected due to non payment.
The account will be reconnected
on full payment. An additional
reconnection fee of Ksh 500 has
been charged on your account as per
agreement. Kindly pay Ksh ${(total + 500).toLocaleString()}
for reconnection.

Thank you${dot}

Contact us on: 0741088799`,
  };
  return (bodies[type] || bodies.REMINDER).trim();
};
const TypeSelect = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.smsTypeSelect}>
    {Object.entries(TYPES).map(([key, label]) => (
      <option key={key} value={key}>
        {label}
      </option>
    ))}
  </select>
);
function Reminder() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [previewId, setPreviewId] = useState(null);
  const [draft, setDraft] = useState("");
  const [extraPhones, setExtraPhones] = useState({});
  const [newPhone, setNewPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [globalType, setGlobalType] = useState("REMINDER");
  const [dates, setDates] = useState(null);
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const selectedCustomer = customers.find((c) => c.id === previewId);
  const displayed = filterOverdue ? customers.filter((c) => Number(c.bal) > 0 || Number(c.bill) > 0) : customers;
  const parents = displayed.filter(isParent);
  const allSelected = parents.length > 0 && parents.every((c) => selected.includes(c.id));
  const applyDates = (m) =>
    dates ? String(m ?? "").replaceAll("{{READING_DATE}}", fmt(dates.billing)).replaceAll("{{DUE_DATE}}", fmt(dates.due)) : String(m ?? "");
  const toTemplate = (v) =>
    dates ? v.replaceAll(fmt(dates.billing), "{{READING_DATE}}").replaceAll(fmt(dates.due), "{{DUE_DATE}}") : v;
  const getGroup = (c, list = customers) => (c.grp ? list.filter((x) => x.grp === c.grp) : [c]);
  const getMessage = (c) => (c.editStatus === "Edited" ? c.message : build(c.smsType, getGroup(c)));
  const getCustomerPhones = (c) => [
    { number: c.phone, primary: true, selected: true },
    ...(extraPhones[c.id] || []).filter((p) => !p.primary),
  ];
  const editPhones = (fn) => {
    const phones = fn(getCustomerPhones(selectedCustomer));
    localStorage.setItem(`phones_${selectedCustomer.id}`, JSON.stringify(phones));
    setExtraPhones((prev) => ({ ...prev, [selectedCustomer.id]: phones }));
  };
  const store = (c) =>
    localStorage.setItem(
      `reminder_${c.id}`,
      JSON.stringify({
        message: c.message,
        reminderStatus: c.reminderStatus,
        editStatus: c.editStatus,
        sentDate: c.sentDate,
        month,
        year,
        billingSignature: c.billingSignature,
        smsType: c.smsType,
      })
    );
  const update = (ids, updates) => {
    const next = customers.map((c) => (ids.includes(c.id) ? { ...c, ...updates } : c));
    next.filter((c) => ids.includes(c.id)).forEach(store);
    setCustomers(next);
  };
  const prepare = (c) => {
    const billingSignature = `
          ${c.prev_user}
          ${c.cur_user}
          ${c.units_used}
          ${c.bill}
          ${c.b_cd}
          ${c.bal}
        `;
    const saved = load(`reminder_${c.id}`, null);
    const fresh = !saved || saved.month !== month || saved.year !== year || saved.billingSignature !== billingSignature;
    const full = {
      ...c,
      ...(fresh
        ? { message: "", reminderStatus: "Unsent", editStatus: "Default", sentDate: "-", billingSignature, smsType: "REMINDER" }
        : { smsType: "REMINDER", ...saved }),
    };
    if (fresh) store(full);
    return full;
  };
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api("bill/");
      if (!res.ok) throw new Error();
      const list = (await res.json()).map(prepare);
      setCustomers(list);
      setExtraPhones(Object.fromEntries(list.map((c) => [c.id, load(`phones_${c.id}`, [])])));
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };
  const loadDates = () =>
    api("bill_dates/")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDates)
      .catch(() => toast.error("Failed to load billing dates", { toastId: "dates" }));
  useEffect(() => {
    fetchCustomers();
    loadDates();
    window.addEventListener("focus", loadDates);
    return () => window.removeEventListener("focus", loadDates);
  }, []);
  const changeType = (ids, type) => update(ids, { smsType: type, editStatus: "Default" });
  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const openPreview = (c) => {
    setDraft(getMessage(c));
    setPreviewId(c.id);
  };
  const saveMessage = () => {
    update(getGroup(selectedCustomer).map((c) => c.id), { message: draft, editStatus: "Edited" });
    toast.success("Reminder updated successfully");
    setPreviewId(null);
  };
  const send = async (targets, override) => {
    const senders = targets.filter(isParent);
    if (!senders.length) {
      toast.info("Only parent accounts can receive reminders");
      return false;
    }
    if (!dates) {
      toast.error("Billing dates are not loaded yet");
      return false;
    }
    const seen = new Set();
    const jobs = senders.flatMap((c) => {
      const key = c.grp || `solo-${c.id}`;
      if (seen.has(key)) return [];
      seen.add(key);
      const group = getGroup(c);
      const sender = group.find(isParent);
      const message = applyDates(override ?? getMessage(sender));
      const recipients = getCustomerPhones(sender)
        .filter((p) => p.selected && p.number)
        .map((p) => ({ phone: p.number, message }));
      return [{ group, sender, recipients }];
    });
    const recipients = jobs.flatMap((j) => j.recipients);
    if (!recipients.length) {
      toast.error("No phone numbers selected");
      return false;
    }
    try {
      setSending(true);
      const res = await api("send_sms_view/", "POST", { customers: recipients });
      if (!res.ok) throw new Error();
      const sentDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      update(jobs.flatMap((j) => j.group.map((c) => c.id)), { reminderStatus: "Sent", sentDate });
      toast.success(jobs.length === 1 ? `Reminder sent to ${jobs[0].sender.sms_name}` : `${jobs.length} reminders sent successfully`);
      return true;
    } catch {
      toast.error("Failed to send reminder");
      return false;
    } finally {
      setSending(false);
    }
  };
  const sendSelected = async () => {
    if (!selected.length) return toast.info("Select at least one customer");
    if (await send(customers.filter((c) => selected.includes(c.id)))) setSelected([]);
  };
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.header1}>Reminder Dashboard</h1>
          <p className={styles.subtitle}>Compose and send payment reminder SMS to customers</p>
        </div>
        <button className={styles.sendBtn} onClick={sendSelected} disabled={sending || !dates}>
          {sending ? "Sending..." : `Send Selected Reminders (${selected.length})`}
        </button>
        <div className={styles.controls}>
          <div className={styles.dateSection}>
            <div>
              <label>Reading Date (set on SMS page)</label>
              <div>
                <strong>{dates ? fmt(dates.billing) : "Loading..."}</strong>
              </div>
            </div>
          </div>
          <div className={styles.dateSection}>
            <div>
              <label>Pay By Date (set on SMS page)</label>
              <div>
                <strong>{dates ? fmt(dates.due) : "Loading..."}</strong>
              </div>
            </div>
          </div>
          <div className={styles.dateSection}>
            <div>
              <label>SMS Type For All Customers</label>
              <TypeSelect
                value={globalType}
                onChange={(type) => {
                  setGlobalType(type);
                  changeType(customers.map((c) => c.id), type);
                }}
              />
            </div>
          </div>
          <label className={styles.filterToggle}>
            <input type="checkbox" checked={filterOverdue} onChange={() => setFilterOverdue((v) => !v)} />
            Show only customers with outstanding balance
          </label>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.tableContainer}>
          <thead className={styles.tableRowHeader}>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Balance (KES)</th>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={!parents.length}
                  onChange={() => setSelected(allSelected ? [] : parents.map((c) => c.id))}
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
            {loading || !displayed.length ? (
              <tr>
                <td colSpan="12">{loading ? "Loading customers..." : "No customers found"}</td>
              </tr>
            ) : (
              displayed.map((c) => (
                <tr key={c.id} className={styles.tableRow} style={{ opacity: isParent(c) ? 1 : 0.6 }}>
                  <td>{c.sms_name}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span className={Number(c.bal) > 0 ? styles.balanceOwed : styles.balanceClear}>
                      {Number(c.bal) > 0 ? Number(c.bal).toLocaleString() : "0"}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      disabled={!isParent(c)}
                      title={isParent(c) ? "" : "Set parent to yes in the user's details to enable"}
                      onChange={() => toggle(c.id)}
                    />
                  </td>
                  <td>
                    <TypeSelect value={c.smsType} onChange={(type) => changeType([c.id], type)} />
                  </td>
                  <td>
                    <span className={c.reminderStatus === "Sent" ? styles.sentBadge : styles.unsentBadge}>{c.reminderStatus}</span>
                  </td>
                  <td>
                    <span className={c.editStatus === "Edited" ? styles.editedBadge : styles.defaultBadge}>{c.editStatus}</span>
                  </td>
                  <td>{c.sentDate}</td>
                  <td>
                    <button className={styles.previewBtn} onClick={() => openPreview(c)}>
                      Preview
                    </button>
                  </td>
                  <td>
                    <button className={styles.singleSendBtn} disabled={sending} onClick={() => send([c])}>
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
      {selectedCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Reminder Editor</h2>
                <p>
                  Editing reminder for <strong>{selectedCustomer.sms_name}</strong>
                  {" — "}
                  <em>{TYPES[selectedCustomer.smsType]}</em>
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setPreviewId(null)}>
                ✕
              </button>
            </div>
            <div className={styles.phoneSection}>
              <h4>SMS Recipients</h4>
              {getCustomerPhones(selectedCustomer).map((p) => (
                <div key={p.number} className={styles.phoneRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() => editPhones((list) => list.map((x) => (x.number === p.number ? { ...x, selected: !x.selected } : x)))}
                    />
                    {p.number}
                    {p.primary && " (Primary number)"}
                  </label>
                  {!p.primary && (
                    <button className={styles.deletePhoneBtn} onClick={() => editPhones((list) => list.filter((x) => x.number !== p.number))}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
              <div className={styles.addPhone}>
                <input type="text" placeholder="Add phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <button
                  onClick={() => {
                    if (!newPhone.trim()) return;
                    editPhones((list) => [...list, { number: newPhone.trim(), selected: true }]);
                    setNewPhone("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <textarea className={styles.smsTextarea} value={applyDates(draft)} onChange={(e) => setDraft(toTemplate(e.target.value))} />
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveMessage}>
                Save Changes
              </button>
              <button className={styles.sendModalBtn} disabled={sending} onClick={() => send([selectedCustomer], draft)}>
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