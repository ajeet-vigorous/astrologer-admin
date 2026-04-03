import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { astrologerApi } from '../api/services';

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
    if (window.confirm('Are you sure you want to verify this astrologer?')) {
      try {
        await astrologerApi.verify({ filed_id: id });
        fetchData();
      } catch (e) { console.error(e); }
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

  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: 42, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative',
      background: checked ? '#10b981' : '#d1d5db', transition: 'background 0.2s'
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
        top: 2, left: checked ? 22 : 2, transition: 'left 0.2s'
      }} />
    </div>
  );

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Name', render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.profileImage ? <img src={row.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> :
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{(row.name || '?')[0]}</div>}
          <span style={{ fontWeight: 500 }}>{row.name}</span>
        </div>
      )
    },
    {
      header: 'Contact', render: (row) => (
        <div><div>{row.contactNo}</div><div style={{ fontSize: 11, color: '#888' }}>{row.email}</div></div>
      )
    },
    { header: 'Gender', key: 'gender' },
    {
      header: 'Requests', render: (row) => (
        <div style={{ fontSize: 12 }}>
          <span>Call: {row.totalCallRequest || 0}</span> | <span>Chat: {row.totalChatRequest || 0}</span>
        </div>
      )
    },
    { header: 'Call', render: (row) => <ToggleSwitch checked={row.call_sections == 1} onChange={() => handleSectionToggle(row.id, 'call_sections', row.call_sections)} /> },
    { header: 'Chat', render: (row) => <ToggleSwitch checked={row.chat_sections == 1} onChange={() => handleSectionToggle(row.id, 'chat_sections', row.chat_sections)} /> },
    { header: 'Live', render: (row) => <ToggleSwitch checked={row.live_sections == 1} onChange={() => handleSectionToggle(row.id, 'live_sections', row.live_sections)} /> },
    { header: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-' },
    {
      header: 'Interview', render: (row) => {
        if (row.interviewStatus === 'Scheduled') return <span style={{ color: '#d97706', fontWeight: 600, fontSize: 12 }}>📅 {row.interviewDate ? new Date(row.interviewDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}</span>;
        if (row.interviewStatus === 'Rejected') return <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12 }}>❌ Rejected</span>;
        return <span style={{ color: '#9ca3af', fontSize: 12 }}>Not scheduled</span>;
      }
    },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {!row.interviewStatus && (
            <button onClick={() => { setShowInterview(row.id); setInterviewDate(''); }}
              style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Schedule</button>
          )}
          {row.interviewStatus === 'Scheduled' && (
            <button onClick={() => handleVerify(row.id)}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
          )}
          {row.interviewStatus !== 'Rejected' && (
            <button onClick={() => { setShowReject(row.id); setRejectReason(''); }}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
          )}
          <button onClick={() => navigate(`/admin/astrologers/${row.id}`)}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>View</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <button onClick={handleClear} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Clear</button>
        <button onClick={() => navigate('/admin/astrologers/add')}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>+ Add Astrologer</button>
      </div>

      <DataTable
        title="Pending Astrologers"
        columns={columns}
        data={astrologers}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={(val) => { setSearch(val); setPage(1); }}
        searchValue={search}
      />

      {/* Schedule Interview Modal */}
      {showInterview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowInterview(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>Schedule Interview</h3>
            <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={async () => {
                if (!interviewDate) { alert('Select date & time'); return; }
                try {
                  await astrologerApi.editTotalOrder({ astrologerId: showInterview, interviewDate, interviewStatus: 'Scheduled' });
                  setShowInterview(null); fetchData(); alert('Interview scheduled!');
                } catch(e) { alert('Failed'); }
              }} style={{ flex: 1, background: '#7c3aed', color: '#fff', border: 'none', padding: 10, borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Schedule</button>
              <button onClick={() => setShowInterview(null)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowReject(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#dc2626' }}>Reject Astrologer</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." rows={3}
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, marginBottom: 16, boxSizing: 'border-box', resize: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={async () => {
                if (!rejectReason.trim()) { alert('Enter reason'); return; }
                try {
                  await astrologerApi.editTotalOrder({ astrologerId: showReject, interviewStatus: 'Rejected', rejectionReason: rejectReason });
                  setShowReject(null); fetchData(); alert('Astrologer rejected');
                } catch(e) { alert('Failed'); }
              }} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: 10, borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
              <button onClick={() => setShowReject(null)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAstrologers;
