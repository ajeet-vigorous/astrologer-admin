import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { Sparkles, Search, X, Eye, ChevronLeft, ChevronRight, ShieldCheck, ShieldX, Calendar } from 'lucide-react';
import '../styles/Customers.css';

const PendingAstrologers = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInterview, setShowInterview] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [showReject, setShowReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await astrologerApi.getPending(params);
      const d = res.data;
      setAstrologers(d.astrologers || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, fromDate, toDate]);

  const handleVerify = async (id) => {
    const result = await Swal.fire({
      title: 'Verify Astrologer?',
      text: 'Are you sure you want to verify this astrologer?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Verify'
    });
    if (result.isConfirmed) {
      try {
        await astrologerApi.verify({ filed_id: id });
        Swal.fire({ title: 'Verified!', text: 'Astrologer has been verified.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (e) {
        console.error(e);
        Swal.fire({ title: 'Error!', text: 'Failed to verify astrologer.', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleSectionToggle = async (astroId, section, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 || currentStatus === '1' ? '0' : '1';
      await astrologerApi.updateSectionStatus({ astro_id: astroId, section, status: newStatus });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleClear = () => { setSearch(''); setFromDate(''); setToDate(''); setPage(1); };

  const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>';

  const ToggleSwitch = ({ checked, onChange }) => (
    <div className="cust-toggle-wrap">
      <div onClick={onChange} className={`cust-toggle ${checked ? 'on' : ''}`}>
        <div className="cust-toggle-knob" />
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-start');
      const start = Math.max(2, page - 1);
      const end = Math.min(total - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < total - 2) pages.push('dots-end');
      if (!pages.includes(total)) pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start || ((page - 1) * 10 + 1)} to {pagination.end || Math.min(page * 10, pagination.totalRecords)} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
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
          <Sparkles size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Pending Astrologers</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/astrologers/add')} className="cust-btn cust-btn-primary">
            + Add Astrologer
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
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="cust-input cust-date-input" />
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="cust-input cust-date-input" />
          </div>
          <div className="cust-filter-actions">
            {(search || fromDate || toDate) && (
              <button onClick={handleClear} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading pending astrologers..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Gender</th>
                  <th>Requests</th>
                  <th>Call</th>
                  <th>Chat</th>
                  <th>Live</th>
                  <th>Created</th>
                  <th>Interview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {astrologers.length === 0 ? (
                  <tr><td colSpan={12} className="cust-no-data">No pending astrologers found.</td></tr>
                ) : astrologers.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      {row.profileImage ? (
                        <img src={row.profileImage} alt="" className="cust-avatar" onError={e => { e.target.src = fallbackSvg; }} />
                      ) : (
                        <img src={fallbackSvg} alt="" className="cust-avatar" />
                      )}
                    </td>
                    <td>
                      <span className="cust-name-cell">{row.name || '-'}</span>
                    </td>
                    <td>
                      <div className="cust-name-cell">{row.contactNo || '-'}</div>
                      <div className="cust-date-cell">{row.email || ''}</div>
                    </td>
                    <td>{row.gender || '-'}</td>
                    <td>
                      <span className="cust-req-badge purple">Call: {row.totalCallRequest || 0}</span>
                      <span className="cust-req-badge blue">Chat: {row.totalChatRequest || 0}</span>
                    </td>
                    <td><ToggleSwitch checked={row.call_sections == 1} onChange={() => handleSectionToggle(row.id, 'call_sections', row.call_sections)} /></td>
                    <td><ToggleSwitch checked={row.chat_sections == 1} onChange={() => handleSectionToggle(row.id, 'chat_sections', row.chat_sections)} /></td>
                    <td><ToggleSwitch checked={row.live_sections == 1} onChange={() => handleSectionToggle(row.id, 'live_sections', row.live_sections)} /></td>
                    <td>
                      <span className="cust-date-cell">
                        <Calendar size={12} /> {row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-'}
                      </span>
                    </td>
                    <td>
                      {row.interviewStatus === 'Scheduled' && (
                        <span className="cust-req-badge purple">
                          <Calendar size={11} /> {row.interviewDate ? new Date(row.interviewDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                        </span>
                      )}
                      {row.interviewStatus === 'Rejected' && (
                        <span className="cust-verify-badge unverified">Rejected</span>
                      )}
                      {!row.interviewStatus && (
                        <span className="cust-date-cell">Not scheduled</span>
                      )}
                      {row.interviewStatus && row.interviewStatus !== 'Scheduled' && row.interviewStatus !== 'Rejected' && (
                        <span className="cust-date-cell">{row.interviewStatus}</span>
                      )}
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => navigate(`/admin/astrologers/${row.id}`)} className="cust-action-btn cust-action-view" title="View">
                          <Eye size={15} />
                        </button>
                        {!row.interviewStatus && (
                          <button onClick={() => { setShowInterview(row.id); setInterviewDate(''); }} className="cust-action-btn cust-action-edit" title="Schedule Interview">
                            <Calendar size={15} />
                          </button>
                        )}
                        {row.interviewStatus === 'Scheduled' && (
                          <button onClick={() => handleVerify(row.id)} className="cust-action-btn cust-action-view" title="Verify">
                            <ShieldCheck size={15} />
                          </button>
                        )}
                        {row.interviewStatus !== 'Rejected' && (
                          <button onClick={() => { setShowReject(row.id); setRejectReason(''); }} className="cust-action-btn cust-action-delete" title="Reject">
                            <ShieldX size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Schedule Interview Modal */}
      {showInterview && (
        <div className="cust-overlay" onClick={() => setShowInterview(null)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Schedule Interview</h3>
              <button className="cust-modal-close" onClick={() => setShowInterview(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Interview Date & Time</label>
                <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
              </div>
              <div className="cust-form-row">
                <button
                  className="cust-btn cust-btn-primary cust-btn-full"
                  onClick={async () => {
                    if (!interviewDate) {
                      Swal.fire({ title: 'Required', text: 'Please select date & time', icon: 'warning', confirmButtonColor: '#7c3aed' });
                      return;
                    }
                    try {
                      await astrologerApi.editTotalOrder({ astrologerId: showInterview, interviewDate, interviewStatus: 'Scheduled' });
                      setShowInterview(null);
                      fetchData();
                      Swal.fire({ title: 'Scheduled!', text: 'Interview has been scheduled.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
                    } catch (e) {
                      Swal.fire({ title: 'Error!', text: 'Failed to schedule interview.', icon: 'error', confirmButtonColor: '#7c3aed' });
                    }
                  }}
                >Schedule</button>
                <button className="cust-btn cust-btn-ghost cust-btn-full" onClick={() => setShowInterview(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="cust-overlay" onClick={() => setShowReject(null)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Reject Astrologer</h3>
              <button className="cust-modal-close" onClick={() => setShowReject(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Rejection Reason</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." rows={3} />
              </div>
              <div className="cust-form-row">
                <button
                  className="cust-btn cust-btn-danger cust-btn-full"
                  onClick={async () => {
                    if (!rejectReason.trim()) {
                      Swal.fire({ title: 'Required', text: 'Please enter a reason', icon: 'warning', confirmButtonColor: '#7c3aed' });
                      return;
                    }
                    try {
                      await astrologerApi.editTotalOrder({ astrologerId: showReject, interviewStatus: 'Rejected', rejectionReason: rejectReason });
                      setShowReject(null);
                      fetchData();
                      Swal.fire({ title: 'Rejected!', text: 'Astrologer has been rejected.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
                    } catch (e) {
                      Swal.fire({ title: 'Error!', text: 'Failed to reject astrologer.', icon: 'error', confirmButtonColor: '#7c3aed' });
                    }
                  }}
                >Reject</button>
                <button className="cust-btn cust-btn-ghost cust-btn-full" onClick={() => setShowReject(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAstrologers;
