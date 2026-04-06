import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { horoscopeApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/Customers.css';

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
          className="cust-avatar"
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
      <div className="cust-pagination">
        <div className="cust-page-info">
          Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
        </div>
        <div className="cust-page-btns">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cust-page-btn"
          >
            <ChevronLeft size={16} />
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cust-page-btn${p === page ? ' active' : ''}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cust-page-btn"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Star size={18} className="cust-topbar-icon" />
          <h2 className="cust-title">Horoscope Feedback</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right" />
      </div>

      <div className="cust-card">
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                {['#', 'Profile', 'User', 'Feedback Date', 'Feedback Type', 'Feedback'].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="cust-no-data"><Loader /></td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="cust-no-data">No Data Available</td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index}>
                    <td>{(page - 1) * 15 + index + 1}</td>
                    <td>
                      <div>
                        {renderProfileImage(row)}
                        <div
                          className="cust-avatar"
                          style={{
                            display: (row.profile || row.profileImage || row.profile_image) ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#e5e7eb'
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="cust-name-cell">{getUserDisplay(row)}</td>
                    <td className="cust-date-cell">{formatDate(row.feedbackDate || row.feedback_date || row.created_at)}</td>
                    <td>{row.feedbacktype || row.feedbackType || row.feedback_type || '-'}</td>
                    <td>{row.feedback || '-'}</td>
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

export default HoroscopeFeedback;
