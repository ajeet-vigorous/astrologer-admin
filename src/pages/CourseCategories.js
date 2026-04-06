import React, { useState, useEffect, useCallback } from 'react';
import { courseApi } from '../api/services';
import Loader from '../components/Loader';
import { GraduationCap, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

import getImageUrl from '../utils/getImageUrl';

const CourseCategories = () => {
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
      const res = await courseApi.getCategories({ page });
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
      const res = await courseApi.addCategory(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ name: '', image: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await courseApi.editCategory(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatusToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await courseApi.categoryStatus({ status_id: id });
        Swal.fire({ title: 'Updated!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to update status', icon: 'error', confirmButtonColor: '#7c3aed' });
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
          <GraduationCap size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Course Categories</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ name: '', image: '' }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Category
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading course categories..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No course categories found.</td></tr>
                ) : data.map((cat, i) => (
                  <tr key={cat.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      <img
                        src={getImgSrc(cat.image)}
                        alt={cat.name}
                        className="cust-avatar"
                        onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
                      />
                    </td>
                    <td className="cust-name-cell">{cat.name}</td>
                    <td>
                      <span
                        onClick={() => handleStatusToggle(cat.id)}
                        className={`cust-verify-badge ${cat.isActive ? 'verified' : 'unverified'}`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEdit(cat)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Course Category</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Category Name <span className="af-req">*</span></label>
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
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add Course Category</button>
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
              <h3>Edit Course Category</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Category Name <span className="af-req">*</span></label>
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

export default CourseCategories;
