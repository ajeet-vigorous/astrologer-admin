import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { Eye, Pencil, Trash2, Plus, FileText, FileSpreadsheet, X, ChevronLeft, ChevronRight, AlertTriangle, Sparkles, Search, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const Astrologers = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyId, setVerifyId] = useState(null);
  const [verifyCurrentStatus, setVerifyCurrentStatus] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await astrologerApi.getAll(params);
      setAstrologers(res.data.astrologers || []);
      setPagination({
        totalPages: res.data.totalPages, totalRecords: res.data.totalRecords,
        start: res.data.start, end: res.data.end, page: res.data.page
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, dateApplied]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerifyToggle = async () => {
    if (!verifyId) return;
    try {
      await astrologerApi.verify({ filed_id: verifyId });
      setShowVerifyModal(false);
      setVerifyId(null);
      setVerifyCurrentStatus(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const openVerifyModal = (id, currentStatus) => {
    setVerifyId(id);
    setVerifyCurrentStatus(currentStatus);
    setShowVerifyModal(true);
  };

  const handleSectionToggle = async (astrologerId, section, currentStatus) => {
    try {
      const newStatus = currentStatus == 1 ? 0 : 1;
      await astrologerApi.updateSectionStatus({ astro_id: astrologerId, section, status: newStatus });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This astrologer will be deleted and won\'t be visible to customers!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7c3aed', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, Delete' });
    if (result.isConfirmed) {
      try { await astrologerApi.delete({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const handlePrint = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await astrologerApi.printPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      window.open(window.URL.createObjectURL(blob));
    } catch (e) { alert('Failed to generate PDF'); }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await astrologerApi.exportCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'astrologers.csv';
      a.click();
    } catch (e) { alert('Failed to export CSV'); }
  };

  const handleDateSubmit = () => {
    setDateApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setFromDate(moment().toDate()); setToDate(moment().toDate()); setDateApplied(false); setPage(1);
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, '0');
    const mon = String(dt.getMonth() + 1).padStart(2, '0');
    const yr = dt.getFullYear();
    let hr = dt.getHours(); const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am'; hr = hr % 12 || 12;
    return `${day}-${mon}-${yr} ${hr}:${min} ${ampm}`;
  };

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="cust-toggle-wrap">
      <div onClick={onChange} className={`cust-toggle ${checked ? 'on' : ''}`}>
        <div className="cust-toggle-knob" />
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    const total = pagination.totalPages;
    const maxVisible = 15;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(total, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {startPage > 1 && (
            <>
              <button onClick={() => setPage(1)} className={`cust-page-btn ${1 === page ? 'active' : ''}`}>1</button>
              {startPage > 2 && <span className="cust-page-dots">...</span>}
            </>
          )}
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
          ))}
          {endPage < total && (
            <>
              {endPage < total - 1 && <span className="cust-page-dots">...</span>}
              <button onClick={() => setPage(total)} className={`cust-page-btn ${total === page ? 'active' : ''}`}>{total}</button>
            </>
          )}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>';

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Sparkles size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Astrologers</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/astrologers/add')} className="cust-btn cust-btn-primary">
            <Plus size={15} /> New
          </button>
          <button onClick={handlePrint} className="cust-btn cust-btn-danger">
            <FileText size={15} /> PDF
          </button>
          <button onClick={handleExport} className="cust-btn cust-btn-success">
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
            <input type="text" placeholder="Search by name or contact..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
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
            <label className="cust-filter-label">From</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker selected={fromDate} onChange={date => { setFromDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy" className="cust-input cust-datepicker-input" placeholderText="Select date" />
            </div>
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker selected={toDate} onChange={date => { setToDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy" className="cust-input cust-datepicker-input" placeholderText="Select date" />
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

      <div className="cust-card">
        {/* Table */}
        {loading ? <Loader text="Loading astrologers..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Requests</th>
                  <th>Call</th>
                  <th>Chat</th>
                  <th>Live</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {astrologers.length === 0 ? (
                  <tr><td colSpan={11} className="cust-no-data">No astrologers found.</td></tr>
                ) : astrologers.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      <img
                        src={row.profileImage ? (row.profileImage.startsWith('http') ? row.profileImage : `/public/${row.profileImage}`) : fallbackSvg}
                        alt="" className="cust-avatar"
                        onError={e => { e.target.src = fallbackSvg; }}
                      />
                    </td>
                    <td className="cust-name-cell">{row.name || '-'}</td>
                    <td>
                      <div>{row.contactNo || '-'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.email || ''}</div>
                    </td>
                    <td>
                      <span className="cust-req-badge purple">Call: {row.totalCallRequest || 0}</span>
                      <span className="cust-req-badge blue">Chat: {row.totalChatRequest || 0}</span>
                    </td>
                    <td><ToggleSwitch checked={row.call_sections == 1} onChange={() => handleSectionToggle(row.id, 'call_sections', row.call_sections)} /></td>
                    <td><ToggleSwitch checked={row.chat_sections == 1} onChange={() => handleSectionToggle(row.id, 'chat_sections', row.chat_sections)} /></td>
                    <td><ToggleSwitch checked={row.live_sections == 1} onChange={() => handleSectionToggle(row.id, 'live_sections', row.live_sections)} /></td>
                    <td className="cust-date-cell">{formatDateTime(row.created_at)}</td>
                    <td>
                      <span onClick={() => openVerifyModal(row.id, row.isVerified)}
                        className={`cust-verify-badge ${row.isVerified ? 'verified' : 'unverified'}`}>
                        {row.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => navigate(`/admin/astrologers/${row.id}`)} className="cust-action-btn cust-action-view" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/astrologers/edit/${row.id}`)} className="cust-action-btn cust-action-edit" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="cust-action-btn cust-action-delete" title="Delete">
                          <Trash2 size={15} />
                        </button>
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

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="cust-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-delete-content">
              <div className="cust-delete-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>Are you sure?</h3>
              <p>{verifyCurrentStatus ? 'This astrologer will be unverified.' : 'This astrologer will be verified.'}</p>
              <div className="cust-delete-actions">
                <button onClick={() => { setShowVerifyModal(false); setVerifyId(null); setVerifyCurrentStatus(null); }} className="cust-btn cust-btn-ghost">Cancel</button>
                <button onClick={handleVerifyToggle} className="cust-btn cust-btn-primary">Yes, Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Astrologers;
