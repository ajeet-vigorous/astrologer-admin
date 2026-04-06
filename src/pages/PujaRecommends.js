import React, { useState, useEffect, useCallback } from 'react';
import { HandHeart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { pujaApi } from '../api/services';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const PujaRecommends = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pujaApi.getRecommends({ page });
      setData(res.data.pujarecommend || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getImgSrc = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return '/build/assets/images/default.jpg';
    const img = images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('public/')) return '/' + img; return '/public/' + img;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '--';

  // Smart pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages || 1;
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const startP = Math.max(2, page - 1);
      const endP = Math.min(total - 1, page + 1);
      for (let i = startP; i <= endP; i++) pages.push(i);
      if (page < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={20} color="#7c3aed" />
          <h2 className="cust-title">Puja Recommends</h2>
          {pagination && <span className="cust-count">({pagination.totalRecords} total)</span>}
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Puja</th>
                <th>User</th>
                <th>Astrologer</th>
                <th>Purchased By User</th>
                <th>Recommend Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="cust-no-data"><Loader2 size={22} className="spin" color="#7c3aed" /> Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="cust-no-data">No data found</td></tr>
              ) : (
                data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td>
                      <img className="cust-avatar" src={getImgSrc(row.puja_images)} alt=""
                        onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
                    </td>
                    <td className="cust-name-cell">{row.userName || '--'}</td>
                    <td className="cust-name-cell">{row.astrologerName || '--'}</td>
                    <td>
                      <span className={`cust-verify-badge ${row.isPurchased ? 'verified' : 'unverified'}`}>
                        {row.isPurchased ? 'Purchased' : 'Not Purchased'}
                      </span>
                    </td>
                    <td className="cust-date-cell">{formatDate(row.recommDateTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination */}
        {pagination && (
          <div className="cust-pagination">
            <div className="cust-page-info">
              Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
            </div>
            <div className="cust-page-btns">
              <button className="cust-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={'dots-' + i} className="cust-page-dots">...</span>
                ) : (
                  <button key={p} className={`cust-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                )
              )}
              <button className="cust-page-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PujaRecommends;
