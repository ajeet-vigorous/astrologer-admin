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
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => handleVerify(row.id)}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Verify</button>
          <button onClick={() => navigate(`/admin/astrologers/edit/${row.id}`)}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
          <button onClick={() => navigate(`/admin/astrologers/${row.id}`)}
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>View</button>
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
    </div>
  );
};

export default PendingAstrologers;
