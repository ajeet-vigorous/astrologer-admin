import React, { useState, useEffect, useCallback } from 'react';
import { pujaCategoryApi } from '../api/services';
import Loader from '../components/Loader';
import { HandHeart, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

import getImageUrl from '../utils/getImageUrl';

const PujaCategories = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ name: '', image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', name: '', image: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pujaCategoryApi.getAll({ page });
      setData(res.data.categories || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) setEditForm(f => ({ ...f, image: reader.result }));
        else setForm(f => ({ ...f, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await pujaCategoryApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ name: '', image: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await pujaCategoryApi.edit(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try {
      await pujaCategoryApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${cat.name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await pujaCategoryApi.delete({ id: cat.id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (e) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const openEdit = (cat) => {
    setEditForm({ filed_id: cat.id, name: cat.name, image: cat.image || '' });
    setShowEditModal(true);
  };

  const getImgSrc = (img) => {
    if (!img) return '/build/assets/images/person.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('data:')) return img;
    return getImageUrl(img);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
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
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={idx} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn"><ChevronRight size={14} /></button>
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
            <h2 className="cust-title">Puja Categories</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ name: '', image: '' }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Puja Category
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading puja categories..." /> : (
          data.length === 0 ? (
            <div className="cust-no-data">No puja categories found.</div>
          ) : (
            <div className="mall-card-grid">
              {data.map(cat => (
                <div key={cat.id} className="video-card">
                  <div className="video-card-thumb">
                    <img src={getImgSrc(cat.image)} alt={cat.name} onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                  </div>
                  <div className="video-card-body">
                    <div className="video-card-title">{cat.name}</div>
                  </div>
                  <div className="video-card-footer">
                    <span
                      onClick={() => handleStatus(cat.id)}
                      className={`cust-verify-badge ${cat.isActive ? 'verified' : 'unverified'}`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="cust-actions">
                      <button onClick={() => openEdit(cat)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(cat)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {renderPagination()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Puja Category</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Name <span className="af-req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Category Name"
                  />
                </div>
                <div className="cust-form-group">
                  <label>Category Image <span className="af-req">*</span></label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} required />
                  {form.image && <img src={form.image} alt="Preview" className="cust-img-preview" />}
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add Puja Category</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Puja Category</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Name <span className="af-req">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    placeholder="Category Name"
                  />
                </div>
                <div className="cust-form-group">
                  <label>Category Image</label>
                  {editForm.image && (
                    <img
                      src={getImgSrc(editForm.image)}
                      alt="Preview"
                      className="cust-img-preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaCategories;
