import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';

const Astrologers = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
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
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await astrologerApi.getAll(params);
      setAstrologers(res.data.astrologers || []);
      setPagination({
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
        start: res.data.start,
        end: res.data.end,
        page: res.data.page
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page, search, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerifyToggle = async () => {
    if (!verifyId) return;
    try {
      await astrologerApi.verify({ filed_id: verifyId });
      setShowVerifyModal(false);
      setVerifyId(null);
      setVerifyCurrentStatus(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
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
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await astrologerApi.printPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      window.open(window.URL.createObjectURL(blob));
    } catch (e) {
      alert('Failed to generate PDF');
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await astrologerApi.exportCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'astrologers.csv';
      a.click();
    } catch (e) {
      alert('Failed to export CSV');
    }
  };

  const handleFilter = () => {
    setPage(1);
    fetchData();
  };

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
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

  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: 42, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative',
      background: checked ? '#10b981' : '#d1d5db', transition: 'background 0.2s', flexShrink: 0
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
        top: 2, left: checked ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    const total = pagination.totalPages;
    const maxVisible = 15;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(total, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 13, color: '#666' }}>
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4,
              cursor: page <= 1 ? 'default' : 'pointer', background: '#fff', fontSize: 12,
              opacity: page <= 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button onClick={() => setPage(1)} style={pageNumStyle(1 === page)}>1</button>
              {startPage > 2 && <span style={{ padding: '6px 4px', fontSize: 12 }}>...</span>}
            </>
          )}
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} style={pageNumStyle(p === page)}>
              {p}
            </button>
          ))}
          {endPage < total && (
            <>
              {endPage < total - 1 && <span style={{ padding: '6px 4px', fontSize: 12 }}>...</span>}
              <button onClick={() => setPage(total)} style={pageNumStyle(total === page)}>{total}</button>
            </>
          )}
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages}
            style={{
              padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4,
              cursor: page >= pagination.totalPages ? 'default' : 'pointer', background: '#fff', fontSize: 12,
              opacity: page >= pagination.totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Astrologers</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ ...btnPrimary, background: '#2563eb' }}>Export PDF</button>
            <button onClick={handleExport} style={{ ...btnPrimary, background: '#059669' }}>Export CSV</button>
            <button onClick={() => navigate('/admin/astrologers/add')} style={btnPrimary}>+ Add Astrologer</button>
          </div>
        </div>

        {/* Search + Date Filter */}
        <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Search by name or contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleFilter} style={btnPrimary}>Filter</button>
          <button onClick={clearFilters} style={{ ...btnPrimary, background: '#6b7280' }}>Clear</button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Profile</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Contact Details</th>
                  <th style={thStyle}>Gender</th>
                  <th style={thStyle}>Total Request</th>
                  <th style={thStyle}>Call</th>
                  <th style={thStyle}>Chat</th>
                  <th style={thStyle}>Live</th>
                  <th style={thStyle}>Created At</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {astrologers.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ padding: 30, textAlign: 'center', color: '#999' }}>No astrologers found.</td>
                  </tr>
                ) : astrologers.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {/* # */}
                    <td style={tdStyle}>{(pagination?.start || 1) + i}</td>

                    {/* Profile */}
                    <td style={tdStyle}>
                      <img
                        src={row.profileImage ? (row.profileImage.startsWith('http') ? row.profileImage : `/public/${row.profileImage}`) : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">' + encodeURIComponent((row.name || '?').charAt(0).toUpperCase()) + '</text></svg>'}
                        alt={row.name || ''}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>';
                        }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{row.name || '-'}</td>

                    {/* Contact Details */}
                    <td style={tdStyle}>
                      <div>{row.contactNo || '-'}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{row.email || '-'}</div>
                    </td>

                    {/* Gender */}
                    <td style={tdStyle}>{row.gender || '-'}</td>

                    {/* Total Request */}
                    <td style={tdStyle}>
                      <div style={{ fontSize: 12 }}>
                        <span>Call: {row.totalCallRequest || 0}</span>
                        <br />
                        <span>Chat: {row.totalChatRequest || 0}</span>
                      </div>
                    </td>

                    {/* Call Toggle */}
                    <td style={tdStyle}>
                      <ToggleSwitch
                        checked={row.call_sections == 1}
                        onChange={() => handleSectionToggle(row.id, 'call_sections', row.call_sections)}
                      />
                    </td>

                    {/* Chat Toggle */}
                    <td style={tdStyle}>
                      <ToggleSwitch
                        checked={row.chat_sections == 1}
                        onChange={() => handleSectionToggle(row.id, 'chat_sections', row.chat_sections)}
                      />
                    </td>

                    {/* Live Toggle */}
                    <td style={tdStyle}>
                      <ToggleSwitch
                        checked={row.live_sections == 1}
                        onChange={() => handleSectionToggle(row.id, 'live_sections', row.live_sections)}
                      />
                    </td>

                    {/* Created At */}
                    <td style={{ ...tdStyle, fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDateTime(row.created_at)}
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <span
                        onClick={() => openVerifyModal(row.id, row.isVerified)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: row.isVerified ? '#d1fae5' : '#fee2e2',
                          color: row.isVerified ? '#065f46' : '#991b1b',
                          display: 'inline-block'
                        }}>
                          {row.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => navigate(`/admin/astrologers/${row.id}`)}
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/astrologers/edit/${row.id}`)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
                        >
                          Edit
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

      {/* Verify/Unverify Confirmation Modal */}
      {showVerifyModal && (
        <div style={overlayStyle} onClick={() => setShowVerifyModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, color: '#f59e0b', marginBottom: 15 }}>&#9888;</div>
            <h3 style={{ margin: '0 0 10px' }}>Are you sure?</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>
              {verifyCurrentStatus
                ? 'This astrologer will be unverified.'
                : 'This astrologer will be verified.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => { setShowVerifyModal(false); setVerifyId(null); setVerifyCurrentStatus(null); }}
                style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyToggle}
                style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const pageNumStyle = (active) => ({
  padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer',
  background: active ? '#7c3aed' : '#fff', color: active ? '#fff' : '#333',
  fontSize: 12, fontWeight: active ? 600 : 400
});

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 13 };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: '#fff', borderRadius: 12, padding: 25, maxWidth: 550, width: '95%', maxHeight: '90vh', overflow: 'hidden' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#555' };
const btnPrimary = { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 };

export default Astrologers;
