import React, { useState, useEffect, useCallback } from 'react';
import { kundaliApi } from '../api/services';
import Loader from '../components/Loader';
import { ScrollText, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import '../styles/Customers.css';

const KundaliEarnings = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (searchString) params.searchString = searchString;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await kundaliApi.getEarnings(params);
      setData(res.data.kundaliEarnings || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, searchString, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setSearchString('');
    setPage(1);
  };

  const formatDate = (dt) => {
    if (!dt) return '--';
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getSmartPages = () => {
    if (!pagination) return [];
    const totalPages = pagination.totalPages;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    const filtered = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < filtered.length; i++) {
      if (i > 0 && filtered[i] - filtered[i - 1] > 1) {
        result.push('...');
      }
      result.push(filtered[i]);
    }
    return result;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const smartPages = getSmartPages();
    return (
      <div className="cust-pagination">
        <div className="cust-page-info">Showing {pagination.totalRecords === 0 ? 0 : pagination.start} to {pagination.end} of {pagination.totalRecords} entries</div>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn">
            <ChevronLeft size={16} />
          </button>
          {smartPages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn${p === page ? ' active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
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
          <ScrollText size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Kundali Earnings</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <div className="cust-filter-date-row">
            <div className="cust-filter-group">
              <label className="cust-filter-label">From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="cust-input cust-date-input" />
            </div>
            <div className="cust-filter-group">
              <label className="cust-filter-label">To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="cust-input cust-date-input" />
            </div>
            <div className="cust-filter-actions">
              <button onClick={() => { setPage(1); }} className="cust-btn cust-btn-primary">Filter</button>
              <button onClick={handleClear} className="cust-btn cust-btn-ghost">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input type="text" placeholder="Search by name or contact..." value={searchString}
              onChange={e => setSearchString(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { handleSearch(e); } }}
              className="cust-input cust-search-input" />
            {searchString && (
              <button onClick={() => { setSearchString(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading earnings..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Type</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Kundali Type</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="cust-no-data">No earnings found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td>{row.user_type}</td>
                    <td className="cust-name-cell">{row.userName} - {row.userContactNo}</td>
                    <td className="cust-date-cell">{formatDate(row.created_at)}</td>
                    <td>{row.kundaliType || '--'}</td>
                    <td>
                      {row.pdf_link ? (
                        <a href={row.pdf_link.startsWith('http') ? row.pdf_link : '/' + row.pdf_link} target="_blank" rel="noreferrer"
                          className="cust-btn cust-btn-success">Download</a>
                      ) : 'No Pdf Available'}
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

export default KundaliEarnings;
