import React, { useState, useEffect, useCallback } from 'react';
import { callHistoryApi } from '../api/services';
import Loader from '../components/Loader';
import formatNumber from '../utils/formatNumber';
import { Phone, FileText, FileSpreadsheet, Search, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const CallHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await callHistoryApi.getAll(params);
      const d = res.data.data || res.data || {};
      setData(Array.isArray(d.callHistory) ? d.callHistory : Array.isArray(d) ? d : []);
      setPagination(d.totalPages ? {
        totalPages: d.totalPages, totalRecords: d.totalRecords,
        start: d.start, end: d.end, page: d.currentPage
      } : null);
    } catch (err) {
      console.error('Error fetching call history:', err);
    }
    setLoading(false);
  }, [page, search, dateApplied]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportCsv = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await callHistoryApi.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'call-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handlePrintPdf = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await callHistoryApi.printPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const handleDateSubmit = () => {
    setDateApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFromDate(moment().toDate());
    setToDate(moment().toDate());
    setDateApplied(false);
    setPage(1);
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, '0');
    const mon = String(dt.getMonth() + 1).padStart(2, '0');
    const yr = dt.getFullYear();
    let hr = dt.getHours();
    const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am';
    hr = hr % 12 || 12;
    return `${day}-${mon}-${yr} ${hr}:${min} ${ampm}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'verified';
      case 'missed': return 'unverified';
      case 'ongoing': return 'purple';
      default: return 'verified';
    }
  };

  const getCallTypeBadge = (type) => {
    if (type === null || type === undefined) return '-';
    const t = String(type).toLowerCase();
    if (t === '11' || t === 'video') return <span className="cust-req-badge purple">Video</span>;
    return <span className="cust-req-badge blue">Audio</span>;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const current = page;
    let pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('dots-start');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('dots-end');
      pages.push(total);
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
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Phone size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Call History</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total records</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={handlePrintPdf} className="cust-btn cust-btn-danger">
            <FileText size={15} /> PDF
          </button>
          <button onClick={handleExportCsv} className="cust-btn cust-btn-success">
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search by name or contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
              className="cust-input cust-search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
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
            {(search || dateApplied) && (
              <button onClick={clearFilters} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading call history..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Astrologer</th>
                  <th>Call Rate</th>
                  <th>Duration (min)</th>
                  <th>Deduction ({'\u20B9'})</th>
                  <th>Admin ({'\u20B9'})</th>
                  <th>Astrologer ({'\u20B9'})</th>
                  <th>Call Type</th>
                  <th>Ended By</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={13} className="cust-no-data">No call history found.</td></tr>
                ) : data.map((row, i) => {
                  const status = row.status || 'completed';
                  const callType = row.callType || row.call_type || 'Audio';
                  return (
                    <tr key={row._id || row.id || i}>
                      <td>{(pagination?.start || ((page - 1) * 10 + 1)) + i}</td>
                      <td className="cust-name-cell">{row.customerName || row.customer?.name || '-'}</td>
                      <td>{row.customerPhone || row.customer?.phone || row.customer?.contactNo || '-'}</td>
                      <td>{row.astrologerName || row.astrologer?.name || '-'}</td>
                      <td>{row.callRate != null ? formatNumber(row.callRate) : '-'}</td>
                      <td>{row.totalMinutes || row.totalMin || row.duration || '0'}</td>
                      <td>{row.deduction != null ? formatNumber(row.deduction) : row.totalDeduction != null ? formatNumber(row.totalDeduction) : '-'}</td>
                      <td style={{color:'#d97706',fontWeight:600}}>{row.deductionFromAstrologer != null ? formatNumber(row.deductionFromAstrologer) : '-'}</td>
                      <td style={{color:'#059669',fontWeight:600}}>{row.deduction != null && row.deductionFromAstrologer != null ? formatNumber(parseFloat(row.deduction) - parseFloat(row.deductionFromAstrologer)) : '-'}</td>
                      <td>{getCallTypeBadge(callType)}</td>
                      <td>
                        {row.endedBy ? (
                          <span className={`cust-req-badge ${row.endedBy === 'astrologer' ? 'purple' : 'blue'}`}>
                            {row.endedBy === 'astrologer' ? '⚠️ Astrologer' : row.endedBy === 'customer' ? 'Customer' : 'System'}
                          </span>
                        ) : '-'}
                        {row.endReason && row.endReason !== 'manual' ? <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{row.endReason}</div> : null}
                      </td>
                      <td>
                        <span className={`cust-verify-badge ${getStatusClass(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="cust-date-cell">{formatDateTime(row.createdAt || row.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>
    </div>
  );
};

export default CallHistory;
