import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { astroMallApi } from '../api/services';

const AstroMallProducts = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown menu
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Add Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProductId, setDetailProductId] = useState(null);
  const [detailQuestion, setDetailQuestion] = useState('');
  const [detailAnswer, setDetailAnswer] = useState('');

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusItem, setStatusItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await astroMallApi.getProducts({ page, searchString: search });
      const d = res.data;
      setData(d.astromallProduct || []);
      setPagination({
        totalPages: d.totalPages || 0,
        totalRecords: d.totalRecords || 0,
        start: d.start || 0,
        end: d.end || 0,
        page: d.page || 1
      });
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      setSearch(searchInput);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Status modal
  const openStatusModal = (item) => {
    setStatusItem(item);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusItem) return;
    try {
      await astroMallApi.productStatus({ status_id: statusItem.id });
      setShowStatusModal(false);
      setStatusItem(null);
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Add Detail modal
  const openDetailModal = (productId) => {
    setDetailProductId(productId);
    setDetailQuestion('');
    setDetailAnswer('');
    setShowDetailModal(true);
    setOpenDropdown(null);
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      await astroMallApi.addProductDetail({
        productId: detailProductId,
        question: detailQuestion,
        answer: detailAnswer
      });
      setShowDetailModal(false);
      fetchData();
    } catch (err) {
      console.error('Error adding product detail:', err);
    }
  };

  const getImageSrc = (item) => {
    const img = item.productImage || item.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${mon}-${year}`;
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Products</h2>
        <button onClick={() => navigate('/admin/astromall/products/add')} style={styles.addBtn}>Add Product</button>
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchBtn}>Search</button>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div style={styles.noData}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={styles.noData}>No Data Available</div>
      ) : (
        <div style={styles.cardGrid} className="astromall-prod-grid">
          {data.map((item) => {
            const imgSrc = getImageSrc(item);
            const isActive = item.isActive === 1 || item.isActive === true;
            const categoryName = item.productCategory?.name || item.categoryName || '-';
            return (
              <div key={item.id} style={styles.card}>
                {/* Image area */}
                <div style={styles.cardImageWrap}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.name} style={styles.cardImage} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>No Image</div>
                  )}
                  <div style={styles.gradientOverlay}></div>

                  {/* Three-dot dropdown */}
                  <div style={styles.dropdownContainer} ref={openDropdown === item.id ? dropdownRef : null}>
                    <button onClick={() => toggleDropdown(item.id)} style={styles.dotsBtn}>&#8942;</button>
                    {openDropdown === item.id && (
                      <div style={styles.dropdownMenu}>
                        <div onClick={() => { navigate(`/admin/astromall/products/view/${item.id}`); setOpenDropdown(null); }} style={styles.dropdownItem}>View Product</div>
                        <div onClick={() => { navigate(`/admin/astromall/products/edit/${item.id}`); setOpenDropdown(null); }} style={styles.dropdownItem}>Edit Product</div>
                        <div onClick={() => openDetailModal(item.id)} style={styles.dropdownItem}>Add Detail</div>
                      </div>
                    )}
                  </div>

                  {/* Name + date overlay */}
                  <div style={styles.cardOverlayText}>
                    <div style={styles.cardName}>{item.name}</div>
                    <div style={styles.cardDate}>{formatDate(item.created_at || item.createdAt)}</div>
                  </div>
                </div>

                {/* Info section */}
                <div style={styles.cardInfo}>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>Amount (INR):</span> <span>{item.amount || '-'}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>Amount (USD):</span> <span>{item.usd_amount || '-'}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>Product Category:</span> <span>{categoryName}</span></div>
                  <div style={styles.infoRow}><span style={styles.infoLabel}>Features:</span> <span style={{ fontSize: 13 }}>{item.features || '-'}</span></div>
                </div>

                {/* Footer with status toggle */}
                <div style={styles.cardFooter}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                  <label style={styles.switchLabel}>
                    <div
                      onClick={() => openStatusModal(item)}
                      style={{
                        ...styles.switchTrack,
                        background: isActive ? '#10b981' : '#d1d5db'
                      }}
                    >
                      <div style={{
                        ...styles.switchThumb,
                        transform: isActive ? 'translateX(20px)' : 'translateX(0)'
                      }}></div>
                    </div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Add Product Detail Modal */}
      {showDetailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Add Product Detail</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.modalClose}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleDetailSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Question <span style={{ color: 'red' }}>*</span></label>
                  <textarea
                    value={detailQuestion}
                    onChange={(e) => setDetailQuestion(e.target.value)}
                    style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                    placeholder="Enter question"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Answer <span style={{ color: 'red' }}>*</span></label>
                  <textarea
                    value={detailAnswer}
                    onChange={(e) => setDetailAnswer(e.target.value)}
                    style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                    placeholder="Enter answer"
                    required
                  />
                </div>
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.submitBtn}>Add</button>
                  <button type="button" onClick={() => setShowDetailModal(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusModal && statusItem && (
        <div style={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
          <div style={styles.statusModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.statusModalBody}>
              <div style={styles.statusIcon}>!</div>
              <h3 style={{ margin: '10px 0 5px', fontSize: 20 }}>Are You Sure?</h3>
              <p style={{ color: '#6b7280', margin: '5px 0 20px' }}>
                You want {(statusItem.isActive === 1 || statusItem.isActive === true) ? 'Inactive' : 'Active'}!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button onClick={handleStatusConfirm} style={styles.yesBtn}>Yes</button>
                <button onClick={() => setShowStatusModal(false)} style={styles.cancelStatusBtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: '#1f2937' },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  searchBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardImageWrap: { position: 'relative', width: '100%', height: 160, overflow: 'hidden', background: '#e5e7eb' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' },
  cardOverlayText: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  cardName: { color: '#fff', fontWeight: 600, fontSize: 15, textShadow: '0 1px 3px rgba(0,0,0,0.5)' },
  cardDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  // Three-dot dropdown
  dropdownContainer: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
  dotsBtn: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  dropdownMenu: { position: 'absolute', right: 0, top: 35, background: '#fff', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 150, overflow: 'hidden', zIndex: 20 },
  dropdownItem: { padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' },

  // Card info
  cardInfo: { padding: '12px 14px', borderBottom: '1px solid #f3f4f6' },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' },
  infoLabel: { fontWeight: 600, color: '#6b7280', marginRight: 8 },

  // Footer
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' },
  switchLabel: { cursor: 'pointer' },
  switchTrack: { width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' },
  switchThumb: { width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },

  noData: { textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 10 },
  pageInfo: { fontSize: 14, color: '#6b7280' },
  pageButtons: { display: 'flex', gap: 6 },
  pageBtn: { padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 10, width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #e5e7eb' },
  modalClose: { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280', padding: '0 5px' },
  modalBody: { padding: 20 },
  modalActions: { display: 'flex', gap: 10, marginTop: 20 },
  formGroup: { marginBottom: 15 },
  label: { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },

  // Status modal
  statusModalContent: { background: '#fff', borderRadius: 10, width: '90%', maxWidth: 400, overflow: 'hidden' },
  statusModalBody: { textAlign: 'center', padding: '30px 20px' },
  statusIcon: { width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 },
  yesBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelStatusBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
};

// Responsive styles
const styleTag = document.createElement('style');
styleTag.textContent = `
  @media (max-width: 1100px) {
    .astromall-prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 600px) {
    .astromall-prod-grid { grid-template-columns: 1fr !important; }
  }
`;
if (!document.getElementById('astromall-prod-responsive')) {
  styleTag.id = 'astromall-prod-responsive';
  document.head.appendChild(styleTag);
}

export default AstroMallProducts;
