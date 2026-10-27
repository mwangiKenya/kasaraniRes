import styles from "../CssFiles/Analytics.module.css";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import mainUrl from "../../api";
import {
  FaUsers, FaWater, FaMoneyBillWave, FaChartLine, FaWallet, FaPercentage,
  FaExclamationTriangle, FaCheckCircle, FaClock, FaDownload, FaSync,
  FaArrowUp, FaArrowDown, FaGavel, FaBalanceScale,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ComposedChart, Line, Area, AreaChart, PieChart, Pie,
} from "recharts";

/* ------------------------------------------------------------ constants */
const C = { blue: "#2563EB", purple: "#7C3AED", green: "#059669", amber: "#D97706", red: "#DC2626", cyan: "#0891B2", grey: "#94A3B8" };

// existing endpoints (unchanged)
const LEGACY = ["total_units/", "total_bal/", "total_bill/", "total_paid", "total_cust/", "avg_units"];

// new endpoints
const NEW = {
  summary: () => "analytics_summary/",
  trend: (m) => `analytics_monthly_trend/?months=${m}`,
  zones: () => "analytics_zone_performance/",
  groups: () => "analytics_group_breakdown/",
  status: () => "analytics_status_breakdown/",
  tariffs: () => "analytics_tariff_breakdown/",
  bands: () => "analytics_consumption_bands/",
  growth: (m) => `analytics_customer_growth/?months=${m}`,
  debtors: () => "analytics_top_debtors/?limit=10",
  consumers: () => "analytics_top_consumers/?limit=10",
  anomalies: () => "analytics_reading_anomalies/",
};

