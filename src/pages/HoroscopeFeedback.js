import React, { useState, useEffect } from 'react';
import { horoscopeApi } from '../api/services';

const HoroscopeFeedback = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await horoscopeApi.getFeedbackList({ page });
      const d = res.data?.data || res.data || {};
      setData(d.feedback || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) {
      console.error('Error fetching horoscope feedback:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getUserDisplay = (row) => {
    const name = row.name || '';
    const contact = row.contactNo || '';
    if (name && contact) return `${name}-${contact}`;
    if (name) return name;
    if (contact) return contact;
    return '-';
  };

  const renderProfileImage = (row) => {
    const imgUrl = row.profile || row.profileImage || row.profile_image || null;
    if (imgUrl) {
      return (
        <img
          src={imgUrl}
          alt="profile"
          style={styles.profileImg}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return null;
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
          <h2 style={styles.title}>Horoscope Feedback</h2>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Profile', 'User', 'Feedback Date', 'Feedback Type', 'Feedback'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={styles.noData}>Loading...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.noData}>No Data Available</td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.profileWrapper}>
                        {renderProfileImage(row)}
                        <div style={{
                          ...styles.profileFallback,
                          display: (row.profile || row.profileImage || row.profile_image) ? 'none' : 'flex'
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{getUserDisplay(row)}</td>
                    <td style={styles.td}>{formatDate(row.feedbackDate || row.feedback_date || row.created_at)}</td>
                    <td style={styles.td}>{row.feedbacktype || row.feedbackType || row.feedback_type || '-'}</td>
                    <td style={{ ...styles.td, whiteSpace: 'normal', maxWidth: '300px' }}>{row.feedback || '-'}</td>
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
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
    verticalAlign: 'middle',
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
  profileWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  profileFallback: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
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

export default HoroscopeFeedback;
