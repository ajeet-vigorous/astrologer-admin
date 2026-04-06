import React, { useState, useEffect } from 'react';
import { HandHeart, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { pujaApi } from '../api/services';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const PujaOrders = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [currency, setCurrency] = useState('\u20B9');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewerImg, setViewerImg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await pujaApi.getOrders(params);
      const d = res.data || {};
      setData(d.pujaOrderlist || []);
      setAstrologers(d.astrologers || []);
      setCurrency(d.currency?.value || '\u20B9');
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) {
      console.error(err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, fromDate, toDate]);

  const handleAssign = async (orderId, astrologerId) => {
    try {
      await pujaApi.updateOrder({ puja_order_id: orderId, astrologer_id: astrologerId });
      Swal.fire('Success', 'Astrologer assigned successfully!', 'success');
      fetchData();
    } catch (err) { Swal.fire('Error', 'Failed to assign', 'error'); console.error(err); }
  };

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


  const getPujaImages = (row) => {
    if (!row.puja_images || !Array.isArray(row.puja_images)) return [];
    return row.puja_images;
  };

  const getAddress = (row) => {
    return [row.address_flatno, row.address_locality, row.address_landmark, row.address_city, row.address_state, row.address_country, row.address_pincode].filter(Boolean).join(', ') || '--';
  };

  const handleFilter = () => { setPage(1); fetchData(); };
  const handleClear = () => { setFromDate(''); setToDate(''); setPage(1); };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'cust-verify-badge verified';
      case 'cancelled': return 'cust-verify-badge unverified';
      default: return 'cust-verify-badge';
    }
  };

  // Smart pagination
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const startP = Math.max(2, page - 1);
      const endP = Math.min(totalPages - 1, page + 1);
      for (let i = startP; i <= endP; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={20} color="#7c3aed" />
          <h2 className="cust-title">Puja Order List</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">From</label>
            <input type="date" className="cust-input cust-date-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <input type="date" className="cust-input cust-date-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="cust-filter-actions">
            <button className="cust-btn cust-btn-primary" onClick={handleFilter}>Filter</button>
            <button className="cust-btn cust-btn-ghost" onClick={handleClear}>Clear</button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Astrologer</th>
                <th>User</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Puja</th>
                <th>Puja Images</th>
                <th>Package</th>
                <th>Price</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="cust-no-data"><Loader2 size={22} className="spin" color="#7c3aed" /> Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={11} className="cust-no-data">No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index}>
                    <td>{(page - 1) * 15 + index + 1}</td>
                    {/* Astrologer dropdown */}
                    <td>
                      <select className="cust-input" value={row.astrologer_id || ''} onChange={(e) => handleAssign(row.id, e.target.value)}>
                        <option value="" disabled>--Select--</option>
                        {astrologers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </td>
                    {/* User */}
                    <td>
                      <div className="cust-name-cell">
                        {row.userProfile ? (
                          <img className="cust-avatar" src={getImgSrc(row.userProfile)} alt=""
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : null}
                        <span>{row.userName || '--'}</span>
                      </div>
                    </td>
                    <td>{row.contactNo || '--'}</td>
                    <td>{getAddress(row)}</td>
                    <td className="cust-name-cell">{row.puja_name || row.puja_name_from_puja || '--'}</td>
                    {/* Puja Images */}
                    <td>
                      {getPujaImages(row).length > 0 ? (
                        getPujaImages(row).slice(0, 3).map((img, imgIdx) => (
                          <img key={imgIdx} className="cust-avatar" src={getImgSrc(img)} alt=""
                            onClick={() => setViewerImg(getImgSrc(img))}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ))
                      ) : (
                        <span className="cust-date-cell">No Images</span>
                      )}
                    </td>
                    <td>{row.package_name || '--'}</td>
                    <td className="cust-name-cell">{currency} {row.order_total_price ? Number(row.order_total_price).toFixed(2) : '0.00'}</td>
                    <td className="cust-date-cell">{formatDate(row.created_at)}</td>
                    <td>
                      <select className={getStatusBadgeClass(row.puja_order_status)} value={row.puja_order_status || 'placed'} onChange={async (e) => {
                        try {
                          await pujaApi.updateOrder({ puja_order_id: row.id, puja_order_status: e.target.value });
                          fetchData();
                        } catch(err) { Swal.fire('Error', 'Failed to update status', 'error'); }
                      }}>
                        <option value="pending">Pending</option>
                        <option value="placed">Placed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination */}
        <div className="cust-pagination">
          <div className="cust-page-info">
            Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
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
            <button className="cust-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Image Preview</h3>
              <button className="cust-modal-close" onClick={() => setViewerImg(null)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <img src={viewerImg} alt="" className="cd-item-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaOrders;
