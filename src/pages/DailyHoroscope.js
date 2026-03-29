import React, { useState, useEffect } from 'react';
import { horoscopeApi } from '../api/services';
import { toast } from 'react-toastify';

const DailyHoroscope = () => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await horoscopeApi.generateDaily();
      toast.success(res.data?.message || 'Daily horoscope generated!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    }
    setGenerating(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [filterDate, setFilterDate] = useState(today);
  const [inputDate, setInputDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await horoscopeApi.getDailyList({ page, filterDate });
      const d = res.data?.data || res.data || {};
      setData(d.dailyHoroscope || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) {
      console.error('Error fetching daily horoscopes:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, filterDate]);

  const handleApply = () => {
    setPage(1);
    setFilterDate(inputDate);
  };

  const getFirst5Words = (text) => {
    if (!text) return '-';
    const words = text.split(/\s+/);
    return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : text;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>
          Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
        </div>
        <div style={styles.paginationButtons}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
          >
            Prev
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Daily Horoscope</h2>
          <div style={styles.filterRow}>
            <button onClick={handleGenerate} disabled={generating}
              style={{ ...styles.applyBtn, background: '#10b981', marginRight: 8, opacity: generating ? 0.6 : 1 }}>
              {generating ? 'Generating...' : 'Generate Today'}
            </button>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              style={styles.dateInput}
            />
            <button onClick={handleApply} style={styles.applyBtn}>Apply</button>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Zodiac', 'Lucky Color', 'Lucky Color Code', 'Lucky Number', 'Total Score', 'Physique', 'Status', 'Finances', 'Relationship', 'Career', 'Travel', 'Family', 'Friends', 'Health', 'Response', 'Date'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={17} style={styles.noData}>Loading...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={17} style={styles.noData}>No Data Available</td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}>{row.zodiac || '-'}</td>
                    <td style={styles.td}>{row.lucky_color || '-'}</td>
                    <td style={styles.td}>
                      {row.lucky_color_code ? (
                        <span style={{ ...styles.colorSwatch, backgroundColor: row.lucky_color_code }}>
                          {row.lucky_color_code}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>{row.lucky_number ?? '-'}</td>
                    <td style={styles.td}>{row.total_score ?? '-'}</td>
                    <td style={styles.td}>{row.physique ?? '-'}</td>
                    <td style={styles.td}>{row.status ?? '-'}</td>
                    <td style={styles.td}>{row.finances ?? '-'}</td>
                    <td style={styles.td}>{row.relationship ?? '-'}</td>
                    <td style={styles.td}>{row.career ?? '-'}</td>
                    <td style={styles.td}>{row.travel ?? '-'}</td>
                    <td style={styles.td}>{row.family ?? '-'}</td>
                    <td style={styles.td}>{row.friends ?? '-'}</td>
                    <td style={styles.td}>{row.health ?? '-'}</td>
                    <td style={styles.td}>{getFirst5Words(row.bot_response)}</td>
                    <td style={styles.td}>{formatDate(row.date)}</td>
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
  container: {
    padding: '0',
  },
  card: {
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dateInput: {
    padding: '8px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  applyBtn: {
    padding: '8px 20px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1400px',
  },
  th: {
    background: '#7c3aed',
    color: '#fff',
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #6d28d9',
  },
  td: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  rowEven: {
    background: '#f8f9fa',
  },
  rowOdd: {
    background: '#fff',
  },
  noData: {
    padding: '40px 14px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '15px',
  },
  colorSwatch: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  paginationWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '18px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  showingText: {
    fontSize: '13px',
    color: '#6b7280',
  },
  paginationButtons: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '6px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageBtnActive: {
    background: '#7c3aed',
    color: '#fff',
    borderColor: '#7c3aed',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default DailyHoroscope;
