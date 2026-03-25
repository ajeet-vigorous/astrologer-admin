import React, { useState, useEffect } from 'react';
import { earningApi } from '../api/services';

const AdminEarnings = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
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

  useEffect(() => { fetchData(); }, [page, orderType, fromDate, toDate]);

  const handleSearch = () => { setPage(1); fetchData(); };

  const handleExportCsv = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
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

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin Earnings</h2>
        <button onClick={handleExportCsv} style={btnStyle}>Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={labelStyle}>Search</label>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search user/astrologer..." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Order Type</label>
          <select value={orderType} onChange={e => { setOrderType(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All</option>
            <option value="chat">Chat</option>
            <option value="call">Call</option>
            <option value="report">Report</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>From Date</label>
          <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>To Date</label>
          <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} style={inputStyle} />
        </div>
        <button onClick={handleSearch} style={{ ...btnStyle, background: '#7c3aed' }}>Search</button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Order Type</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Astrologer</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Total Amount</th>
              <th style={thStyle}>Admin Earning</th>
              <th style={thStyle}>Expert Earning</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#999' }}>Loading...</td></tr>
            ) : data.length > 0 ? data.map((row, i) => (
              <tr key={row.id || i}>
                <td style={tdStyle}>{(page - 1) * 15 + i + 1}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: row.orderType === 'chat' ? '#dbeafe' : row.orderType === 'call' ? '#fef3c7' : '#e0e7ff', color: row.orderType === 'chat' ? '#1e40af' : row.orderType === 'call' ? '#92400e' : '#3730a3' }}>
                    {row.orderType || '-'}
                  </span>
                </td>
                <td style={tdStyle}>{row.UserName || '-'}</td>
                <td style={tdStyle}>{row.astrologerName || '-'}</td>
                <td style={tdStyle}>{row.totalMin ? `${row.totalMin} min` : '-'}</td>
                <td style={tdStyle}>{row.totalPayable != null ? `₹${Number(row.totalPayable).toFixed(2)}` : '-'}</td>
                <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 600 }}>{row.adminearningAmount != null ? `₹${Number(row.adminearningAmount).toFixed(2)}` : '-'}</td>
                <td style={tdStyle}>{row.totalPayable != null && row.adminearningAmount != null ? `₹${(Number(row.totalPayable) - Number(row.adminearningAmount)).toFixed(2)}` : '-'}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(row.updated_at || row.created_at)}</td>
              </tr>
            )) : (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#999' }}>No earnings data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...pgBtn, opacity: page <= 1 ? 0.5 : 1 }}>Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i;
            if (p > totalPages || p < 1) return null;
            return <button key={p} onClick={() => setPage(p)} style={{ ...pgBtn, background: p === page ? '#7c3aed' : '#fff', color: p === page ? '#fff' : '#333' }}>{p}</button>;
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ ...pgBtn, opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#999' }}>Total Records: {totalRecords}</div>
    </div>
  );
};

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 13 };
const inputStyle = { padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, minWidth: 140 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 3 };
const btnStyle = { padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const pgBtn = { padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 };

export default AdminEarnings;
