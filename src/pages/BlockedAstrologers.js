import React, { useState, useEffect } from 'react';
import { blockAstrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { Sparkles, Search, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import '../styles/Customers.css';

const BlockedAstrologers = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await blockAstrologerApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching blocked astrologers:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>';

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-start');
      const start = Math.max(2, page - 1);
      const end = Math.min(total - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < total - 2) pages.push('dots-end');
      if (!pages.includes(total)) pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start || ((page - 1) * 10 + 1)} to {pagination.end || Math.min(page * 10, pagination.totalRecords)} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Sparkles size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Blocked Astrologers</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search by name or contact..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="cust-input cust-search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading blocked astrologers..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Customer Name</th>
                  <th>Astrologer</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="cust-no-data">No blocked astrologers found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row._id || row.id || i}>
                    <td>{((page - 1) * 10) + i + 1}</td>
                    <td>
                      <img
                        src={row.userImage || row.user?.image || row.user?.profileImage || fallbackSvg}
                        alt="User"
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackSvg; }}
                        className="cust-avatar"
                      />
                    </td>
                    <td>
                      <div className="cust-name-cell">{row.userName || row.user?.name || '-'}</div>
                      <div className="cust-date-cell">{row.userContactNumber || row.user?.contactNumber || row.user?.phone || ''}</div>
                    </td>
                    <td>
                      <div className="cust-name-cell">{row.astrologerName || row.astrologer?.name || '-'}</div>
                      <div className="cust-date-cell">{row.astrologerContactNumber || row.astrologer?.contactNumber || row.astrologer?.phone || ''}</div>
                    </td>
                    <td>{row.reason ? (row.reason.length > 60 ? row.reason.substring(0, 60) + '...' : row.reason) : '-'}</td>
                    <td>
                      <span className="cust-date-cell">
                        <Calendar size={12} /> {formatDate(row.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>
    </div>
  );
};

export default BlockedAstrologers;
