import styles from "./Analytics.module.css";
import React, { useEffect, useState } from "react";
import { 
  FaUsers, 
  FaWater, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaWallet, 
  FaPercentage,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign
} from "react-icons/fa";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

function Analytics() {
  const [units_used, setUnitsUsed] = useState(0);
  const [bills, setBills] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [units, setUnits] = useState(0);
  const [paid, setPaid] = useState(0);
  const [error, setError] = useState("");
  const [bal, setBal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Chart data
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', bills: 45000, paid: 32000 },
    { month: 'Feb', bills: 52000, paid: 41000 },
    { month: 'Mar', bills: 48000, paid: 38000 },
    { month: 'Apr', bills: 61000, paid: 52000 },
    { month: 'May', bills: 55000, paid: 46000 },
    { month: 'Jun', bills: 58000, paid: 49000 },
  ]);

  // Payment method distribution
  const [paymentDistribution, setPaymentDistribution] = useState([
    { name: 'M-PESA', value: 45 },
    { name: 'Cash', value: 30 },
    { name: 'Bank Transfer', value: 15 },
    { name: 'Other', value: 10 },
  ]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  // ================= FETCH DATA =================
  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const endpoints = [
        'total_units/',
        'total_bal/',
        'total_bill/',
        'total_paid',
        'total_cust/',
        'avg_units'
      ];
      
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const res = await fetch(`https://python-back-2.onrender.com/api/${endpoint}`);
          if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
          return res.json();
        })
      );

      setUnitsUsed(results[0].total_units || 0);
      setBal(results[1].total_bal || 0);
      setBills(results[2].total_bill || 0);
      setPaid(results[3].total_paid || 0);
      setCustomers(results[4].total_cust || 0);
      setUnits(results[5].avg_units || 0);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate derived metrics
  const total = Number(bills) + Number(bal);
  const balance = total - paid;
  const efficiency = total > 0 ? ((paid / total) * 100).toFixed(1) : 0;
  const avgBillPerCustomer = customers > 0 ? (bills / customers).toFixed(2) : 0;
  const avgPaidPerCustomer = customers > 0 ? (paid / customers).toFixed(2) : 0;
  const collectionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-KE').format(num);
  };

  // Get efficiency level
  const getEfficiencyLevel = () => {
    if (efficiency >= 80) return { label: 'Excellent', color: '#10B981', icon: '✅' };
    if (efficiency >= 60) return { label: 'Good', color: '#F59E0B', icon: '⚠️' };
    return { label: 'Needs Improvement', color: '#EF4444', icon: '❌' };
  };

  const efficiencyLevel = getEfficiencyLevel();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>📊 Analytics Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time insights for water billing system performance
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.lastUpdated}>
            <FaClock className={styles.clockIcon} />
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button onClick={fetchAllData} className={styles.refreshButton}>
            <FaSync /> Refresh
          </button>
          <button className={styles.exportButton}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={fetchAllData}>Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCustomers}`}>
          <div className={styles.kpiIcon}><FaUsers /></div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Customers</span>
            <span className={styles.kpiValue}>{formatNumber(customers)}</span>
            <span className={styles.kpiChange}>Active accounts</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiRevenue}`}>
          <div className={styles.kpiIcon}><FaDollarSign /></div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Revenue</span>
            <span className={styles.kpiValue}>{formatCurrency(total)}</span>
            <span className={styles.kpiChange}>
              {bills > 0 ? `Current month: ${formatCurrency(bills)}` : 'No revenue yet'}
            </span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiPaid}`}>
          <div className={styles.kpiIcon}><FaWallet /></div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Amount Paid</span>
            <span className={styles.kpiValue}>{formatCurrency(paid)}</span>
            <span className={styles.kpiChange}>
              {efficiency > 0 ? `${efficiency}% collection rate` : 'No payments yet'}
            </span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiBalance}`}>
          <div className={styles.kpiIcon}><FaMoneyBillWave /></div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Outstanding Balance</span>
            <span className={`${styles.kpiValue} ${balance > 0 ? styles.negative : styles.positive}`}>
              {formatCurrency(balance)}
            </span>
            <span className={styles.kpiChange}>
              {balance > 0 ? 'Needs attention' : 'All paid up'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary KPI Row */}
      <div className={styles.secondaryKpiGrid}>
        <div className={styles.secondaryCard}>
          <span className={styles.secondaryLabel}>Units Consumed</span>
          <span className={styles.secondaryValue}>{formatNumber(units_used)} m³</span>
          <div className={styles.secondaryTrend}>
            <FaArrowUp className={styles.trendUp} /> Current usage
          </div>
        </div>
        <div className={styles.secondaryCard}>
          <span className={styles.secondaryLabel}>Collection Efficiency</span>
          <span className={styles.secondaryValue}>{efficiency}%</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ 
                width: `${efficiency}%`,
                background: efficiency >= 80 ? '#10B981' : efficiency >= 60 ? '#F59E0B' : '#EF4444'
              }}
            />
          </div>
        </div>
        <div className={styles.secondaryCard}>
          <span className={styles.secondaryLabel}>Avg Bill per Customer</span>
          <span className={styles.secondaryValue}>{formatCurrency(avgBillPerCustomer)}</span>
          <span className={styles.secondarySub}>Monthly average</span>
        </div>
        <div className={styles.secondaryCard}>
          <span className={styles.secondaryLabel}>Avg Payment per Customer</span>
          <span className={styles.secondaryValue}>{formatCurrency(avgPaidPerCustomer)}</span>
          <span className={styles.secondarySub}>Monthly average</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Revenue Trend</h3>
            <span className={styles.chartSubtitle}>Monthly billing vs collections</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="bills" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="paid" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Payment Distribution</h3>
            <span className={styles.chartSubtitle}>By payment method</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Section */}
      <div className={styles.statusSection}>
        <div className={styles.statusCard}>
          <h3>System Health</h3>
          <div className={styles.statusIndicator}>
            <div className={styles.statusDot} style={{ background: efficiency >= 70 ? '#10B981' : '#F59E0B' }} />
            <span className={styles.statusText}>
              {efficiency >= 70 ? 'Healthy' : 'Monitor'}
            </span>
          </div>
          <div className={styles.statusStats}>
            <div>
              <span>Collection Rate</span>
              <strong>{efficiency}%</strong>
            </div>
            <div>
              <span>Active Customers</span>
              <strong>{formatNumber(customers)}</strong>
            </div>
            <div>
              <span>Avg Units</span>
              <strong>{units} m³</strong>
            </div>
          </div>
        </div>

        <div className={styles.insightCard}>
          <h3>💡 Key Insights</h3>
          <ul className={styles.insightList}>
            <li className={balance <= 0 ? styles.insightPositive : styles.insightWarning}>
              {balance <= 0 ? (
                <>
                  <FaCheckCircle /> All payments are up to date
                </>
              ) : (
                <>
                  <FaExclamationTriangle /> Outstanding balance of {formatCurrency(balance)} needs attention
                </>
              )}
            </li>
            <li className={efficiency >= 70 ? styles.insightPositive : styles.insightWarning}>
              {efficiency >= 70 ? (
                <>
                  <FaCheckCircle /> Collection efficiency is {efficiency}% - {efficiencyLevel.label}
                </>
              ) : (
                <>
                  <FaExclamationTriangle /> Collection efficiency is {efficiency}% - {efficiencyLevel.label}
                </>
              )}
            </li>
            <li className={customers > 0 ? styles.insightPositive : styles.insightWarning}>
              {customers > 0 ? (
                <>
                  <FaCheckCircle /> Serving {formatNumber(customers)} customers
                </>
              ) : (
                <>
                  <FaExclamationTriangle /> No customers registered
                </>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>&copy; 2026 Water Billing System. All rights reserved.</p>
        <span>v2.0.0</span>
      </div>
    </div>
  );
}

export default Analytics;