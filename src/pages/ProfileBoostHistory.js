import React, { useState, useEffect, useCallback } from 'react';
import { profileBoostApi } from '../api/services';
import Loader from '../components/Loader';
import { History, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import '../styles/Customers.css';

const ProfileBoostHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [];
  for (let y = 2020; y <= new Date().getFullYear(); y++) years.push(y);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileBoostApi.getHistory({ page, month, year });
      setData(res.data.boosted || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dt) => {
    if (!dt) return '-';
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>';

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map(p => <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>)}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <History size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Boost History</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
      </div>

      <div className="cust-filterbar">
        <div className="cust-filter-group">
          <label className="cust-filter-label">Month</label>
          <select value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} className="cust-input" style={{ width: 160 }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="cust-filter-group">
          <label className="cust-filter-label">Year</label>
          <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }} className="cust-input" style={{ width: 120 }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="cust-filter-actions">
          <button onClick={() => { setPage(1); fetchData(); }} className="cust-btn cust-btn-primary"><Search size={13} /> Filter</button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading boost history..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Astrologer</th><th>Boost Start</th><th>Boost End</th><th>Monthly Count</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No boost history found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={row.profileImage?.startsWith('http') ? row.profileImage : fallbackSvg} alt=""
                          className="cust-avatar" onError={e => { e.target.src = fallbackSvg; }} />
                        <span className="cust-name-cell">{row.name || '-'}</span>
                      </div>
                    </td>
                    <td className="cust-date-cell">{formatDate(row.boosted_datetime)}</td>
                    <td className="cust-date-cell">{formatDate(row.enddate_time)}</td>
                    <td>
                      <span className="cust-req-badge purple">{row.monthly_boost_count}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{row.monthname} {row.yearname}</span>
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

export default ProfileBoostHistory;
