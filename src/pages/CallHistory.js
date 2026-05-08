import React, { useState, useEffect, useCallback } from 'react';
import { callHistoryApi } from '../api/services';
import Loader from '../components/Loader';
import formatNumber from '../utils/formatNumber';
import { Phone, FileText, FileSpreadsheet, Search, X, Calendar, ChevronLeft, ChevronRight, XCircle, Video, Activity } from 'lucide-react';
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
  const [qualityModal, setQualityModal] = useState(null); // { callId, summary, loading }

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

  // Active call states where admin can force-cancel
  const isActiveCall = (status) => ['Pending', 'Ready', 'Accepted'].includes(status);

  const handleForceCancel = async (callId, customerName, astrologerName) => {
    const reason = window.prompt(
      `Force-cancel call between ${customerName || 'customer'} and ${astrologerName || 'astrologer'}?\n\nEnter reason (will be logged):`
    );
    if (!reason || !reason.trim()) return;
    const refundStr = window.prompt(
      `Refund amount (₹). Leave blank to auto-refund deducted amount:`,
      ''
    );
    const refundAmount = refundStr === null ? null : parseFloat(refundStr);
    try {
      const res = await callHistoryApi.forceCancel({
        callId,
        reason: reason.trim(),
        ...(refundAmount && !isNaN(refundAmount) ? { refundAmount } : {}),
      });
      const r = res.data || {};
      if (r.status === 200) {
        window.alert(`Call cancelled. ₹${r.refundAmount || 0} refunded.`);
        fetchData();
      } else {
        window.alert(r.message || 'Cancellation failed');
      }
    } catch (e) {
      window.alert('Error: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleViewQuality = async (callId) => {
    setQualityModal({ callId, summary: null, loading: true });
    try {
      const res = await callHistoryApi.getMetrics(callId);
      setQualityModal({ callId, summary: res.data, loading: false });
    } catch (e) {
      setQualityModal({ callId, summary: null, loading: false, error: e.response?.data?.message || e.message });
    }
  };

  const handleViewRecording = async (callId) => {
    try {
      const res = await callHistoryApi.getRecording(callId);
      const d = res.data?.data;
      if (!d) { window.alert('Recording info not found'); return; }
      if (d.recording_url) {
        window.open(d.recording_url, '_blank', 'noopener');
      } else {
        window.alert(`No recording available. Status: ${d.recording_status || 'not recorded'}`);
      }
    } catch (e) {
      window.alert('Error: ' + (e.response?.data?.message || e.message));
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={14} className="cust-no-data">No call history found.</td></tr>
                ) : data.map((row, i) => {
                  const status = row.status || 'completed';
                  const callType = row.callType || row.call_type || 'Audio';
                  const rawStatus = row.callStatus || row.status;
                  const callId = row.id || row._id;
                  const customerName = row.customerName || row.customer?.name;
                  const astrologerName = row.astrologerName || row.astrologer?.name;
                  return (
                    <tr key={row._id || row.id || i}>
                      <td>{(pagination?.start || ((page - 1) * 10 + 1)) + i}</td>
                      <td className="cust-name-cell">{customerName || '-'}</td>
                      <td>{row.customerPhone || row.customer?.phone || row.customer?.contactNo || '-'}</td>
                      <td>{astrologerName || '-'}</td>
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
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isActiveCall(rawStatus) && callId && (
                            <button
                              onClick={() => handleForceCancel(callId, customerName, astrologerName)}
                              title="Force-cancel & refund"
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                          {row.recording_url ? (
                            <button
                              onClick={() => window.open(row.recording_url, '_blank', 'noopener')}
                              title="Open recording"
                              style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Video size={12} /> Recording
                            </button>
                          ) : row.recording_status === 'recording' ? (
                            <span style={{ fontSize: 11, color: '#dc2626' }}>● REC</span>
                          ) : callId && rawStatus === 'Completed' ? (
                            <button
                              onClick={() => handleViewRecording(callId)}
                              title="Check recording"
                              style={{ background: 'transparent', color: '#7c3aed', border: '1px solid #7c3aed', padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
                            >
                              <Video size={12} />
                            </button>
                          ) : null}
                          {callId && (
                            <button
                              onClick={() => handleViewQuality(callId)}
                              title="Call quality stats"
                              style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid #0ea5e9', padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Activity size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Call Quality Modal */}
      {qualityModal && (
        <div
          onClick={() => setQualityModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 480, maxWidth: 640, maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>
                <Activity size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: '#0ea5e9' }} />
                Call Quality — #{qualityModal.callId}
              </h3>
              <button onClick={() => setQualityModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            {qualityModal.loading ? (
              <p style={{ color: '#64748b' }}>Loading metrics...</p>
            ) : qualityModal.error ? (
              <p style={{ color: '#dc2626' }}>{qualityModal.error}</p>
            ) : !qualityModal.summary ? (
              <p style={{ color: '#64748b' }}>No metrics available for this call.</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Total Events</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{qualityModal.summary.totalEvents || 0}</div>
                  </div>
                  <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#991b1b' }}>Drops + Disconnects</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>{qualityModal.summary.drops || 0}</div>
                  </div>
                  <div style={{ padding: 12, background: '#fefce8', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#854d0e' }}>Reconnects</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#ca8a04' }}>{qualityModal.summary.reconnects || 0}</div>
                  </div>
                  <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#166534' }}>Avg Bitrate (kbps)</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{qualityModal.summary.avgBitrate || '-'}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Network Quality (1=excellent, 6=down)</div>
                  <div style={{ fontSize: 14 }}>
                    Avg: <strong>{qualityModal.summary.avgQuality || '-'}</strong>
                    {qualityModal.summary.worstQuality != null && (
                      <span style={{ marginLeft: 16 }}>Worst: <strong style={{ color: qualityModal.summary.worstQuality >= 4 ? '#dc2626' : '#0f172a' }}>{qualityModal.summary.worstQuality}</strong></span>
                    )}
                  </div>
                </div>
                {qualityModal.summary.timeline?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Event Timeline (last {qualityModal.summary.timeline.length})</div>
                    <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: 8, fontSize: 11, fontFamily: 'monospace' }}>
                      {qualityModal.summary.timeline.slice(-50).map((ev, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0', borderBottom: '1px dashed #f1f5f9' }}>
                          <span style={{ color: '#94a3b8' }}>{new Date(ev.created_at).toLocaleTimeString()}</span>
                          <span style={{ color: ev.userType === 'system' ? '#dc2626' : ev.userType === 'astrologer' ? '#7c3aed' : '#0ea5e9', minWidth: 70 }}>{ev.userType}</span>
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{ev.event_type}</span>
                          {ev.value != null && <span style={{ color: '#64748b' }}>= {ev.value}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
