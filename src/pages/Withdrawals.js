import React, { useState, useEffect } from 'react';
import { Wallet, Search, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';
import { withdrawalApi } from '../api/services';
import '../styles/Customers.css';

const Withdrawals = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tdsReport, setTdsReport] = useState(null);
  const [walletReport, setWalletReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Release modal
  const [releaseModal, setReleaseModal] = useState(false);
  const [releaseId, setReleaseId] = useState(null);
  const [releaseNote, setReleaseNote] = useState('');

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  // TDS report modal
  const [tdsModal, setTdsModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.getAll(params);
      const d = res.data;
      setData(d.withdrawlRequest || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
      setTdsReport(d.tdsReport || null);
      setWalletReport(d.walletReport || null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, orderType, fromDate, toDate]);

  const handleRelease = async () => {
    if (!releaseNote || releaseNote.length < 10) {
      Swal.fire({ icon: 'warning', title: 'Invalid Note', text: 'Please enter a note (minimum 10 characters)', confirmButtonColor: '#7c3aed' });
      return;
    }
    try {
      await withdrawalApi.release({ del_id: releaseId, note: releaseNote });
      setReleaseModal(false);
      setReleaseNote('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCancel = async () => {
    try {
      await withdrawalApi.cancel({ del_id: cancelId });
      setCancelModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.tdsCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'tds_report.csv'; a.click();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to export CSV', confirmButtonColor: '#7c3aed' }); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.tdsPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to export PDF', confirmButtonColor: '#7c3aed' }); }
  };

  const handleClear = () => {
    setSearch(''); setOrderType(''); setFromDate(''); setToDate(''); setPage(1);
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'unverified',
      Released: 'verified',
      Cancelled: 'unverified'
    };
    const cls = map[status] || 'unverified';
    return <span className={`cust-verify-badge ${cls}`}>{status}</span>;
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, '0');
    const mon = String(dt.getMonth() + 1).padStart(2, '0');
    const yr = dt.getFullYear();
    let hr = dt.getHours(); const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am';
    hr = hr % 12 || 12;
    return `${day}-${mon}-${yr} ${hr}:${min} ${ampm}`;
  };

  const renderSmartPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const current = page;
    let pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('dots-start');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('dots-end');
      if (!pages.includes(total)) pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === current ? 'active' : ''}`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Wallet size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Withdrawal Requests</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={handleExportCSV} className="cust-btn cust-btn-success">CSV Report</button>
          <button onClick={handleExportPDF} className="cust-btn cust-btn-info">PDF Report</button>
          <button onClick={() => setTdsModal(true)} className="cust-btn cust-btn-primary">
            <Eye size={15} /> TDS Summary
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input type="text" placeholder="Search by name or contact..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="cust-input cust-search-input" />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">Status</label>
            <select value={orderType} onChange={e => { setOrderType(e.target.value); setPage(1); }} className="cust-input">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="released">Released</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">From</label>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="cust-input cust-date-input" />
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="cust-input cust-date-input" />
          </div>
          <div className="cust-filter-actions">
            {(search || orderType || fromDate || toDate) && (
              <button onClick={handleClear} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading withdrawals..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>TDS</th>
                  <th>Payable</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} className="cust-no-data">No withdrawal requests found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td>
                      <div className="cust-actions">
                        {row.profileImage ? (
                          <img src={row.profileImage} alt="" className="cust-avatar" />
                        ) : (
                          <img
                            src={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">${encodeURIComponent((row.name || '?')[0])}</text></svg>`}
                            alt="" className="cust-avatar"
                          />
                        )}
                        <div>
                          <div className="cust-name-cell">{row.name}</div>
                          <div className="cust-date-cell">{row.contactNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.country === 'India' ? '\u20B9' : '$'}{row.withdrawAmount || 0}</td>
                    <td>{row.tds_pay_amount || 0}</td>
                    <td>{row.pay_amount || 0}</td>
                    <td className="cust-date-cell">{formatDateTime(row.created_at)}</td>
                    <td>{row.method_name || '-'}</td>
                    <td>{getStatusBadge(row.status || 'Pending')}</td>
                    <td>
                      {row.status === 'Pending' ? (
                        <div className="cust-actions">
                          <button onClick={() => { setReleaseId(row.id); setReleaseNote(''); setReleaseModal(true); }}
                            className="cust-action-btn cust-action-view" title="Release">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => { setCancelId(row.id); setCancelModal(true); }}
                            className="cust-action-btn cust-action-delete" title="Cancel">
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="cust-date-cell">{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderSmartPagination()}
      </div>

      {/* Release Modal */}
      {releaseModal && (
        <div className="cust-overlay" onClick={() => setReleaseModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Release Confirmation</h3>
              <button onClick={() => setReleaseModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <p>Are you sure you want to release this withdrawal?</p>
              <div className="cust-form-group">
                <label>Note (min 10 characters)</label>
                <textarea value={releaseNote} onChange={e => setReleaseNote(e.target.value)}
                  rows={3} placeholder="Enter release note..." />
              </div>
              <div className="cust-form-row">
                <button onClick={() => setReleaseModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Cancel</button>
                <button onClick={handleRelease} className="cust-btn cust-btn-success cust-btn-full">Release</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="cust-overlay" onClick={() => setCancelModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Cancel Confirmation</h3>
              <button onClick={() => setCancelModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <p>Are you sure you want to cancel this withdrawal? The amount will be refunded to the astrologer's wallet.</p>
              <div className="cust-form-row">
                <button onClick={() => setCancelModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">No</button>
                <button onClick={handleCancel} className="cust-btn cust-btn-danger cust-btn-full">Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TDS Summary Modal */}
      {tdsModal && (
        <div className="cust-overlay" onClick={() => setTdsModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>TDS Report Summary</h3>
              <button onClick={() => setTdsModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              {tdsReport && (
                <table className="cust-table">
                  <tbody>
                    <tr>
                      <td className="cust-name-cell">Total Withdraw Amount</td>
                      <td className="cust-name-cell">{tdsReport.total_withdraw}</td>
                    </tr>
                    <tr>
                      <td className="cust-name-cell">Total TDS Deducted</td>
                      <td className="cust-name-cell">{tdsReport.total_tds}</td>
                    </tr>
                    <tr>
                      <td className="cust-name-cell">Total Payable Amount</td>
                      <td className="cust-name-cell">{tdsReport.total_payable}</td>
                    </tr>
                    {walletReport && (
                      <tr>
                        <td className="cust-name-cell">Remaining Wallet Amount</td>
                        <td className="cust-name-cell">{walletReport.remaining_amount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              <button onClick={() => setTdsModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
