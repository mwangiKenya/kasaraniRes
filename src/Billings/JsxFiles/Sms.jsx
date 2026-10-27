import styles from "../CssFiles/Sms.module.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainUrl from "../../api";
const PAYMENT = "Or: M-PESA Buy Goods:\nKamengo Agencies\nTill No 544783\n\nOr: Kamengo Agencies\nA/C No 01192576824400\nCoop Bank\n\nA/C No 1750278558907\nEquity Bank\n\nContact us on: 0741088799";
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
const adjustments = (c) => {
  const b = Number(c.b_cd);
  const p = Number(c.penalty || 0);
  const toPay = Number(c.bal || 0);
  const text =
    (b > 0 ? `Bal b/d:KES ${b.toLocaleString()}\n` : b < 0 ? `Bal b/d:KES (${Math.abs(b).toLocaleString()})\n` : "") +
    (p > 0 ? `Penalty: KES ${p.toLocaleString()}\n` : "") +
    (p < 0 ? `Discount: KES ${Math.abs(p).toLocaleString()}\n` : "") +
    (b !== 0 || p !== 0 ? `To Pay:KES ${toPay.toLocaleString()}\n` : "");
  return { text, toPay };
};
const readings = (c) =>
  `Prev Read:${c.prev_user}\nCurr Read:${c.cur_user}\nUsage:${c.units_used}\nCurrent Bill:KES ${Number(c.bill || 0).toLocaleString()}\n${adjustments(c).text}`;
