import React, { useState, useEffect } from 'react';
import { courseApi } from '../api/services';
import { GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import '../styles/Customers.css';

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

  const getStatusClass = (status, type) => {
    if (type === 'order') {
      if (status === 'success') return 'verified';
      if (status === 'failed') return 'unverified';
      return 'unverified';
    } else {
      if (status === 'completed') return 'verified';
      return 'unverified';
    }
  };

  const getSmartPages = () => {
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
    const smartPages = getSmartPages();
    return (
      <div className="cust-pagination">
        <div className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</div>
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
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cust-page-btn">
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
          <GraduationCap size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Course Orders</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right">
          <div className="cust-filter-date-row">
            <div className="cust-filter-group">
              <label className="cust-filter-label">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="cust-input cust-date-input" />
            </div>
            <div className="cust-filter-group">
              <label className="cust-filter-label">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="cust-input cust-date-input" />
            </div>
            <div className="cust-filter-actions">
              <button onClick={handleFilter} className="cust-btn cust-btn-primary">Filter</button>
              <button onClick={handleClear} className="cust-btn cust-btn-ghost">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="cust-card">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="cust-table-wrap">
              <table className="cust-table">
                <thead>
                  <tr>
                    {['#', 'Course', 'Astrologer', 'Price', 'GST', 'Total', 'Payment', 'Order Status', 'Completion', 'Date'].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan={10} className="cust-no-data">No Data Available</td></tr>
                  ) : (
                    data.map((row, index) => (
                      <tr key={row.id || index}>
                        <td>{(page - 1) * 15 + index + 1}</td>
                        <td><span className="cust-name-cell">{row.course_name || '--'}</span></td>
                        <td>{row.astrologer_name || '--'}</td>
                        <td>{row.course_price ? `${currency} ${Number(row.course_price).toFixed(2)}` : '--'}</td>
                        <td>{row.course_gst_amount ? `${currency} ${Number(row.course_gst_amount).toFixed(2)}` : '--'}</td>
                        <td>{row.course_total_price ? `${currency} ${Number(row.course_total_price).toFixed(2)}` : '--'}</td>
                        <td>
                          <span className="cust-verify-badge verified">
                            {row.payment_type || '--'}
                          </span>
                        </td>
                        <td>
                          <span className={`cust-verify-badge ${getStatusClass(row.course_order_status, 'order')}`}>
                            {row.course_order_status || '--'}
                          </span>
                        </td>
                        <td>
                          <span className={`cust-verify-badge ${getStatusClass(row.course_completion_status, 'completion')}`}>
                            {row.course_completion_status || '--'}
                          </span>
                        </td>
                        <td className="cust-date-cell">{formatDate(row.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseOrders;
