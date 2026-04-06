import React, { useState, useEffect } from 'react';
import { pujaApi } from '../api/services';
import Loader from '../components/Loader';
import { HandHeart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const AstrologerPuja = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [search, setSearch] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [approveStatus, setApproveStatus] = useState('');
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      const res = await pujaApi.getAstrologerList(params);
      const d = res.data || {};
      setData(d.pujalist || []);
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

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchString);
    setPage(1);
  };

  const openApprove = (id, currentStatus) => {
    setApproveId(id);
    setApproveStatus(currentStatus);
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    try {
      await pujaApi.approveStatus({ filed_id: approveId });
      setShowApproveModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };


  const getPujaImages = (row) => {
    if (!row.puja_images || !Array.isArray(row.puja_images)) return [];
    return row.puja_images;
  };

  const openImageViewer = (images, startIdx) => {
    const srcs = images.map(img => getImgSrc(img)).filter(Boolean);
    if (srcs.length > 0) {
      setViewerImages(srcs);
      setViewerIndex(startIdx || 0);
    }
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

  const getNewStatus = (s) => (s === 'Pending' || s === 'Rejected') ? 'Approved' : 'Rejected';

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'verified';
    if (status === 'Rejected') return 'unverified';
    return 'unverified';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const total = totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-start');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('dots-end');
      pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={idx} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page >= total} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Astrologer Puja List</h2>
            <div className="cust-count">{totalRecords} total</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          <form onSubmit={handleSearch} className="cust-filter-search">
            <input
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="Search by astrologer name..."
              className="cust-input"
            />
          </form>
          <button type="submit" onClick={handleSearch} className="cust-btn cust-btn-primary">Search</button>
          {search && (
            <button type="button" onClick={() => { setSearchString(''); setSearch(''); }} className="cust-btn cust-btn-ghost">Clear</button>
          )}
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading astrologer pujas..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Astrologer</th>
                  <th>Puja Title</th>
                  <th>Puja Image</th>
                  <th>Puja Price</th>
                  <th>Puja Place</th>
                  <th>Puja Start</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} className="cust-no-data">No Data Available</td></tr>
                ) : data.map((row, index) => {
                  const images = getPujaImages(row);
                  return (
                    <tr key={row.id || index}>
                      <td>{(page - 1) * 15 + index + 1}</td>
                      <td className="cust-name-cell">{row.astrologerName || '--'}</td>
                      <td>{row.puja_title || '--'}</td>
                      <td>
                        {images.length > 0 ? (
                          <div className="cust-actions">
                            <img
                              src={getImgSrc(images[0])}
                              alt=""
                              className="cust-avatar"
                              onClick={() => openImageViewer(images, 0)}
                              onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }}
                            />
                            {images.length > 1 && (
                              <span className="cust-req-badge purple" onClick={() => openImageViewer(images, 0)}>
                                +{images.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <img src="/build/assets/images/default.jpg" alt="" className="cust-avatar" />
                        )}
                      </td>
                      <td>{row.puja_price ? `₹${row.puja_price}` : '--'}</td>
                      <td>{row.puja_place || '--'}</td>
                      <td className="cust-date-cell">{formatDate(row.puja_start_datetime)}</td>
                      <td>{row.puja_duration ? `${row.puja_duration} mins` : '--'}</td>
                      <td>
                        <div className="cust-actions">
                          <span className={`cust-verify-badge ${getStatusClass(row.isAdminApproved)}`}>
                            {row.isAdminApproved || 'Pending'}
                          </span>
                          {row.isAdminApproved !== 'Approved' && (
                            <button onClick={() => openApprove(row.id, 'Rejected')} className="cust-btn cust-btn-success">Approve</button>
                          )}
                          {row.isAdminApproved !== 'Rejected' && (
                            <button onClick={() => openApprove(row.id, 'Approved')} className="cust-btn cust-btn-danger">Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Approve/Reject Modal */}
      {showApproveModal && (
        <div className="cust-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Are You Sure?</h3>
              <button className="cust-modal-close" onClick={() => setShowApproveModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-delete-content">
                <p>You want to {getNewStatus(approveStatus)}?</p>
                <div className="cust-delete-actions">
                  <button onClick={handleApprove} className="cust-btn cust-btn-primary">Yes, {getNewStatus(approveStatus)} it!</button>
                  <button onClick={() => setShowApproveModal(false)} className="cust-btn cust-btn-ghost">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer with Navigation */}
      {viewerImages.length > 0 && (
        <div className="cust-overlay" onClick={() => setViewerImages([])}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Puja Images ({viewerIndex + 1} / {viewerImages.length})</h3>
              <button className="cust-modal-close" onClick={() => setViewerImages([])}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-delete-content">
                <img src={viewerImages[viewerIndex]} alt=""
                  className="cust-img-preview"
                  onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
                {viewerImages.length > 1 && (
                  <div className="cust-delete-actions">
                    <button onClick={() => setViewerIndex(i => (i - 1 + viewerImages.length) % viewerImages.length)}
                      className="cust-btn cust-btn-ghost"><ChevronLeft size={18} /> Prev</button>
                    <button onClick={() => setViewerIndex(i => (i + 1) % viewerImages.length)}
                      className="cust-btn cust-btn-ghost">Next <ChevronRight size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologerPuja;