const buildMessage = (group) => {
  const sender = group.find(isParent) || group[0];
  if (group.length === 1)
    return `Dear ${sender.sms_name},\nWater Bill as at {{READING_DATE}}\n${readings(sender)}\nPay by {{DUE_DATE}}\n\nSend Money: 0723311564\n\n${PAYMENT}`.trim();
  const breakdown = group.map((c) => `${c.sms_name}\n${readings(c)}`.trim()).join("\n\n");
  const total = group.reduce((sum, c) => sum + adjustments(c).toPay, 0);
  return `Dear ${sender.gen_name},\nWater Bill as at {{READING_DATE}}\n\n${breakdown}\n\nTo pay:KES ${total.toLocaleString()}\n\nPay by {{DUE_DATE}}\n\nSend Money:0723311564\n\n${PAYMENT}`.trim();
};
function Sms() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [previewId, setPreviewId] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [extraPhones, setExtraPhones] = useState({});
  const [newPhone, setNewPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [dates, setDates] = useState(null);
  const [draft, setDraft] = useState({ billing: "", due: "" });
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const selectedCustomer = customers.find((c) => c.id === previewId);
  const parents = customers.filter(isParent);
  const allSelected = parents.length > 0 && parents.every((c) => selected.includes(c.id));
  const datesChanged = dates && draft.billing && draft.due && (draft.billing !== dates.billing || draft.due !== dates.due);
  const applyDates = (m) =>
    dates ? String(m ?? "").replaceAll("{{READING_DATE}}", fmt(dates.billing)).replaceAll("{{DUE_DATE}}", fmt(dates.due)) : String(m ?? "");
  const toTemplate = (v) =>
    dates ? v.replaceAll(fmt(dates.billing), "{{READING_DATE}}").replaceAll(fmt(dates.due), "{{DUE_DATE}}") : v;
  const getGroup = (c, list = customers) => (c.grp ? list.filter((x) => x.grp === c.grp) : [c]);
  const getCustomerMessage = (c) => editedMessages[c.id] || c.message || buildMessage(getGroup(c));
  const getCustomerPhones = (c) => [
    { number: c.phone, primary: true, selected: true },
    ...(extraPhones[c.id] || []).filter((p) => !p.primary),
  ];
  const editPhones = (fn) => {
    const phones = fn(getCustomerPhones(selectedCustomer));
    localStorage.setItem(`phones_${selectedCustomer.id}`, JSON.stringify(phones));
    setExtraPhones((prev) => ({ ...prev, [selectedCustomer.id]: phones }));
  };
  const prepare = (c) => {
    const billingSignature = `
          ${c.prev_user}
          ${c.cur_user}
          ${c.units_used}
          ${c.bill}
          ${c.b_cd}
          ${c.bal}
          ${c.penalty}
        `;
    const saved = load(`sms_${c.id}`, null);
    if (!saved || saved.month !== month || saved.year !== year || saved.billingSignature !== billingSignature) {
      const fresh = { message: buildMessage([c]), smsStatus: "Unsent", editStatus: "Default", sentDate: "-", month, year, billingSignature };
      localStorage.setItem(`sms_${c.id}`, JSON.stringify(fresh));
      return { ...c, ...fresh };
    }
    const message = saved.message
      .replace(/Water Bill as at .*/g, "Water Bill as at {{READING_DATE}}")
      .replace(/Pay by .*/g, "Pay by {{DUE_DATE}}");
    return { ...c, ...saved, message };
  };
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api("bill/");
      if (!res.ok) throw new Error();
      const prepared = (await res.json()).map(prepare);
      setCustomers(prepared);
      setExtraPhones(Object.fromEntries(prepared.map((c) => [c.id, load(`phones_${c.id}`, [])])));
      setEditedMessages(
        Object.fromEntries(prepared.map((c) => [c.id, c.editStatus === "Edited" ? c.message : buildMessage(getGroup(c, prepared))]))
      );
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
    api("bill_dates/")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setDates(d);
        setDraft({ billing: d.billing, due: d.due });
      })
      .catch(() => toast.error("Failed to load billing dates"));
  }, []);
  const saveDates = async () => {
    try {
      const res = await api("bill_dates/", "PUT", draft);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDates(data);
      toast.success("Dates updated");
    } catch (err) {
      toast.error(err.message || "Failed to update dates");
    }
  };
  const saveCustomerData = (id, updates) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    const u = { ...c, ...updates };
    const { message, smsStatus, editStatus, sentDate, billingSignature } = u;
    localStorage.setItem(`sms_${id}`, JSON.stringify({ message, smsStatus, editStatus, sentDate, month, year, billingSignature }));
    setCustomers((prev) => prev.map((x) => (x.id === id ? u : x)));
    if (updates.message !== undefined) setEditedMessages((prev) => ({ ...prev, [id]: updates.message }));
  };
  const saveMessage = () => {
    getGroup(selectedCustomer).forEach((c) =>
      saveCustomerData(c.id, { message: editedMessages[selectedCustomer.id], editStatus: "Edited" })
    );
    toast.success("SMS updated successfully");
    setPreviewId(null);
  };
  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const send = async (targets) => {
    const senders = targets.filter(isParent);
    if (!senders.length) {
      toast.info("Only parent accounts can receive bills");
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
      const message = applyDates(getCustomerMessage(sender));
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
      jobs.forEach((j) => j.group.forEach((c) => saveCustomerData(c.id, { smsStatus: "Sent", sentDate })));
      toast.success(jobs.length === 1 ? `Bill sent to ${jobs[0].sender.sms_name}` : `${jobs.length} bills sent successfully`);
      return true;
    } catch {
      toast.error("Failed to send SMS");
      return false;
    } finally {
      setSending(false);
    }
  };
  const sendSelected = async () => {
    if (!selected.length) return toast.info("Select at least one customer");
    if (await send(customers.filter((c) => selected.includes(c.id)))) setSelected([]);
  };
  const updateAllPhones = async () => {
    if (!testPhone.trim()) return toast.error("Enter a phone number");
    try {
      const res = await api("update_all_bill_phones/", "PUT", { phone: testPhone });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("All phone numbers updated");
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const adjustment = selectedCustomer ? Number(selectedCustomer.penalty || 0) : 0;
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.header1}>SMS Dashboard</h1>
          <p className={styles.subtitle}>Manage, edit and send billing SMS</p>
        </div>
        <button className={styles.sendBtn} onClick={sendSelected} disabled={sending || !dates}>
          {sending ? "Sending..." : `Send Selected SMS (${selected.length})`}
        </button>
        <div className={styles.dateSection}>
          <div>
            <label>Billing Date</label>
            <input type="date" value={draft.billing} onChange={(e) => setDraft({ ...draft, billing: e.target.value })} />
          </div>
          <div>
            <label>Pay By Date</label>
            <input type="date" min={draft.billing} value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
          </div>
          <button className={styles.useDateBtn} onClick={saveDates} disabled={!datesChanged}>
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
          </div>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.tableContainer}>
          <thead className={styles.tableRowHeader}>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={!parents.length}
                  onChange={() => setSelected(allSelected ? [] : parents.map((c) => c.id))}
                />
              </th>
              <th>SMS Status</th>
              <th>Edit Status</th>
              <th>Sent Date</th>
              <th>Preview</th>
              <th>Send</th>
              <th>Group</th>
              <th>Parent</th>
            </tr>
          </thead>
          <tbody>
            {loading || !customers.length ? (
              <tr>
                <td colSpan="10">{loading ? "Loading customers..." : "No customers found"}</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className={styles.tableRow} style={{ opacity: isParent(c) ? 1 : 0.6 }}>
                  <td>{c.sms_name}</td>
                  <td>{c.phone}</td>
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
                    <span className={c.smsStatus === "Sent" ? styles.sentBadge : styles.unsentBadge}>{c.smsStatus}</span>
                  </td>
                  <td>
                    <span className={c.editStatus === "Edited" ? styles.editedBadge : styles.defaultBadge}>{c.editStatus}</span>
                  </td>
                  <td>{c.sentDate}</td>
                  <td>
                    <button className={styles.previewBtn} onClick={() => setPreviewId(c.id)}>
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
                <h2>SMS Editor</h2>
                <p>
                  Managing SMS for <strong>{selectedCustomer.name}</strong>
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setPreviewId(null)}>
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <h4>SMS Recipients</h4>
              {getCustomerPhones(selectedCustomer).map((p) => (
                <div key={p.number}>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() => editPhones((list) => list.map((x) => (x.number === p.number ? { ...x, selected: !x.selected } : x)))}
                    />
                    {p.number}
                    {p.primary && " (Primary number)"}
                  </label>
                  {!p.primary && <button onClick={() => editPhones((list) => list.filter((x) => x.number !== p.number))}>Delete</button>}
                </div>
              ))}
              <div style={{ marginTop: "10px" }}>
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
            <div style={{ marginBottom: "15px" }}>
              <h4>Current Adjustments (from Billings):</h4>
              {adjustment === 0 && <p>No adjustments applied</p>}
              {adjustment > 0 && <p>Penalty: KES {adjustment.toLocaleString()}</p>}
              {adjustment < 0 && <p>Discount: KES {Math.abs(adjustment).toLocaleString()}</p>}
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>To add, change or remove a penalty/discount, use the Billings page.</p>
            </div>
            <textarea
              className={styles.smsTextarea}
              value={applyDates(getCustomerMessage(selectedCustomer))}
              onChange={(e) => setEditedMessages((prev) => ({ ...prev, [selectedCustomer.id]: toTemplate(e.target.value) }))}
            />
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveMessage}>
                Save Changes
              </button>
              <button className={styles.sendModalBtn} disabled={sending} onClick={() => send([selectedCustomer])}>
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