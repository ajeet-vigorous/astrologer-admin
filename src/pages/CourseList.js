import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Eye, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { courseApi } from '../api/services';
import '../styles/Customers.css';

import getImageUrl from '../utils/getImageUrl';

const CourseList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const emptyForm = { name: '', description: '', course_category_id: '', course_badge: '', course_price: '', course_price_usd: '', image: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getList({ page });
      const d = res.data || {};
      setData(d.courses || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    courseApi.getCategories({ page: 1 }).then(res => setCategories(res.data.categories || [])).catch(console.error);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await courseApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await courseApi.edit(editForm);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await courseApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', text: 'Course has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const handleStatusToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await courseApi.status({ status_id: id });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

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

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id, name: row.name || '', description: row.description || '',
      course_category_id: row.course_category_id || '', course_badge: row.course_badge || '',
      course_price: row.course_price || '', course_price_usd: row.course_price_usd || '',
      image: row.image || ''
    });
    setShowEditModal(true);
  };

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return getImageUrl(img);
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Name <span className="cust-err">*</span></label>
          <input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required placeholder="Course Name" />
        </div>
        <div className="cust-form-group">
          <label>Category</label>
          <select value={f.course_category_id} onChange={e => setF({ ...f, course_category_id: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="cust-form-group">
        <label>Description</label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Course description" />
      </div>
      <div className="cust-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="cust-form-group">
          <label>Badge</label>
          <input type="text" value={f.course_badge} onChange={e => setF({ ...f, course_badge: e.target.value })} placeholder="Badge" />
        </div>
        <div className="cust-form-group">
          <label>Price (INR)</label>
          <input type="text" value={f.course_price} onChange={e => setF({ ...f, course_price: e.target.value })} placeholder="₹0.00" />
        </div>
        <div className="cust-form-group">
          <label>Price (USD)</label>
          <input type="text" value={f.course_price_usd} onChange={e => setF({ ...f, course_price_usd: e.target.value })} placeholder="$0.00" />
        </div>
      </div>
      <div className="cust-form-group">
        <label>Image</label>
        {isEdit && f.image && !f.image.startsWith('data:') && (
          <img src={getImgSrc(f.image)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.image && f.image.startsWith('data:') && (
          <img src={f.image} alt="" className="cust-img-preview" />
        )}
        <input type="file" accept="image/*" onChange={e => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      let s = Math.max(2, page - 1);
      let e = Math.min(totalPages - 1, page + 1);
      for (let i = s; i <= e; i++) pages.push(i);
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
          <GraduationCap size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Courses</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }}>
            <Plus size={15} /> Add Course
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price (INR)</th>
                <th>Price (USD)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="cust-no-data">
                    <Loader size={22} className="spinning-loader" /> Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="cust-no-data">No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index}>
                    <td>{(page - 1) * 15 + index + 1}</td>
                    <td>
                      {row.image ? (
                        <img src={getImgSrc(row.image)} alt="" className="cust-avatar" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="cust-avatar" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap size={16} color="#94a3b8" />
                        </div>
                      )}
                    </td>
                    <td className="cust-name-cell">{row.name || '--'}</td>
                    <td>{row.category_name || '--'}</td>
                    <td>{row.course_price ? `₹${Number(row.course_price).toFixed(2)}` : '--'}</td>
                    <td>{row.course_price_usd ? `$${Number(row.course_price_usd).toFixed(2)}` : '--'}</td>
                    <td>
                      <div
                        className={`cust-toggle ${row.isActive ? 'on' : ''}`}
                        onClick={() => handleStatusToggle(row.id)}
                      >
                        <div className="cust-toggle-knob"></div>
                      </div>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button className="cust-action-btn cust-action-view" title="View">
                          <Eye size={15} />
                        </button>
                        <button className="cust-action-btn cust-action-edit" onClick={() => openEdit(row)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className="cust-action-btn cust-action-delete" onClick={() => handleDelete(row.id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
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
              <ChevronLeft size={15} />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="cust-page-dots">...</span>
              ) : (
                <button key={p} className={`cust-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )
            )}
            <button className="cust-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Course</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add Course', false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Course</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, handleEdit, 'Save Changes', true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
