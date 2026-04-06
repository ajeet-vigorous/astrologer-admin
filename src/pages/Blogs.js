import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { blogApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/Customers.css';
import '../styles/Blogs.css';

import getImgSrc from '../utils/getImageUrl';

const Blogs = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);

  const emptyForm = { title: '', description: '', author: '', postedOn: '', blogImage: '', previewImage: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      const res = await blogApi.getAll(params);
      const d = res.data || {};
      setData(d.blogs || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleImageChange = (e, field, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) setEditForm(f => ({ ...f, [field]: reader.result }));
        else setForm(f => ({ ...f, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        author: form.author,
        postedOn: form.postedOn
      };
      if (form.blogImage) payload.blogImage = form.blogImage;
      if (form.previewImage) payload.previewImage = form.previewImage;
      const res = await blogApi.add(payload);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        filed_id: editForm.filed_id,
        title: editForm.title,
        editdescription: editForm.description,
        author: editForm.author,
        postedOn: editForm.postedOn
      };
      if (editForm.blogImage && editForm.blogImage.startsWith('data:')) payload.eblogImage = editForm.blogImage;
      if (editForm.previewImage && editForm.previewImage.startsWith('data:')) payload.previewImages = editForm.previewImage;
      const res = await blogApi.edit(payload);
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
      confirmButtonText: 'Yes, Delete'
    });
    if (result.isConfirmed) {
      try {
        await blogApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleStatus = async () => {
    try { await blogApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id,
      title: row.title || '',
      description: row.description || '',
      author: row.author || '',
      postedOn: row.postedOn ? row.postedOn.split('T')[0] : '',
      blogImage: row.blogImage || '',
      previewImage: row.previewImage || ''
    });
    setShowEditModal(true);
  };


  const formatDate = (d) => {
    if (!d) return '--';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const truncate = (text, len = 80) => {
    if (!text) return '--';
    return text.length > len ? text.substring(0, len) + '...' : text;
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (page > 3) pages.push('...');
    const rangeStart = Math.max(2, page - 1);
    const rangeEnd = Math.min(totalPages - 1, page + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-group">
        <label>Title <span className="cust-err">*</span></label>
        <input type="text" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required placeholder="Blog Title" />
      </div>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Author <span className="cust-err">*</span></label>
          <input type="text" value={f.author} onChange={e => setF({ ...f, author: e.target.value })} required placeholder="Author Name" />
        </div>
        <div className="cust-form-group">
          <label>Posted On <span className="cust-err">*</span></label>
          <input type="date" value={f.postedOn} onChange={e => setF({ ...f, postedOn: e.target.value })} required />
        </div>
      </div>
      <div className="cust-form-group">
        <label>Description <span className="cust-err">*</span></label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} required placeholder="Blog description..." rows={5} />
      </div>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Blog Image</label>
          {isEdit && f.blogImage && !f.blogImage.startsWith('data:') && (
            <img src={getImgSrc(f.blogImage)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          {f.blogImage && f.blogImage.startsWith('data:') && (
            <img src={f.blogImage} alt="" className="cust-img-preview" />
          )}
          <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'blogImage', isEdit)} />
        </div>
        <div className="cust-form-group">
          <label>Preview Image</label>
          {isEdit && f.previewImage && !f.previewImage.startsWith('data:') && (
            <img src={getImgSrc(f.previewImage)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          {f.previewImage && f.previewImage.startsWith('data:') && (
            <img src={f.previewImage} alt="" className="cust-img-preview" />
          )}
          <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'previewImage', isEdit)} />
        </div>
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <FileText size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Blogs</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }}>
            <Plus size={15} /> Add Blog
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-search-group">
          <div className="cust-filter-search">
            <Search size={15} className="cust-search-icon" />
            <input
              type="text"
              className="cust-input cust-search-input"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search blogs..."
            />
            {search && (
              <button className="cust-search-clear" onClick={() => { setSearch(''); setPage(1); }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blog Cards */}
      <div className="cust-card">
        {loading ? <Loader /> : data.length === 0 ? (
          <div className="cust-no-data">No blogs found</div>
        ) : (
          <div className="mall-card-grid">
            {data.map(blog => (
              <div key={blog.id} className="blog-card">
                <div className="blog-card-img-wrap" onClick={() => blog.blogImage && setViewerImg(getImgSrc(blog.blogImage))}>
                  {blog.blogImage ? (
                    <img
                      src={getImgSrc(blog.blogImage)}
                      alt=""
                      className="blog-card-img"
                      onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
                    />
                  ) : (
                    <div className="blog-card-no-img">
                      <FileText size={28} />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="blog-card-overlay">
                    <span>{truncate(blog.title, 40)}</span>
                  </div>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span><strong>Author:</strong> {blog.author || '--'}</span>
                    <span><strong>Date:</strong> {formatDate(blog.postedOn)}</span>
                  </div>
                  <p className="blog-card-desc">{truncate(blog.description, 100)}</p>
                </div>
                <div className="blog-card-footer">
                  <div className="cust-actions">
                    <button className="cust-action-btn cust-action-edit" title="Edit" onClick={() => openEdit(blog)}>
                      <Pencil size={15} />
                    </button>
                    <button className="cust-action-btn cust-action-delete" title="Delete" onClick={() => handleDelete(blog.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="cust-toggle-wrap" onClick={() => { setStatusId(blog.id); setShowStatusModal(true); }}>
                    <div className={`cust-toggle ${blog.isActive ? 'on' : ''}`}>
                      <div className="cust-toggle-knob"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cust-pagination">
            <span className="cust-page-info">
              Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
            </span>
            <div className="cust-page-btns">
              <button className="cust-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="cust-page-dots">...</span>
                ) : (
                  <button
                    key={p}
                    className={`cust-page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button className="cust-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Blog</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add Blog', false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Blog</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, handleEdit, 'Save Changes', true)}
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {showStatusModal && (
        <div className="cust-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-delete-content">
              <div className="cust-delete-icon">
                <AlertTriangle size={28} />
              </div>
              <h3>Are You Sure?</h3>
              <p>You want to change the status?</p>
              <div className="cust-delete-actions">
                <button className="cust-btn cust-btn-primary" onClick={handleStatus}>Yes</button>
                <button className="cust-btn cust-btn-ghost" onClick={() => setShowStatusModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div className="blog-viewer-wrap" onClick={e => e.stopPropagation()}>
            <button className="blog-viewer-close" onClick={() => setViewerImg(null)}>
              <X size={18} />
            </button>
            <img src={viewerImg} alt="" className="blog-viewer-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