const get = async (path) => {
  const res = await fetch(`${mainUrl}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
};

const kes = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n) || 0);
const num = (n) => new Intl.NumberFormat("en-KE").format(Number(n) || 0);
const short = (n) => {
  const v = Number(n) || 0, a = Math.abs(v);
  return a >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : a >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : `${Math.round(v)}`;
};
const mLabel = (s) => (s ? new Date(`${s}-01`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : "");
const change = (cur, prev) => (prev ? ((cur - prev) / Math.abs(prev)) * 100 : null);
const rateTone = (r) => (r >= 80 ? "good" : r >= 60 ? "warn" : "bad");

/* ------------------------------------------------------------ small parts */
function Delta({ v, invert }) {
  if (v == null || !isFinite(v)) return null;
  const up = v >= 0;
  const good = invert ? !up : up;
  return (
    <span className={`${styles.delta} ${good ? styles.good : styles.bad}`}>
      {up ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(v).toFixed(1)}%
    </span>
  );
}

function Kpi({ icon, label, value, sub, tone = "blue", delta, invert, spark, sparkKey }) {
  return (
    <div className={`${styles.kpi} ${styles[tone]}`}>
      <div className={styles.kpiTop}>
        <span className={styles.kpiIcon}>{icon}</span>
        <span className={styles.kpiLabel}>{label}</span>
      </div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiSub}>
        <Delta v={delta} invert={invert} />
        <span>{sub}</span>
      </div>
      {spark && spark.length > 1 && (
        <div className={styles.spark}>
          <ResponsiveContainer width="100%" height={34}>
            <AreaChart data={spark}>
              <Area type="monotone" dataKey={sparkKey} stroke="currentColor" fill="currentColor" fillOpacity={0.12} strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const Card = ({ title, sub, children, wide }) => (
  <section className={`${styles.card} ${wide ? styles.wide : ""}`}>
    <header className={styles.cardHead}>
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
    </header>
    {children}
  </section>
);

const Empty = ({ text = "No data available for this section yet." }) => <div className={styles.empty}>{text}</div>;

const RateBar = ({ value }) => (
  <div className={styles.rateCell}>
    <div className={styles.bar}><div className={`${styles.barFill} ${styles[rateTone(value)]}`} style={{ width: `${Math.min(100, value)}%` }} /></div>
    <span>{value}%</span>
  </div>
);

const moneyTip = (v, n) => [typeof v === "number" && /rate|%/i.test(n) ? `${v}%` : kes(v), n];

/* ------------------------------------------------------------ page */
function Analytics() {
  // legacy state (kept)
  const [units_used, setUnitsUsed] = useState(0);
  const [bills, setBills] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [units, setUnits] = useState(0);
  const [paid, setPaid] = useState(0);
  const [bal, setBal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  // new state
  const [months, setMonths] = useState(12);
  const [d, setD] = useState({});
  const [failed, setFailed] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await Promise.all(LEGACY.map(get));
      setUnitsUsed(r[0].total_units || 0);
      setBal(r[1].total_bal || 0);
      setBills(r[2].total_bill || 0);
      setPaid(r[3].total_paid || 0);
      setCustomers(r[4].total_cust || 0);
      setUnits(r[5].avg_units || 0);
    } catch (err) {
      setError(err.message);
    }
    const keys = Object.keys(NEW);
    const res = await Promise.allSettled(keys.map((k) => get(NEW[k](months))));
    const next = {}, bad = [];
    res.forEach((x, i) => (x.status === "fulfilled" ? (next[keys[i]] = x.value) : bad.push(keys[i])));
    setD(next);
    setFailed(bad);
    setLastUpdated(new Date());
    setLoading(false);
  }, [months]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  /* ---------- derived metrics (same formulas as before) ---------- */
  const total = Number(bills) + Number(bal);
  const balance = total - paid;
  const efficiency = total > 0 ? +((paid / total) * 100).toFixed(1) : 0;
  const avgBillPerCustomer = customers > 0 ? bills / customers : 0;
  const avgPaidPerCustomer = customers > 0 ? paid / customers : 0;
  const level = efficiency >= 80 ? "Excellent" : efficiency >= 60 ? "Good" : "Needs improvement";

  const trend = d.trend?.data || [];
  const last = trend[trend.length - 1], prev = trend[trend.length - 2];
  const s = d.summary;
  const cs = s?.cycle_stats;
  const zones = d.zones?.data || [];
  const readingPct = s?.reading_completion;
  const health = Math.round(readingPct != null ? efficiency * 0.7 + readingPct * 0.3 : efficiency);

  const metricsData = [
    { name: "Total Customers", value: customers, formatted: num(customers), color: C.blue },
    { name: "Previous Balance", value: bal, formatted: kes(bal), color: C.purple },
    { name: "Current Revenue", value: bills, formatted: kes(bills), color: C.blue },
    { name: "Total Revenue", value: total, formatted: kes(total), color: C.green },
    { name: "Amount Paid", value: paid, formatted: kes(paid), color: C.amber },
    { name: "Outstanding Balance", value: balance, formatted: kes(balance), color: C.red },
    { name: "Units Consumed", value: units_used, formatted: `${num(units_used)} m³`, color: C.cyan },
  ];

  /* ---------- auto-generated insights ---------- */
  const insights = useMemo(() => {
    const out = [];
    const add = (tone, text, action) => out.push({ tone, text, action });
    if (balance <= 0) add("good", "All billed amounts have been paid.");
    else add(balance / (total || 1) > 0.4 ? "bad" : "warn", `Outstanding balance is ${kes(balance)} (${(100 - efficiency).toFixed(1)}% of what is due).`, "Prioritise follow-up on the largest debtors below.");
    if (last && prev) {
      const dr = last.collection_rate - prev.collection_rate;
      if (Math.abs(dr) >= 1) add(dr > 0 ? "good" : "bad", `Collection rate ${dr > 0 ? "improved" : "fell"} ${Math.abs(dr).toFixed(1)} points to ${last.collection_rate}% in ${mLabel(last.month)}.`, dr < 0 ? "Check what changed: reminders, disconnections or billing delays." : null);
      const du = change(last.units, prev.units);
      if (du != null && Math.abs(du) >= 10) add("warn", `Water consumption ${du > 0 ? "rose" : "dropped"} ${Math.abs(du).toFixed(0)}% versus ${mLabel(prev.month)}.`, "Compare with supply-meter readings to rule out leaks or meter faults.");
    }
    const weak = [...zones].filter((z) => z.due > 0).sort((a, b) => a.collection_rate - b.collection_rate)[0];
    if (weak && weak.collection_rate < 70) add("bad", `${weak.zone} has the weakest collection (${weak.collection_rate}%) with ${kes(weak.outstanding)} unpaid.`, "Assign field follow-up to this zone first.");
    if (d.debtors?.top_share > 30) add("warn", `The top 10 debtors hold ${d.debtors.top_share}% of all outstanding debt.`, "A few targeted recoveries would make a large difference.");
    const a = d.anomalies;
    if (a && (a.negative > 0 || a.spike > 0)) add("warn", `${a.negative} readings are lower than the previous reading and ${a.spike} are above ${a.threshold} m³ (3× average).`, "Verify these meters before billing is finalised.");
    if (a?.pending > 0) add("warn", `${a.pending} meter readings are still pending.`, "Complete readings so billing is not delayed.");
    if (s?.penalties_cycle > 0) add("warn", `${kes(s.penalties_cycle)} in penalties were charged this cycle.`, null);
    return out;
  }, [balance, total, efficiency, last, prev, zones, d.debtors, d.anomalies, s]);

  /* ---------- export ---------- */
  const exportCSV = () => {
    const rows = [["Metric", "Value"], ["Customers", customers], ["Previous balance", bal], ["Current revenue", bills], ["Total revenue", total], ["Paid", paid], ["Outstanding", balance], ["Collection %", efficiency], ["Units (m3)", units_used], [], ["Month", "Billed", "Prev balance", "Due", "Paid", "Outstanding", "Collection %", "Units"],
      ...trend.map((t) => [t.month, t.billed, t.prev, t.due, t.paid, t.outstanding, t.collection_rate, t.units])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `water-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const mix = s ? [
    { name: "Fully paid", value: s.payment_mix.fully_paid, color: C.green },
    { name: "Partly paid", value: s.payment_mix.partial, color: C.amber },
    { name: "Unpaid", value: s.payment_mix.unpaid, color: C.red },
  ] : [];

  return (
    <div className={styles.container}>
      {/* ---------------- header ---------------- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Water billing analytics</h1>
          <p className={styles.subtitle}>
            {s?.cycle ? `Latest billing cycle: ${s.cycle}. ` : ""}Collections, consumption and meter operations in one view.
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.lastUpdated}><FaClock /> Updated {lastUpdated.toLocaleTimeString()}</span>
          <select className={styles.select} value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label="Trend period">
            {[3, 6, 12, 24].map((m) => <option key={m} value={m}>Last {m} months</option>)}
          </select>
          <button onClick={fetchAllData} className={styles.btn}><FaSync /> Refresh</button>
          {/*<button onClick={exportCSV} className={`${styles.btn} ${styles.btnPrimary}`}><FaDownload /> Export CSV</button>*/}
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <FaExclamationTriangle /> <span>{error}</span>
          <button onClick={fetchAllData}>Retry</button>
        </div>
      )}
      {failed.length > 0 && (
        <div className={styles.warnBanner}>
          <FaExclamationTriangle /> <span>Some sections could not load ({failed.join(", ")}). Check that the new analytics URLs are registered.</span>
        </div>
      )}

      {/* ---------------- executive summary ---------------- */}
      <div className={styles.hero}>
        <div className={styles.score} style={{ "--p": `${health}%`, "--c": health >= 75 ? C.green : health >= 55 ? C.amber : C.red }}>
          <div><strong>{health}</strong><span>/100</span></div>
        </div>
        <div className={styles.heroText}>
          <h2>{health >= 75 ? "The scheme is performing well" : health >= 55 ? "Performance is acceptable but needs attention" : "Collections need urgent attention"}</h2>
          <p>
            {kes(paid)} collected of {kes(total)} due ({efficiency}%, {level.toLowerCase()}).
            {readingPct != null && ` ${readingPct}% of meter readings are complete.`}
            {" "}Score weights collection (70%) and reading completion (30%).
          </p>
        </div>
        <ul className={styles.pills}>
          {insights.slice(0, 3).map((i, k) => <li key={k} className={styles[i.tone]}>{i.text}</li>)}
        </ul>
      </div>

      {/* ---------------- KPIs ---------------- */}
      <div className={styles.kpiGrid}>
        <Kpi icon={<FaUsers />} label="Total customers" value={num(customers)} sub={d.growth?.data?.length ? `${d.growth.data.slice(-1)[0].new} new last month` : "Active accounts"} tone="blue" spark={d.growth?.data} sparkKey="total" />
        <Kpi icon={<FaBalanceScale />} label="Previous balance" value={kes(bal)} sub="Carried down" tone="purple" />
        <Kpi icon={<FaChartLine />} label="Current revenue" value={kes(bills)} sub={last ? `${mLabel(last.month)}: ${kes(last.billed)}` : "Billed"} tone="blue" delta={last && prev ? change(last.billed, prev.billed) : null} spark={trend} sparkKey="billed" />
        <Kpi icon={<FaMoneyBillWave />} label="Total revenue due" value={kes(total)} sub="Current + previous balance" tone="green" />
        <Kpi icon={<FaWallet />} label="Amount paid" value={kes(paid)} sub={efficiency > 0 ? `${efficiency}% collection rate` : "No payments yet"} tone="amber" delta={last && prev ? change(last.paid, prev.paid) : null} spark={trend} sparkKey="paid" />
        <Kpi icon={<FaExclamationTriangle />} label="Outstanding balance" value={kes(balance)} sub={balance > 0 ? "Needs attention" : "All paid up"} tone="red" delta={last && prev ? change(last.outstanding, prev.outstanding) : null} invert spark={trend} sparkKey="outstanding" />
        <Kpi icon={<FaWater />} label="Units consumed" value={`${num(units_used)} m³`} sub={`Avg ${units} m³ per bill`} tone="cyan" delta={last && prev ? change(last.units, prev.units) : null} spark={trend} sparkKey="units" />
        <Kpi icon={<FaPercentage />} label="Revenue per m³" value={cs ? kes(cs.yield_per_unit) : "-"} sub="Cash collected per unit, latest cycle" tone="green" />
      </div>

      <div className={styles.secondaryGrid}>
        <div className={styles.mini}><span>Collection efficiency</span><strong>{efficiency}%</strong>
          <div className={styles.bar}><div className={`${styles.barFill} ${styles[rateTone(efficiency)]}`} style={{ width: `${efficiency}%` }} /></div></div>
        <div className={styles.mini}><span>Avg bill per customer</span><strong>{kes(avgBillPerCustomer)}</strong></div>
        <div className={styles.mini}><span>Avg payment per customer</span><strong>{kes(avgPaidPerCustomer)}</strong></div>
        <div className={styles.mini}><span>Penalties charged (all time)</span><strong>{kes(s?.penalties_total)}</strong></div>
        <div className={styles.mini}><span>Meter readings complete</span><strong>{readingPct ?? "-"}%</strong>
          <div className={styles.bar}><div className={`${styles.barFill} ${styles[rateTone(readingPct || 0)]}`} style={{ width: `${readingPct || 0}%` }} /></div></div>
        <div className={styles.mini}><span>Customers owing (latest cycle)</span><strong>{num(d.debtors?.debtor_count)}</strong></div>
      </div>

      {/* ---------------- insights ---------------- */}
      <Card title="What needs your attention" sub="Generated automatically from the numbers on this page" wide>
        <ul className={styles.insights}>
          {insights.map((i, k) => (
            <li key={k} className={`${styles.insight} ${styles[i.tone]}`}>
              {i.tone === "good" ? <FaCheckCircle /> : <FaExclamationTriangle />}
              <div><p>{i.text}</p>{i.action && <small>Suggested action: {i.action}</small>}</div>
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------------- trends ---------------- */}
      <div className={styles.grid2}>
        <Card title="Billing versus collections" sub={`Monthly billed, paid and collection rate (last ${months} months)`}>
          {trend.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mLabel} />
                <YAxis yAxisId="l" tickFormatter={short} />
                <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip labelFormatter={mLabel} formatter={(v, n) => (n === "Collection %" ? [`${v}%`, n] : [kes(v), n])} />
                <Legend />
                <Bar yAxisId="l" dataKey="due" name="Due" fill={C.blue} radius={[3, 3, 0, 0]} />
                <Bar yAxisId="l" dataKey="paid" name="Paid" fill={C.green} radius={[3, 3, 0, 0]} />
                <Line yAxisId="r" dataKey="collection_rate" name="Collection %" stroke={C.amber} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card title="Water consumption" sub="Total units billed per month (m³)">
          {trend.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mLabel} />
                <YAxis tickFormatter={short} />
                <Tooltip labelFormatter={mLabel} formatter={(v) => [`${num(v)} m³`, "Units"]} />
                <Area type="monotone" dataKey="units" stroke={C.cyan} fill={C.cyan} fillOpacity={0.18} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card title="Outstanding balance over time" sub="Unpaid amount at the end of each month">
          {trend.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mLabel} />
                <YAxis tickFormatter={short} />
                <Tooltip labelFormatter={mLabel} formatter={(v, n) => [kes(v), n]} />
                <Bar dataKey="outstanding" name="Outstanding" fill={C.red} radius={[3, 3, 0, 0]} />
                <Line dataKey="penalty" name="Penalties" stroke={C.purple} strokeWidth={2} dot={false} />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card title="Customer growth" sub="New connections per month and total customers">
          {d.growth?.data?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={d.growth.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mLabel} />
                <YAxis yAxisId="l" allowDecimals={false} />
                <YAxis yAxisId="r" orientation="right" />
                <Tooltip labelFormatter={mLabel} />
                <Legend />
                <Bar yAxisId="l" dataKey="new" name="New customers" fill={C.blue} radius={[3, 3, 0, 0]} />
                <Line yAxisId="r" dataKey="total" name="Total customers" stroke={C.green} strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
      </div>

      {/* ---------------- where is the money ---------------- */}
      <div className={styles.grid2}>
        <Card title="Payment behaviour" sub={`Customers by payment status, ${s?.cycle || "latest cycle"}`}>
          {s && mix.some((m) => m.value) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`}>
                  {mix.map((m) => <Cell key={m.name} fill={m.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card title="Consumption bands" sub={`How many customers use how much water (m³), ${d.bands?.cycle || "latest cycle"}`}>
          {d.bands?.data?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={d.bands.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="band" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [v, "Customers"]} />
                <Bar dataKey="count" fill={C.cyan} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card title="Zone performance" sub="Paid versus unpaid, ranked by outstanding balance" wide>
          {zones.length ? (
            <div className={styles.zoneWrap}>
              <ResponsiveContainer width="100%" height={Math.max(240, zones.length * 38)}>
                <BarChart data={zones} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={short} />
                  <YAxis type="category" dataKey="zone" width={90} />
                  <Tooltip formatter={(v, n) => [kes(v), n]} />
                  <Legend />
                  <Bar dataKey="paid" name="Paid" stackId="a" fill={C.green} />
                  <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill={C.red} />
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th>Zone</th><th>Customers</th><th>Avg m³</th><th>Due</th><th>Outstanding</th><th>Collection</th></tr></thead>
                  <tbody>
                    {zones.map((z) => (
                      <tr key={z.zone}><td>{z.zone}</td><td>{num(z.customers)}</td><td>{z.avg_units}</td><td>{kes(z.due)}</td><td>{kes(z.outstanding)}</td><td><RateBar value={z.collection_rate} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <Empty />}
        </Card>

        <Card title="Customer groups" sub="Latest cycle by group">
          {d.groups?.data?.length ? (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Group</th><th>Customers</th><th>Units</th><th>Due</th><th>Collection</th></tr></thead>
                <tbody>{d.groups.data.map((g) => <tr key={g.grp}><td>{g.grp || "-"}</td><td>{num(g.customers)}</td><td>{num(g.units)}</td><td>{kes(g.due)}</td><td><RateBar value={g.collection_rate} /></td></tr>)}</tbody>
              </table>
            </div>
          ) : <Empty />}
        </Card>

        <Card title="Tariff rates" sub="Revenue and volume by rate per m³">
          {d.tariffs?.data?.length ? (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Rate</th><th>Customers</th><th>Units</th><th>Billed</th><th>Collection</th></tr></thead>
                <tbody>{d.tariffs.data.map((t) => <tr key={t.rate}><td>{kes(t.rate)}</td><td>{num(t.customers)}</td><td>{num(t.units)}</td><td>{kes(t.billed)}</td><td><RateBar value={t.collection_rate} /></td></tr>)}</tbody>
              </table>
            </div>
          ) : <Empty />}
        </Card>
      </div>

      {/* ---------------- who to act on ---------------- */}
      <div className={styles.grid2}>
        <Card title={<><FaGavel /> Top debtors</>} sub={d.debtors ? `Top 10 hold ${d.debtors.top_share}% of ${kes(d.debtors.total_outstanding)} owed` : ""}>
          {d.debtors?.data?.length ? (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Customer</th><th>Zone</th><th>Owes</th><th>Share</th></tr></thead>
                <tbody>{d.debtors.data.map((x) => <tr key={x.user_id}><td>{x.name}<small>{x.phone}</small></td><td>{x.zone}</td><td className={styles.negative}>{kes(x.outstanding)}</td><td>{x.share}%</td></tr>)}</tbody>
              </table>
            </div>
          ) : <Empty text="No customers owe money in the latest cycle." />}
        </Card>

        <Card title="Top consumers" sub={d.consumers ? `Top 10 use ${d.consumers.top_share}% of ${num(d.consumers.total_units)} m³` : ""}>
          {d.consumers?.data?.length ? (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Customer</th><th>Zone</th><th>Units</th><th>Bill</th><th>Share</th></tr></thead>
                <tbody>{d.consumers.data.map((x) => <tr key={x.user_id}><td>{x.name}</td><td>{x.zone}</td><td>{num(x.units)} m³</td><td>{kes(x.bill)}</td><td>{x.share}%</td></tr>)}</tbody>
              </table>
            </div>
          ) : <Empty />}
        </Card>

        <Card title="Meter reading quality" sub={d.anomalies ? `Flag threshold: above ${d.anomalies.threshold} m³ (3× the ${d.anomalies.average_units} m³ average)` : ""} wide>
          {d.anomalies ? (
            <>
              <div className={styles.secondaryGrid}>
                <div className={styles.mini}><span>Pending readings</span><strong>{d.anomalies.pending}</strong></div>
                <div className={styles.mini}><span>Zero consumption</span><strong>{d.anomalies.zero}</strong></div>
                <div className={styles.mini}><span>Lower than previous</span><strong>{d.anomalies.negative}</strong></div>
                <div className={styles.mini}><span>High consumption</span><strong>{d.anomalies.spike}</strong></div>
                <div className={styles.mini}><span>Locked readings</span><strong>{s?.locked_readings ?? 0}</strong></div>
              </div>
              {d.anomalies.data.length > 0 && (
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead><tr><th>Customer</th><th>Meter</th><th>Zone</th><th>Previous</th><th>Current</th><th>Units</th><th>Issue</th></tr></thead>
                    <tbody>{d.anomalies.data.map((x, k) => <tr key={k}><td>{x.name}</td><td>{x.metre_num}</td><td>{x.zone}</td><td>{x.prev}</td><td>{x.cur ?? "-"}</td><td>{x.units ?? "-"}</td><td><span className={styles.tag}>{x.issue}</span></td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </>
          ) : <Empty />}
        </Card>
      </div>

      {/* ---------------- original overview chart (kept) ---------------- */}
      <Card title="Key metrics overview" sub="All-time totals at a glance" wide>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={metricsData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={short} />
            <YAxis type="category" dataKey="name" width={130} />
            <Tooltip formatter={(value, name, props) => [props?.payload?.formatted || value, ""]} />
            <Bar dataKey="value">{metricsData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ---------------- system health ---------------- */}
      <div className={styles.grid2}>
        <Card title="System health">
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} style={{ background: efficiency >= 70 ? C.green : C.amber }} />
            <strong>{efficiency >= 70 ? "Healthy" : "Monitor"}</strong>
          </div>
          <div className={styles.statusStats}>
            <div><span>Collection rate</span><strong>{efficiency}%</strong></div>
            <div><span>Active customers</span><strong>{num(customers)}</strong></div>
            <div><span>Avg units</span><strong>{units} m³</strong></div>
            <div><span>System users</span><strong>{s?.staff?.users ?? "-"}</strong></div>
            <div><span>Administrators</span><strong>{s?.staff?.admins ?? "-"}</strong></div>
          </div>
        </Card>
        <Card title="Billing status" sub="Bills by status, latest cycle">
          {d.status?.data?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.status.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Bills" fill={C.purple} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
      </div>

      <div className={styles.footer}>
        <p>&copy; 2026 Water Billing System. All rights reserved.</p>
        <span>v3.0.0</span>
      </div>
    </div>
  );
}

export default Analytics;