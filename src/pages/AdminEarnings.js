import React, { useState, useEffect } from 'react';
import { earningApi } from '../api/services';
import Loader from '../components/Loader';
import { Wallet, FileSpreadsheet, Search, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const AdminEarnings = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await earningApi.adminEarnings(params);
      const d = res.data.data || res.data;
      setData(d.earnings || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching admin earnings:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, orderType, dateApplied]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleExportCsv = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await earningApi.adminExportCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'admin_earnings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handleDateSubmit = () => {
    setDateApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setOrderType('');
    setFromDate(moment().toDate());
    setToDate(moment().toDate());
    setDateApplied(false);
    setPage(1);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    if (start > 1) { pages.push(1); if (start > 2) pages.push('dots-start'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('dots-end'); pages.push(totalPages); }
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Page {page} of {totalPages} ({totalRecords} total)
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Wallet size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Admin Earnings</h2>
            <div className="cust-count">{totalRecords} total records</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={handleExportCsv} className="cust-btn cust-btn-success">
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search user/astrologer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              className="cust-input cust-search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="cust-filter-group">
          <label className="cust-filter-label">Order Type</label>
          <select
            value={orderType}
            onChange={e => { setOrderType(e.target.value); setPage(1); }}
            className="cust-input"
          >
            <option value="">All</option>
            <option value="chat">Chat</option>
            <option value="call">Call</option>
            <option value="report">Report</option>
          </select>
        </div>

        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">From</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={fromDate}
                onChange={date => { setFromDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={toDate}
                onChange={date => { setToDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-actions">
            <button onClick={handleDateSubmit} className="cust-btn cust-btn-primary">
              <Search size={13} /> Apply
            </button>
            {(search || dateApplied || orderType) && (
              <button onClick={clearFilters} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card + Table */}
      <div className="cust-card">
        {loading ? <Loader text="Loading earnings..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order Type</th>
                  <th>User</th>
                  <th>Astrologer</th>
                  <th>Duration</th>
                  <th>Total Amount</th>
                  <th>Admin Earning</th>
                  <th>Expert Earning</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(page - 1) * 15 + i + 1}</td>
                    <td>
                      <span className={`cust-req-badge ${row.orderType === 'chat' ? 'blue' : 'purple'}`}>
                        {row.orderType || '-'}
                      </span>
                    </td>
                    <td className="cust-name-cell">{row.UserName || '-'}</td>
                    <td className="cust-name-cell">{row.astrologerName || '-'}</td>
                    <td>{row.totalMin ? `${row.totalMin} min` : '-'}</td>
                    <td>{row.totalPayable != null ? `₹${Number(row.totalPayable).toFixed(2)}` : '-'}</td>
                    <td>
                      <span className="cust-verify-badge verified">
                        {row.adminearningAmount != null ? `₹${Number(row.adminearningAmount).toFixed(2)}` : '-'}
                      </span>
                    </td>
                    <td>{row.totalPayable != null && row.adminearningAmount != null ? `₹${(Number(row.totalPayable) - Number(row.adminearningAmount)).toFixed(2)}` : '-'}</td>
                    <td className="cust-date-cell">{formatDate(row.updated_at || row.created_at)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="cust-no-data">No earnings data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>
    </div>
  );
};

export default AdminEarnings;
