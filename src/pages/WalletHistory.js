import React, { useState, useEffect } from 'react';
import { Wallet, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import { withdrawalApi } from '../api/services';
import '../styles/Customers.css';

const WalletHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currency, setCurrency] = useState({ value: '\u20B9' });
  const [gst, setGst] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistory(params);
      const d = res.data;
      setData(d.wallet || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
      if (d.currency) setCurrency(d.currency);
      if (d.gst !== undefined) setGst(d.gst);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, paymentMethod, fromDate, toDate]);

  const handleClear = () => { setSearch(''); setPaymentMethod(''); setFromDate(''); setToDate(''); setPage(1); };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistoryCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'wallet_history.csv'; a.click();
    } catch (e) { alert('Failed to export CSV'); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistoryPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e) { alert('Failed to export PDF'); }
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
            <h2 className="cust-title">Wallet History</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={handleExportCSV} className="cust-btn cust-btn-success">CSV Report</button>
          <button onClick={handleExportPDF} className="cust-btn cust-btn-info">PDF Report</button>
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
            <label className="cust-filter-label">Method</label>
            <select value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(1); }} className="cust-input">
              <option value="">All Methods</option>
              <option value="admin">Admin</option>
              <option value="razorpay">Razorpay</option>
              <option value="refund">Refund</option>
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
            {(search || paymentMethod || fromDate || toDate) && (
              <button onClick={handleClear} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading wallet history..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Amount ({currency.value || '\u20B9'})</th>
                  <th>GST ({gst}%)</th>
                  <th>Total ({currency.value || '\u20B9'})</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={10} className="cust-no-data">No wallet history found.</td></tr>
                ) : data.map((row, i) => {
                  const amt = parseFloat(row.amount || 0);
                  const gstAmt = (amt * gst) / 100;
                  const total = (amt + gstAmt).toFixed(2);
                  const status = row.paymentStatus || '';
                  const statusCls = status === 'success' ? 'verified' : 'unverified';

                  return (
                    <tr key={row.id || i}>
                      <td>{(pagination?.start || 0) + i}</td>
                      <td>
                        {row.userProfile ? (
                          <img src={row.userProfile} alt="" className="cust-avatar" />
                        ) : (
                          <img
                            src={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">${encodeURIComponent((row.userName || '?')[0])}</text></svg>`}
                            alt="" className="cust-avatar"
                          />
                        )}
                      </td>
                      <td className="cust-name-cell">{row.userName || '-'}</td>
                      <td>{row.userContact || '-'}</td>
                      <td>{amt.toFixed(2)}</td>
                      <td>{gstAmt.toFixed(2)}</td>
                      <td className="cust-name-cell">{total}</td>
                      <td className="cust-date-cell">{formatDateTime(row.created_at)}</td>
                      <td>{row.paymentMode ? row.paymentMode.charAt(0).toUpperCase() + row.paymentMode.slice(1) : '-'}</td>
                      <td>
                        <span className={`cust-verify-badge ${statusCls}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {renderSmartPagination()}
      </div>
    </div>
  );
};

export default WalletHistory;
