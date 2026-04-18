import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { newsApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/Customers.css';
import '../styles/Blogs.css';

import getImgSrc from '../utils/getImageUrl';

const News = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);

  const emptyForm = { newsDate: '', channel: '', link: '', description: '', bannerImage: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await newsApi.getAll({ page });
      const d = res.data || {};
      setData(d.news || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleImageChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) setEditForm(f => ({ ...f, bannerImage: reader.result }));
        else setForm(f => ({ ...f, bannerImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await newsApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (editForm.bannerImage && !editForm.bannerImage.startsWith('data:')) {
        delete payload.bannerImage;
      }
      const res = await newsApi.edit(payload);
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
        await newsApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleStatus = async () => {
    try { await newsApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id,
      newsDate: row.newsDate ? row.newsDate.split('T')[0] : '',
      channel: row.channel || '',
      link: row.link || '',
      description: row.description || '',
      bannerImage: row.bannerImage || ''
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
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Channel <span className="cust-err">*</span></label>
          <input type="text" value={f.channel} onChange={e => setF({ ...f, channel: e.target.value })} required placeholder="Channel Name" />
        </div>
        <div className="cust-form-group">
          <label>News Date <span className="cust-err">*</span></label>
          <input type="date" value={f.newsDate} onChange={e => setF({ ...f, newsDate: e.target.value })} required />
        </div>
      </div>
      <div className="cust-form-group">
        <label>Link <span className="cust-err">*</span></label>
        <input type="text" value={f.link} onChange={e => setF({ ...f, link: e.target.value })} required placeholder="https://..." />
      </div>
      <div className="cust-form-group">
        <label>Description</label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="News description..." rows={4} />
      </div>
      <div className="cust-form-group">
        <label>Banner Image <span className="cust-err">*</span></label>
        {isEdit && f.bannerImage && !f.bannerImage.startsWith('data:') && (
          <img src={getImgSrc(f.bannerImage)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.bannerImage && f.bannerImage.startsWith('data:') && (
          <img src={f.bannerImage} alt="" className="cust-img-preview" />
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Newspaper size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Astro Vell News</h2>
          {/* <span className="cust-count">({ttalRecords} total)</span> */}
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }}>
            <Plus size={15} /> Add News
          </button>
        </div>
      </div>

      {/* News Cards */}
      <div className="cust-card">
        {loading ? <Loader /> : data.length === 0 ? (
          <div className="cust-no-data">No news found</div>
        ) : (
          <div className="mall-card-grid">
            {data.map(item => (
              <div key={item.id} className="blog-card">
                <div className="blog-card-img-wrap" onClick={() => item.bannerImage && setViewerImg(getImgSrc(item.bannerImage))}>
                  {item.bannerImage ? (
                    <img
                      src={getImgSrc(item.bannerImage)}
                      alt=""
                      className="blog-card-img"
                      onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
                    />
                  ) : (
                    <div className="blog-card-no-img">
                      <Newspaper size={28} />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="blog-card-overlay">
                    <span>{item.channel || '--'}</span>
                  </div>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span><strong>Date:</strong> {formatDate(item.newsDate)}</span>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="blog-card-meta">
                      {truncate(item.link, 50)}
                    </a>
                  )}
                  <p className="blog-card-desc">{truncate(item.description, 80)}</p>
                </div>
                <div className="blog-card-footer">
                  <div className="cust-actions">
                    <button className="cust-action-btn cust-action-edit" title="Edit" onClick={() => openEdit(item)}>
                      <Pencil size={15} />
                    </button>
                    <button className="cust-action-btn cust-action-delete" title="Delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="cust-toggle-wrap" onClick={() => { setStatusId(item.id); setShowStatusModal(true); }}>
                    <div className={`cust-toggle ${item.isActive ? 'on' : ''}`}>
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
              <h3>Add News</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add News', false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit News</h3>
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

export default News;
