import React, { useState, useEffect } from 'react';
import { courseApi } from '../api/services';

const CourseOrders = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('₹');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await courseApi.getOrders(params);
      const d = res.data || {};
      setData(d.orders || []);
      setCurrency(d.currency?.value || '₹');
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, fromDate, toDate]);

  const formatDate = (d) => {
    if (!d) return '--';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    let hh = dt.getHours();
    const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12 || 12;
    return `${dd}-${mm}-${yyyy} ${String(hh).padStart(2, '0')}:${min} ${ampm}`;
  };

  const handleFilter = () => { setPage(1); fetchData(); };
  const handleClear = () => { setFromDate(''); setToDate(''); setPage(1); };

  const getStatusBadge = (status, type) => {
    let bg, color;
    if (type === 'order') {
      if (status === 'success') { bg = '#d1fae5'; color = '#065f46'; }
      else if (status === 'failed') { bg = '#fee2e2'; color = '#991b1b'; }
      else { bg = '#fef3c7'; color = '#92400e'; }
    } else {
      if (status === 'completed') { bg = '#d1fae5'; color = '#065f46'; }
      else { bg = '#f3f4f6'; color = '#6b7280'; }
    }
    return { padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: bg, color: color, textTransform: 'capitalize' };
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</div>
        <div style={styles.paginationButtons}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>Prev</button>
          {pages.map(p => (<button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}>Next</button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Course Orders</h2>
        </div>

        {/* Date Filters */}
        <div style={styles.filterRow}>
          <label style={styles.filterLabel}>From:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.dateInput} />
          <label style={styles.filterLabel}>To:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.dateInput} />
          <button onClick={handleFilter} style={styles.filterBtn}>Filter</button>
          <button onClick={handleClear} style={styles.clearBtn}>Clear</button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Course', 'Astrologer', 'Price', 'GST', 'Total', 'Payment', 'Order Status', 'Completion', 'Date'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}><span style={{ fontWeight: 500 }}>{row.course_name || '--'}</span></td>
                    <td style={styles.td}>{row.astrologer_name || '--'}</td>
                    <td style={styles.td}>{row.course_price ? `${currency} ${Number(row.course_price).toFixed(2)}` : '--'}</td>
                    <td style={styles.td}>{row.course_gst_amount ? `${currency} ${Number(row.course_gst_amount).toFixed(2)}` : '--'}</td>
                    <td style={styles.td}>{row.course_total_price ? `${currency} ${Number(row.course_total_price).toFixed(2)}` : '--'}</td>
                    <td style={styles.td}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#e0e7ff', color: '#3730a3', textTransform: 'capitalize' }}>
                        {row.payment_type || '--'}
                      </span>
                    </td>
                    <td style={styles.td}><span style={getStatusBadge(row.course_order_status, 'order')}>{row.course_order_status || '--'}</span></td>
                    <td style={styles.td}><span style={getStatusBadge(row.course_completion_status, 'completion')}>{row.course_completion_status || '--'}</span></td>
                    <td style={styles.td}>{formatDate(row.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' },
  filterRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' },
  filterLabel: { fontWeight: 600, fontSize: 14, color: '#374151' },
  dateInput: { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  filterBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  clearBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#7c3aed', color: '#fff', padding: '12px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #6d28d9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  rowEven: { background: '#f8f9fa' },
  rowOdd: { background: '#fff' },
  noData: { padding: '40px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 15 },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' }
};

export default CourseOrders;
