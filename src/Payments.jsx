import React, { useState, useEffect } from 'react';
import styles from './Payments.module.css';
import { toast } from 'react-toastify';

// Use the same BACKEND_URL pattern as your working Readings component
const BACKEND_URL = "https://python-back-2.onrender.com/api";
// const BACKEND_URL = "http://127.0.0.1:8000/api";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total_payments: 0,
    total_amount: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
    payment_method: '',
    status: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch payment history
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.status) params.append('status', filters.status);
      
      // ✅ FIX: Use BACKEND_URL consistently
      const url = `${BACKEND_URL}/payment-history/${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('Fetching from:', url); // Debug log
      
      const response = await fetch(url);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
        setSummary(data.summary);
        toast.success(`Loaded ${data.data.length} payment records`);
      } else {
        setError(data.error || 'Failed to fetch payment history');
        toast.error(data.error || 'Failed to fetch payment history');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error: ' + err.message);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount and when filters change
  useEffect(() => {
    fetchPayments();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      start_date: '',
      end_date: '',
      payment_method: '',
      status: ''
    });
    setCurrentPage(1);
  };

  // Handle row click to show details
  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      'COMPLETED': styles.statusCompleted,
      'PENDING': styles.statusPending,
      'FAILED': styles.statusFailed,
      'REVERSED': styles.statusReversed,
      'CANCELLED': styles.statusCancelled
    };
    return statusMap[status] || styles.statusDefault;
  };

  // Get payment method badge
  const getMethodBadge = (method) => {
    const methodMap = {
      'CASH': styles.methodCash,
      'M-PESA': styles.methodMpesa,
      'BANK': styles.methodBank,
      'EXCEL': styles.methodExcel,
      'BULK': styles.methodBulk,
      'CHEQUE': styles.methodCheque,
      'ONLINE': styles.methodOnline
    };
    return methodMap[method] || styles.methodDefault;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Payments</h3>
        <p>{error}</p>
        <button onClick={fetchPayments} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.paymentsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Payment History</h1>
        <div className={styles.headerActions}>
          <button className={styles.exportButton} onClick={() => window.open(`${BACKEND_URL}/payment-history/export/`, '_blank')}>
            📊 Export
          </button>
          <button className={styles.refreshButton} onClick={fetchPayments}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>💰</div>
          <div className={styles.summaryContent}>
            <p className={styles.summaryLabel}>Total Payments</p>
            <p className={styles.summaryValue}>{summary.total_payments}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📈</div>
          <div className={styles.summaryContent}>
            <p className={styles.summaryLabel}>Total Amount</p>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_amount)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryContent}>
            <p className={styles.summaryLabel}>Average Payment</p>
            <p className={styles.summaryValue}>
              {formatCurrency(summary.total_payments > 0 ? summary.total_amount / summary.total_payments : 0)}
            </p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>👥</div>
          <div className={styles.summaryContent}>
            <p className={styles.summaryLabel}>Unique Customers</p>
            <p className={styles.summaryValue}>
              {new Set(payments.map(p => p.user_id)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name or phone..."
              value={filters.search}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Payment Method</label>
            <select
              name="payment_method"
              value={filters.payment_method}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="M-PESA">M-Pesa</option>
              <option value="BANK">Bank Transfer</option>
              <option value="EXCEL">Excel Upload</option>
              <option value="BULK">Bulk Update</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online Payment</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REVERSED">Reversed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterActions}>
            <button onClick={clearFilters} className={styles.clearButton}>
              ✕ Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount Paid</th>
              <th>Previous Balance</th>
              <th>Current Balance</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.length > 0 ? (
              currentPayments.map((payment) => (
                <tr 
                  key={payment.id} 
                  onClick={() => handleRowClick(payment)}
                  className={styles.tableRow}
                >
                  <td className={styles.receiptCell}>
                    {payment.receipt_number || 'N/A'}
                  </td>
                  <td className={styles.nameCell}>{payment.name}</td>
                  <td>{payment.phone}</td>
                  <td className={styles.amountCell}>
                    {formatCurrency(payment.amount_paid)}
                  </td>
                  <td className={styles.balanceCell}>
                    {formatCurrency(payment.previous_balance)}
                  </td>
                  <td className={styles.balanceCell}>
                    {formatCurrency(payment.current_balance)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getMethodBadge(payment.payment_method)}`}>
                      {payment.payment_method_display}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(payment.status)}`}>
                      {payment.status_display}
                    </span>
                  </td>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td className={styles.recordedByCell}>{payment.recorded_by}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📭</span>
                    <p>No payment records found</p>
                    <p className={styles.emptySubtext}>Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {payments.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, payments.length)} of {payments.length} entries
            </div>
            <div className={styles.paginationButtons}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                ← Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`${styles.pageButton} ${currentPage === pageNum ? styles.activePage : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Payment Details */}
      {showModal && selectedPayment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Payment Details</h2>
              <button onClick={closeModal} className={styles.closeModalButton}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalItem}>
                  <label>Receipt Number</label>
                  <p>{selectedPayment.receipt_number || 'N/A'}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Customer Name</label>
                  <p>{selectedPayment.name}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Phone</label>
                  <p>{selectedPayment.phone}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Group</label>
                  <p>{selectedPayment.grp || 'N/A'}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Amount Paid</label>
                  <p className={styles.amountHighlight}>
                    {formatCurrency(selectedPayment.amount_paid)}
                  </p>
                </div>
                <div className={styles.modalItem}>
                  <label>Bill Amount</label>
                  <p>{formatCurrency(selectedPayment.bill_amount)}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Previous Balance</label>
                  <p>{formatCurrency(selectedPayment.previous_balance)}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Current Balance</label>
                  <p>{formatCurrency(selectedPayment.current_balance)}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Payment Method</label>
                  <p>
                    <span className={`${styles.badge} ${getMethodBadge(selectedPayment.payment_method)}`}>
                      {selectedPayment.payment_method_display}
                    </span>
                  </p>
                </div>
                <div className={styles.modalItem}>
                  <label>Status</label>
                  <p>
                    <span className={`${styles.badge} ${getStatusBadge(selectedPayment.status)}`}>
                      {selectedPayment.status_display}
                    </span>
                  </p>
                </div>
                <div className={styles.modalItem}>
                  <label>Payment Date</label>
                  <p>{formatDate(selectedPayment.payment_date)}</p>
                </div>
                <div className={styles.modalItem}>
                  <label>Recorded By</label>
                  <p>{selectedPayment.recorded_by}</p>
                </div>
              </div>
              {selectedPayment.notes && (
                <div className={styles.modalNotes}>
                  <label>Notes</label>
                  <p>{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.closeButton}>
                Close
              </button>
              {selectedPayment.receipt_number && (
                <button 
                  className={styles.printButton}
                  onClick={() => window.open(`${BACKEND_URL}/payment-history/receipt/${selectedPayment.receipt_number}/`, '_blank')}
                >
                  🖨️ Print Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;