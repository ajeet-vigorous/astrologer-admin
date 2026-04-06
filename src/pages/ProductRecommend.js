import React, { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/services';
import Loader from '../components/Loader';
import { ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const ProductRecommend = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Image viewer modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewImage, setViewImage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getProductRecommend({ page });
      const d = res.data.data || res.data;
      setData(d.productrecommend || []);
      setPagination({
        totalPages: d.totalPages || 0,
        totalRecords: d.totalRecords || 0,
        start: d.start || 0,
        end: d.end || 0,
        page: d.page || 1
      });
    } catch (err) {
      console.error('Error fetching product recommends:', err);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${mon}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  };

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('public/')) return '/' + img; return '/public/' + img;
  };

  const openImageViewer = (img) => {
    setViewImage(img);
    setShowImageModal(true);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>
              {p}
            </button>
          ))}
          {pagination.totalPages > 15 && <span className="cust-page-dots">...</span>}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <ShoppingBag size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Product Recommends</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
      </div>

      <div className="cust-card">
        {/* Table */}
        {loading ? <Loader text="Loading recommendations..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>User</th>
                  <th>Astrologer</th>
                  <th>Purchased By User</th>
                  <th>Recommend Date</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="cust-no-data">No Data Available</td></tr>
                ) : (
                  data.map((item, i) => {
                    const imgSrc = getImageSrc(item.productImage || item.product?.productImage);
                    return (
                      <tr key={item.id || i}>
                        <td>{(pagination?.start || 0) + i}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt=""
                                className="cust-avatar"
                                style={{ borderRadius: 6, cursor: 'pointer' }}
                                onClick={() => openImageViewer(imgSrc)}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null}
                            <span className="cust-name-cell">{item.productName || item.product?.name || '-'}</span>
                          </div>
                        </td>
                        <td>{item.userName || item.user?.name || '-'}</td>
                        <td>{item.astrologerName || item.astrologer?.name || '-'}</td>
                        <td>
                          <span className={`cust-verify-badge ${item.isPurchased ? 'verified' : 'unverified'}`}>
                            {item.isPurchased ? 'Purchased' : 'Not Purchased'}
                          </span>
                        </td>
                        <td className="cust-date-cell">{formatDate(item.recommendDate || item.created_at || item.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Image Viewer Modal */}
      {showImageModal && viewImage && (
        <div className="cust-overlay" onClick={() => setShowImageModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90%', maxHeight: '90vh' }}>
            <button onClick={() => setShowImageModal(false)} style={{ position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', zIndex: 10 }}>
              <X size={18} />
            </button>
            <img src={viewImage} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRecommend;
