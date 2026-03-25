import React, { useState, useEffect, useCallback } from 'react';
import { astroMallApi } from '../api/services';

const AstroMallCategories = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addImage, setAddImage] = useState(null);
  const [addPreview, setAddPreview] = useState(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editCurrentImage, setEditCurrentImage] = useState(null);

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusItem, setStatusItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await astroMallApi.getCategories({ page, searchString: search });
      const d = res.data;
      setData(d.astroMall || []);
      setPagination({
        totalPages: d.totalPages || 0,
        totalRecords: d.totalRecords || 0,
        start: d.start || 0,
        end: d.end || 0,
        page: d.page || 1
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Add modal handlers
  const openAddModal = () => {
    setAddName('');
    setAddImage(null);
    setAddPreview(null);
    setShowAddModal(true);
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddImage(file);
      const reader = new FileReader();
      reader.onload = () => setAddPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', addName);
      if (addImage) formData.append('categoryImage', addImage);
      await astroMallApi.addCategory(formData);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  // Edit modal handlers
  const openEditModal = (item) => {
    setEditId(item.id);
    setEditName(item.name || '');
    setEditImage(null);
    setEditPreview(null);
    setEditCurrentImage(item.categoryImage || item.image || null);
    setShowEditModal(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onload = () => setEditPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('filed_id', editId);
      formData.append('name', editName);
      if (editImage) formData.append('categoryImage', editImage);
      await astroMallApi.editCategory(formData);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error('Error editing category:', err);
    }
  };

  // Status toggle handlers
  const openStatusModal = (item) => {
    setStatusItem(item);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusItem) return;
    try {
      await astroMallApi.categoryStatus({ status_id: statusItem.id });
      setShowStatusModal(false);
      setStatusItem(null);
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const getImageSrc = (item) => {
    const img = item.categoryImage || item.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Product Categories</h2>
        <button onClick={openAddModal} style={styles.addBtn}>Add Product Category</button>
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
        <div style={styles.cardGrid}>
          {data.map((item) => {
            const imgSrc = getImageSrc(item);
            const isActive = item.isActive === 1 || item.isActive === true;
            return (
              <div key={item.id} style={styles.card}>
                {/* Image area with gradient overlay */}
                <div style={styles.cardImageWrap}>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.name}
                      style={styles.cardImage}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>No Image</div>
                  )}
                  <div style={styles.gradientOverlay}></div>
                  <div style={styles.cardNameOverlay}>{item.name}</div>
                </div>
                {/* Footer */}
                <div style={styles.cardFooter}>
                  <span
                    onClick={() => openEditModal(item)}
                    style={styles.editLink}
                  >
                    Edit
                  </span>
                  {/* Toggle switch */}
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Add Product Category</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleAddSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageChange}
                    style={styles.input}
                  />
                </div>
                {addPreview && (
                  <div style={styles.formGroup}>
                    <img src={addPreview} alt="Preview" style={styles.previewImage} />
                  </div>
                )}
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.submitBtn}>Add</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Edit Product Category</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.modalClose}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleEditSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                {editCurrentImage && !editPreview && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Image</label>
                    <img
                      src={editCurrentImage.startsWith('http') ? editCurrentImage : '/' + editCurrentImage}
                      alt="Current"
                      style={styles.previewImage}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    style={styles.input}
                  />
                </div>
                {editPreview && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Image Preview</label>
                    <img src={editPreview} alt="Preview" style={styles.previewImage} />
                  </div>
                )}
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.submitBtn}>Update</button>
                  <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
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
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'box-shadow 0.2s' },
  cardImageWrap: { position: 'relative', width: '100%', height: 160, overflow: 'hidden', background: '#e5e7eb' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' },
  cardNameOverlay: { position: 'absolute', bottom: 10, left: 12, right: 12, color: '#fff', fontWeight: 600, fontSize: 15, textShadow: '0 1px 3px rgba(0,0,0,0.5)' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid #f3f4f6' },
  editLink: { color: '#7c3aed', cursor: 'pointer', fontWeight: 500, fontSize: 14 },
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
  previewImage: { width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },

  // Status modal
  statusModalContent: { background: '#fff', borderRadius: 10, width: '90%', maxWidth: 400, overflow: 'hidden' },
  statusModalBody: { textAlign: 'center', padding: '30px 20px' },
  statusIcon: { width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 },
  yesBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelStatusBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
};

// Responsive override via media query in a style tag
const styleTag = document.createElement('style');
styleTag.textContent = `
  @media (max-width: 1200px) {
    .astromall-cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 900px) {
    .astromall-cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 600px) {
    .astromall-cat-grid { grid-template-columns: 1fr !important; }
  }
`;
if (!document.getElementById('astromall-cat-responsive')) {
  styleTag.id = 'astromall-cat-responsive';
  document.head.appendChild(styleTag);
}

export default AstroMallCategories;
