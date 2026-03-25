import React, { useState, useEffect } from 'react';
import { earningApi } from '../api/services';

const AstrologerEarnings = () => {
  const [data, setData] = useState([]);
  const [astrologers, setAstrologers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterAstrologerId, setFilterAstrologerId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filterAstrologerId) params.astrologerId = filterAstrologerId;
      const res = await earningApi.astrologerEarning(params);
      const d = res.data.data || res.data;
      setData(d.partnerWiseEarning || []);
      setAstrologers(d.astrologers || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching astrologer earnings:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, filterAstrologerId]);

  const fmt = (val) => val != null ? `₹${Number(val).toFixed(2)}` : '₹0.00';

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Astrologer Earnings</h2>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select value={filterAstrologerId} onChange={e => { setFilterAstrologerId(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">All Astrologers</option>
          {astrologers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Astrologer</th>
              <th style={thStyle}>Chat Earning</th>
              <th style={thStyle}>Call Earning</th>
              <th style={thStyle}>Report Earning</th>
              <th style={thStyle}>Gift Earning</th>
              <th style={thStyle}>Total Withdrawal</th>
              <th style={thStyle}>Wallet Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#999' }}>Loading...</td></tr>
            ) : data.length > 0 ? data.map((row, i) => (
              <tr key={row.astrologerId || i}>
                <td style={tdStyle}>{(page - 1) * 15 + i + 1}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{row.astrologerName || '-'}</td>
                <td style={tdStyle}>{fmt(row.chatEarning)}</td>
                <td style={tdStyle}>{fmt(row.callEarning)}</td>
                <td style={tdStyle}>{fmt(row.reportEarning)}</td>
                <td style={tdStyle}>{fmt(row.giftEarning)}</td>
                <td style={{ ...tdStyle, color: '#dc2626' }}>{fmt(row.totalWithdrawal)}</td>
                <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 600 }}>{fmt(row.totalbalance)}</td>
              </tr>
            )) : (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#999' }}>No astrologer earnings data found.</td></tr>
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
const inputStyle = { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, minWidth: 200 };
const pgBtn = { padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 };

export default AstrologerEarnings;
