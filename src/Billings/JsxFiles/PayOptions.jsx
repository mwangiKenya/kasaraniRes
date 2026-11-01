import { useEffect, useState } from "react";
import styles from "../CssFiles/payOptions.module.css";
import { authFetch } from "../../api";
import { toast } from "react-toastify";
const API = "pay-details/";
const empty = { method_type: "", provider: "", acc_num: "", acc_name: "", is_active: true };
function PayOptions() {
    const [payments, setPayments] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        try {
            const res = await authFetch(API);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not load payment details.");
            setPayments(data);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const change = e => setForm({ ...form, [e.target.name]: e.target.name === "is_active" ? e.target.checked : e.target.value });
    const submit = async e => {
        e.preventDefault();
        if (!form.method_type.trim() || !form.provider.trim() || !form.acc_num.trim() || !form.acc_name.trim()) return toast.error("Fill in all fields.");
        setSaving(true);
        try {
            const res = await authFetch(editing ? `${API}${editing}/` : API, {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed.");
            toast.success(editing ? "Payment details updated." : "Payment details added.");
            setForm(empty);
            setEditing(null);
            await load();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };
    const edit = p => {
        setEditing(p.id);
        setForm({ method_type: p.method_type, provider: p.provider, acc_num: p.acc_num, acc_name: p.acc_name, is_active: p.is_active });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const remove = async id => {
        if (!window.confirm("Delete these payment details?")) return;
        try {
            const res = await authFetch(`${API}${id}/`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed.");
            toast.success("Payment details deleted.");
            if (editing === id) { setEditing(null); setForm(empty); }
            await load();
        } catch (e) {
            toast.error(e.message);
        }
    };
    return <main className={styles.page}>
        <header className={styles.header}><div><span className={styles.eyebrow}>PAYMENT SETTINGS</span><h1>Payment details</h1><p>Manage the payment options displayed on your customer bills.</p></div><span className={styles.count}>{payments.length} options</span></header>
        <section className={styles.panel}>
            <h2>{editing ? "Update payment option" : "Add payment option"}</h2>
            <form onSubmit={submit} className={styles.form}>
                <label>Payment method<input name="method_type" placeholder="e.g. M-PESA Till" value={form.method_type} onChange={change} required /></label>
                <label>Provider<input name="provider" placeholder="e.g. Safaricom" value={form.provider} onChange={change} required /></label>
                <label>Account / Till number<input name="acc_num" placeholder="Enter account number" value={form.acc_num} onChange={change} required /></label>
                <label>Account name<input name="acc_name" placeholder="e.g. Kamengo Agencies" value={form.acc_name} onChange={change} required /></label>
                <label className={styles.toggle}><input type="checkbox" name="is_active" checked={form.is_active} onChange={change} /> Active — show this option to customers</label>
                <div className={styles.actions}><button disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add payment option"}</button>{editing && <button type="button" className={styles.cancel} onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div>
            </form>
        </section>
        <section className={styles.list}><div className={styles.listHeader}><h2>Your payment options</h2><button className={styles.refresh} onClick={() => { setLoading(true); load(); }}>Refresh</button></div>
            {loading ? <p className={styles.message}>Loading payment details...</p> : payments.length === 0 ? <p className={styles.message}>No payment options yet. Add your first option above.</p> : <div className={styles.cards}>{payments.map(p => <article className={styles.card} key={p.id}><div className={styles.cardTop}><span className={styles.method}>{p.method_type}</span><span className={p.is_active ? styles.active : styles.inactive}>{p.is_active ? "Active" : "Inactive"}</span></div><h3>{p.provider}</h3><p className={styles.label}>ACCOUNT / TILL NUMBER</p><p className={styles.number}>{p.acc_num}</p><p className={styles.label}>ACCOUNT NAME</p><p>{p.acc_name}</p><div className={styles.cardActions}><button onClick={() => edit(p)}>Edit</button><button className={styles.delete} onClick={() => remove(p.id)}>Delete</button></div></article>)}</div>}
        </section>
    </main>;
}
export default PayOptions;