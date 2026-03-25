import React, { useState, useEffect, useCallback } from 'react';
import { aiAstrologerApi } from '../api/services';

const AiChatHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await aiAstrologerApi.getChatHistory(params);
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching AI chat history:', err);
    }
  }, [page, search, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportCsv = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await aiAstrologerApi.exportChatCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ai-chat-history.csv');
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
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await aiAstrologerApi.printChatPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const formatChatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--';
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    if (isNaN(totalSeconds)) return '--';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startIndex = pagination ? pagination.start : ((page - 1) * 15 + 1);

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>AI Chat History</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={handleExportCsv} style={styles.csvBtn}>Export CSV</button>
            <button onClick={handlePrintPdf} style={styles.pdfBtn}>Print PDF</button>
          </div>
        </div>

        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search by user name, contact, astrologer name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...styles.filterInput, flex: 2 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              style={styles.filterInput}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              style={styles.filterInput}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Astrologer Name</th>
                <th style={styles.th}>Chat Rate</th>
                <th style={styles.th}>Chat Time</th>
                <th style={styles.th}>Total Min</th>
                <th style={styles.th}>Deduction</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, i) => (
                <tr key={row._id || row.id || i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={styles.td}>{startIndex + i}</td>
                  <td style={styles.td}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{row.user_name || row.user?.name || '--'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{row.user_contact || row.user?.contact || row.user?.phone || ''}</div>
                    </div>
                  </td>
                  <td style={styles.td}>{row.astrologer_name || row.astrologer?.name || '--'}</td>
                  <td style={styles.td}>{row.chat_rate != null ? row.chat_rate : '--'}</td>
                  <td style={styles.td}>{formatChatTime(row.chat_time || row.chat_duration)}</td>
                  <td style={styles.td}>{row.total_min != null ? row.total_min : (row.totalMinutes || '--')}</td>
                  <td style={styles.td}>{row.deduction != null ? row.deduction : '--'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: 30, color: '#9ca3af' }}>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div style={styles.pagination}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{
                    ...styles.pageBtn,
                    background: pagination.page === i + 1 ? '#7c3aed' : '#fff',
                    color: pagination.page === i + 1 ? '#fff' : '#374151',
                    border: pagination.page === i + 1 ? '1px solid #7c3aed' : '1px solid #d1d5db'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  filterBar: { padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  filterInput: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, flex: 1, minWidth: 140 },
  csvBtn: { padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' },
  pdfBtn: { padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#f8f9fa', padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: 13, color: '#374151' },
  pagination: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb' },
  pageBtn: { padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }
};

export default AiChatHistory;
