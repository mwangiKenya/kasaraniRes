import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Clock,
  BarChart3,
  Activity,
  Users,
  TrendingUp,
  Eye,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Printer,
  FileText,
  Grid3x3,
  List
} from 'lucide-react';
import styles from './ReadingsHistory.module.css';
import axios from 'axios';

// ---------------------------------------------------------------------------
// All of the pieces below used to be defined *inside* ReadingsHistory().
// That meant a brand new function (= a brand new component type, as far as
// React is concerned) was created on every single render. Since typing in the
// search box triggers a re-render, React would unmount the "old" FilterBar
// (destroying the <input> and its focus) and mount a "new" one on every
// keystroke - that's what caused the one-letter-at-a-time behavior.
//
// Moving them out here as stable, top-level components (that just receive
// props) fixes it: React now recognizes them as the *same* component across
// renders and simply updates props/DOM, so the input never unmounts.
// ---------------------------------------------------------------------------

const StatsCards = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      icon: <FileText size={20} />,
      label: 'Total Readings',
      value: summary.total_records,
      color: '#3B82F6'
    },
    {
      icon: <Activity size={20} />,
      label: 'Total Units Used',
      value: summary.total_units?.toLocaleString() || 0,
      color: '#10B981'
    },
    {
      icon: <Users size={20} />,
      label: 'Unique Customers',
      value: summary.unique_customers || 0,
      color: '#8B5CF6'
    },
    {
      icon: <Calendar size={20} />,
      label: 'Latest Cycle',
      value: summary.latest_cycle?.cycle_month || 'N/A',
      color: '#F59E0B'
    }
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FilterBar = ({
  searchValue,
  onSearchChange,
  onClearSearch,
  showFilters,
  onToggleFilters,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  loading
}) => {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterSearch}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchValue}
          onChange={onSearchChange}
          className={styles.searchInput}
          autoComplete="off"
          spellCheck="false"
        />
        {searchValue && (
          <button
            className={styles.clearSearchBtn}
            onClick={onClearSearch}
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <button
        className={styles.filterToggle}
        onClick={onToggleFilters}
        type="button"
      >
        <Filter size={18} />
        <span>Filters</span>
        <ChevronDown size={16} className={showFilters ? styles.rotate180 : ''} />
      </button>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
          onClick={() => onViewModeChange('table')}
          title="Table View"
          type="button"
        >
          <Grid3x3 size={18} />
        </button>
        <button
          className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.active : ''}`}
          onClick={() => onViewModeChange('cards')}
          title="Card View"
          type="button"
        >
          <List size={18} />
        </button>
      </div>

      <button
        className={styles.refreshBtn}
        onClick={onRefresh}
        title="Refresh"
        type="button"
        disabled={loading}
      >
        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
      </button>

      <button
        className={styles.exportBtn}
        onClick={onExport}
        title="Export to CSV"
        type="button"
      >
        <Download size={18} />
        <span>Export</span>
      </button>
    </div>
  );
};

const AdvancedFilters = ({
  showFilters,
  filters,
  cycleMonths,
  recordedByOptions,
  onFilterChange,
  onClearFilters
}) => {
  if (!showFilters) return null;

  return (
    <div className={styles.advancedFilters}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Cycle Month</label>
          <select
            value={filters.cycle_month}
            onChange={(e) => onFilterChange('cycle_month', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Cycles</option>
            {cycleMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Recorded By</label>
          <select
            value={filters.recorded_by}
            onChange={(e) => onFilterChange('recorded_by', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Users</option>
            {recordedByOptions.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <button
          className={styles.clearFiltersBtn}
          onClick={onClearFilters}
          type="button"
        >
          <X size={16} />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

const getUnitsStatus = (units) => {
  if (units === 0) return 'zero';
  if (units < 50) return 'low';
  if (units < 100) return 'medium';
  return 'high';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TableView = ({ readings, pagination, onRowClick }) => {
  if (readings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Info size={48} />
        <h3>No Reading Records Found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Contact</th>
            <th>Previous</th>
            <th>Current</th>
            <th>Units</th>
            <th>Rate</th>
            <th>Cycle</th>
            <th>Recorded By</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading, index) => {
            const unitsStatus = getUnitsStatus(reading.units_used);
            return (
              <tr key={reading.id} className={styles.tableRow}>
                <td className={styles.rowNumber}>
                  {(pagination.page - 1) * pagination.page_size + index + 1}
                </td>
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.customerName}>{reading.name}</div>
                    <div className={styles.customerId}>ID: {reading.user_id}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.contactCell}>
                    <Phone size={14} className={styles.contactIcon} />
                    <span>{reading.phone || 'N/A'}</span>
                  </div>
                </td>
                <td>{reading.prev_user || 0}</td>
                <td>{reading.cur_user || 0}</td>
                <td>
                  <span className={`${styles.unitsBadge} ${styles[unitsStatus]}`}>
                    {reading.units_used || 0}
                  </span>
                </td>
                <td>KES {reading.rate || 0}</td>
                <td>
                  <span className={styles.cycleBadge}>
                    {reading.cycle_month || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={styles.recordedByBadge}>
                    {reading.recorded_by || 'system'}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  <div>{formatDate(reading.reading_date)}</div>
                  <div className={styles.timeAgo}>
                    <Clock size={12} />
                    <span>{formatTimestamp(reading.timestamp)}</span>
                  </div>
                </td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onRowClick(reading)}
                    type="button"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const CardView = ({ readings, onRowClick }) => {
  if (readings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Info size={48} />
        <h3>No Reading Records Found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {readings.map((reading) => {
        const unitsStatus = getUnitsStatus(reading.units_used);
        return (
          <div key={reading.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardCustomer}>
                <div className={styles.cardAvatar}>
                  {reading.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className={styles.cardCustomerInfo}>
                  <div className={styles.cardName}>{reading.name}</div>
                  <div className={styles.cardId}>ID: {reading.user_id}</div>
                </div>
              </div>
              <span className={`${styles.cardUnitsBadge} ${styles[unitsStatus]}`}>
                {reading.units_used || 0} units
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <Phone size={14} />
                  <span>Phone</span>
                </div>
                <div className={styles.cardValue}>{reading.phone || 'N/A'}</div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <User size={14} />
                  <span>Metre No</span>
                </div>
                <div className={styles.cardValue}>{reading.metre_num || 'N/A'}</div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <BarChart3 size={14} />
                  <span>Previous / Current</span>
                </div>
                <div className={styles.cardValue}>
                  {reading.prev_user || 0} → {reading.cur_user || 0}
                </div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <Calendar size={14} />
                  <span>Cycle</span>
                </div>
                <div className={styles.cardValue}>
                  <span className={styles.cycleBadge}>{reading.cycle_month || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <Clock size={14} />
                  <span>Recorded</span>
                </div>
                <div className={styles.cardValue}>
                  {formatTimestamp(reading.timestamp)}
                </div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardLabel}>
                  <User size={14} />
                  <span>Recorded By</span>
                </div>
                <div className={styles.cardValue}>
                  <span className={styles.recordedByBadge}>
                    {reading.recorded_by || 'system'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.cardRate}>Rate: KES {reading.rate || 0}</span>
              <button
                className={styles.cardViewBtn}
                onClick={() => onRowClick(reading)}
                type="button"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailModal = ({ reading, onClose }) => {
  if (!reading) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Reading Details</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            <div className={styles.detailSection}>
              <h3>Customer Information</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{reading.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>User ID</span>
                <span className={styles.detailValue}>{reading.user_id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{reading.phone || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Metre Number</span>
                <span className={styles.detailValue}>{reading.metre_num || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Group</span>
                <span className={styles.detailValue}>{reading.grp || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Parent</span>
                <span className={styles.detailValue}>{reading.parent || 'N/A'}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Reading Information</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Previous Reading</span>
                <span className={styles.detailValue}>{reading.prev_user || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Previous Supply</span>
                <span className={styles.detailValue}>{reading.prev_sup || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Current Reading</span>
                <span className={styles.detailValue}>{reading.cur_user || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Current Supply</span>
                <span className={styles.detailValue}>{reading.cur_sup || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mid User</span>
                <span className={styles.detailValue}>{reading.mid_user || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mid Supply</span>
                <span className={styles.detailValue}>{reading.mid_sup || 0}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Billing Information</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Units Used</span>
                <span className={`${styles.detailValue} ${styles.highlightValue}`}>
                  {reading.units_used || 0}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Rate</span>
                <span className={styles.detailValue}>KES {reading.rate || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Cycle Month</span>
                <span className={styles.detailValue}>
                  <span className={styles.cycleBadge}>{reading.cycle_month || 'N/A'}</span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Reading Date</span>
                <span className={styles.detailValue}>{formatDate(reading.reading_date)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Previous Date</span>
                <span className={styles.detailValue}>{formatDate(reading.prev_date)}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Audit Information</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Recorded By</span>
                <span className={styles.detailValue}>
                  <span className={styles.recordedByBadge}>
                    {reading.recorded_by || 'system'}
                  </span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Role</span>
                <span className={styles.detailValue}>{reading.role || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Version</span>
                <span className={styles.detailValue}>v{reading.version || 1}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Timestamp</span>
                <span className={styles.detailValue}>{formatTimestamp(reading.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className={styles.modalPrintBtn}
            onClick={() => window.print()}
            type="button"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  if (pagination.total_pages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let end = Math.min(pagination.total_pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        type="button"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button className={styles.pageBtn} onClick={() => onPageChange(1)} type="button">1</button>
          {start > 2 && <span className={styles.pageDots}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`${styles.pageBtn} ${page === pagination.page ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}

      {end < pagination.total_pages && (
        <>
          {end < pagination.total_pages - 1 && <span className={styles.pageDots}>...</span>}
          <button className={styles.pageBtn} onClick={() => onPageChange(pagination.total_pages)} type="button">
            {pagination.total_pages}
          </button>
        </>
      )}

      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.total_pages}
        type="button"
      >
        <ChevronRight size={16} />
      </button>

      <div className={styles.pageInfo}>
        Showing {(pagination.page - 1) * pagination.page_size + 1} - {Math.min(pagination.page * pagination.page_size, pagination.total_count)} of {pagination.total_count} records
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ReadingsHistory = () => {
  // State variables
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_count: 0,
    total_pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    cycle_month: '',
    start_date: '',
    end_date: '',
    recorded_by: ''
  });

  // Debounced search value - this is what actually triggers the API call
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedReading, setSelectedReading] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cycleMonths, setCycleMonths] = useState([]);
  const [recordedByOptions, setRecordedByOptions] = useState([]);

  // Refs for debouncing
  const searchTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://python-back-2.onrender.com/api';

  // Debounce search function
  const debounceSearch = useCallback((value) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    }, 400); // 400ms delay for smooth typing experience
  }, []);

  // Handle search input change - updates immediately for UI, debounced for API
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Update the search value in filters immediately (for UI)
    setFilters(prev => ({ ...prev, search: value }));
    // Debounce the API call
    debounceSearch(value);
  };

  // Handle search clear
  const handleClearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
    setDebouncedSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Fetch reading history
  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use debouncedSearch for the API call, not the raw input value
      const params = new URLSearchParams({
        page: pagination.page,
        page_size: pagination.page_size,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.cycle_month && { cycle_month: filters.cycle_month }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.recorded_by && { recorded_by: filters.recorded_by })
      });

      const response = await axios.get(`${API_BASE_URL}/reading-history/?${params}`);

      if (response.data.success) {
        setReadings(response.data.data);
        setSummary(response.data.summary);
        setPagination(response.data.pagination);

        // Extract unique cycle months and recorded_by for filters
        if (response.data.data.length > 0) {
          const months = [...new Set(response.data.data.map(r => r.cycle_month))].filter(Boolean);
          const recorded = [...new Set(response.data.data.map(r => r.recorded_by))].filter(Boolean);
          setCycleMonths(months.sort().reverse());
          setRecordedByOptions(recorded);
        }
      } else {
        setError(response.data.error || 'Failed to fetch readings');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.page_size, debouncedSearch, filters.cycle_month, filters.start_date, filters.end_date, filters.recorded_by, API_BASE_URL]);

  // Fetch data when debounced search or filters change
  useEffect(() => {
    // Skip the first render to avoid double fetch
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchReadings();
  }, [fetchReadings]);

  // Initial fetch - only once on mount
  useEffect(() => {
    fetchReadings();
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle filter change (non-search filters)
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear search
    setFilters({
      search: '',
      cycle_month: '',
      start_date: '',
      end_date: '',
      recorded_by: ''
    });
    setDebouncedSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle row click to show details
  const handleRowClick = (reading) => {
    setSelectedReading(reading);
    setShowDetailModal(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (readings.length === 0) return;

    const headers = ['ID', 'Name', 'Phone', 'Metre No', 'Group', 'Previous', 'Current', 'Units Used', 'Rate', 'Cycle Month', 'Recorded By', 'Date'];
    const csvData = readings.map(r => [
      r.id,
      r.name,
      r.phone,
      r.metre_num,
      r.grp,
      r.prev_user,
      r.cur_user,
      r.units_used,
      r.rate,
      r.cycle_month,
      r.recorded_by,
      r.reading_date
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Activity size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Reading History</h1>
            <p className={styles.subtitle}>Complete audit trail of all meter readings</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerBadge}>
            <AlertCircle size={16} />
            <span>v{summary?.total_records || 0} records</span>
          </div>
        </div>
      </div>

      <StatsCards summary={summary} />

      <div className={styles.content}>
        <FilterBar
          searchValue={filters.search}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onRefresh={fetchReadings}
          onExport={exportToCSV}
          loading={loading}
        />
        <AdvancedFilters
          showFilters={showFilters}
          filters={filters}
          cycleMonths={cycleMonths}
          recordedByOptions={recordedByOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {loading && readings.length === 0 ? (
          <div className={styles.loadingState}>
            <RefreshCw size={40} className={styles.spinning} />
            <p>Loading reading history...</p>
          </div>
        ) : error && readings.length === 0 ? (
          <div className={styles.errorState}>
            <AlertCircle size={48} />
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button onClick={fetchReadings} className={styles.retryBtn} type="button">
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <TableView readings={readings} pagination={pagination} onRowClick={handleRowClick} />
            ) : (
              <CardView readings={readings} onRowClick={handleRowClick} />
            )}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {showDetailModal && (
        <DetailModal
          reading={selectedReading}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ReadingsHistory;