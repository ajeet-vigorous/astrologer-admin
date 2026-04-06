import React, { useState, useEffect, useCallback } from 'react';
import { astroMallApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { ShoppingBag, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

import getImageUrl from '../utils/getImageUrl';

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

  // Status toggle with SweetAlert2
  const handleStatusToggle = (item) => {
    const isActive = item.isActive === 1 || item.isActive === true;
    Swal.fire({
      title: 'Are You Sure?',
      text: `You want ${isActive ? 'Inactive' : 'Active'}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await astroMallApi.categoryStatus({ status_id: item.id });
          fetchData();
        } catch (err) {
          console.error('Error toggling status:', err);
        }
      }
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This category will be deleted!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7c3aed', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, Delete' });
    if (result.isConfirmed) {
      try { await astroMallApi.deleteCategory({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const getImageSrc = (item) => {
    const img = item.categoryImage || item.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return getImageUrl(img);
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
            <h2 className="cust-title">Product Categories</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={openAddModal} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Category
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="cust-input cust-search-input"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="cust-filter-actions">
          <button onClick={handleSearch} className="cust-btn cust-btn-primary">
            <Search size={13} /> Search
          </button>
        </div>
      </div>

      <div className="cust-card">
        {/* Card Grid */}
        {loading ? (
          <Loader text="Loading categories..." />
        ) : data.length === 0 ? (
          <div className="cust-no-data">No Data Available</div>
        ) : (
          <div className="mall-card-grid">
            {data.map((item) => {
              const imgSrc = getImageSrc(item);
              const isActive = item.isActive === 1 || item.isActive === true;
              return (
                <div key={item.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {/* Image area with gradient overlay */}
                  <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', background: '#e5e7eb' }}>
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>No Image</div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, color: '#fff', fontWeight: 600, fontSize: 15, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{item.name}</div>
                  </div>
                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid #f3f4f6' }}>
                    <button onClick={() => openEditModal(item)} className="cust-action-btn cust-action-edit" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="cust-action-btn cust-action-delete" title="Delete">
                      <Trash2 size={15} />
                    </button>
                    <div className="cust-toggle-wrap">
                      <div className={`cust-toggle ${isActive ? 'on' : ''}`} onClick={() => handleStatusToggle(item)}>
                        <div className="cust-toggle-knob" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Product Category</h3>
              <button onClick={() => setShowAddModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="cust-form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageChange}
                />
              </div>
              {addPreview && (
                <div className="cust-form-group">
                  <img src={addPreview} alt="Preview" className="cust-img-preview" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Product Category</h3>
              <button onClick={() => setShowEditModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              {editCurrentImage && !editPreview && (
                <div className="cust-form-group">
                  <label>Current Image</label>
                  <img
                    src={editCurrentImage.startsWith('http') ? editCurrentImage : '/' + editCurrentImage}
                    alt="Current"
                    className="cust-img-preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="cust-form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
              </div>
              {editPreview && (
                <div className="cust-form-group">
                  <label>New Image Preview</label>
                  <img src={editPreview} alt="Preview" className="cust-img-preview" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Update</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstroMallCategories;
