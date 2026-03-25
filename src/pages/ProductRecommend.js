import React, { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/services';

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
    return '/' + img;
  };

  const openImageViewer = (img) => {
    setViewImage(img);
    setShowImageModal(true);
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Product Recommends</h2>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Astrologer</th>
                <th style={styles.th}>Purchased By User</th>
                <th style={styles.th}>Recommend Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((item, i) => {
                  const imgSrc = getImageSrc(item.productImage || item.product?.productImage);
                  return (
                    <tr key={item.id || i} style={styles.tr}>
                      <td style={styles.td}>{(pagination?.start || 0) + i}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt=""
                              style={styles.productThumb}
                              onClick={() => openImageViewer(imgSrc)}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null}
                          <span>{item.productName || item.product?.name || '-'}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{item.userName || item.user?.name || '-'}</td>
                      <td style={styles.td}>{item.astrologerName || item.astrologer?.name || '-'}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#fff',
                          background: item.isPurchased ? '#10b981' : '#ef4444'
                        }}>
                          {item.isPurchased ? 'Purchased' : 'Not Purchased'}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(item.recommendDate || item.created_at || item.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalRecords > 0 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
          </span>
          <div style={styles.pageButtons}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                style={{
                  ...styles.pageBtn,
                  background: pagination.page === i + 1 ? '#7c3aed' : '#fff',
                  color: pagination.page === i + 1 ? '#fff' : '#374151',
                  border: pagination.page === i + 1 ? '1px solid #7c3aed' : '1px solid #d1d5db'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && viewImage && (
        <div style={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div style={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowImageModal(false)} style={styles.imageModalClose}>&times;</button>
            <img src={viewImage} alt="" style={styles.imageModalImg} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: '#1f2937' },

  // Table
  tableWrapper: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 14px', textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: 13 },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 14px', verticalAlign: 'middle', color: '#374151' },
  noData: { textAlign: 'center', padding: 40, color: '#9ca3af' },
  productThumb: { width: 40, height: 40, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' },

  // Pagination
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 10 },
  pageInfo: { fontSize: 14, color: '#6b7280' },
  pageButtons: { display: 'flex', gap: 6 },
  pageBtn: { padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  // Image Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  imageModalContent: { position: 'relative', maxWidth: '90%', maxHeight: '90vh' },
  imageModalClose: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', zIndex: 10 },
  imageModalImg: { maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }
};

export default ProductRecommend;
