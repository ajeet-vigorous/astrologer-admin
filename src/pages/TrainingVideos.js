import React, { useState, useEffect, useCallback } from 'react';
import { MonitorPlay, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';
import { trainingVideoApi } from '../api/services';
import '../styles/Customers.css';

const TrainingVideos = () => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ title: '', video_link: '', type: 'user', cover_image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', video_link: '', type: 'user', cover_image: '' });
  const [editPreview, setEditPreview] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await trainingVideoApi.getAll({ page });
      setVideos(res.data.videos || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) { setEditForm(prev => ({ ...prev, cover_image: reader.result })); setEditPreview(reader.result); }
        else setForm(prev => ({ ...prev, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await trainingVideoApi.add(form); setShowAddModal(false); setForm({ title: '', video_link: '', type: 'user', cover_image: '' }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await trainingVideoApi.edit(editForm); setShowEditModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try { await trainingVideoApi.status({ status_id: id }); fetchData(); } catch (err) { console.error(err); }
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
        await trainingVideoApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const getImageSrc = (img) => {
    if (!img) return '/build/assets/images/default.jpg';
    return img.startsWith('http') ? img : '/' + img;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { totalPages } = pagination;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button className="cust-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={15} />
          </button>
          {pages.map((p, idx) =>
            p === '...' ? (
              <span key={`dot-${idx}`} className="cust-page-dots">...</span>
            ) : (
              <button key={p} className={`cust-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            )
          )}
          <button className="cust-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <Loader />;

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <MonitorPlay size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Training Videos</h2>
          {pagination && <span className="cust-count">({pagination.totalRecords} records)</span>}
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Video
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div className="cust-card">
        {videos.length > 0 ? (
          <>
            <div className="video-card-grid">
              {videos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-card-thumb">
                    <img
                      src={getImageSrc(video.cover_image)}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }}
                    />
                  </div>
                  <div className="video-card-body">
                    <div className="video-card-title">{video.title}</div>
                    {video.video_link && (
                      <a href={video.video_link} target="_blank" rel="noreferrer" className="video-card-link">
                        {video.video_link}
                      </a>
                    )}
                    <div className="video-card-type">
                      {video.type ? video.type.charAt(0).toUpperCase() + video.type.slice(1) : '--'}
                    </div>
                  </div>
                  <div className="video-card-footer">
                    <div className="cust-actions">
                      <button
                        className="cust-action-btn cust-action-edit"
                        title="Edit"
                        onClick={() => {
                          setEditForm({ filed_id: video.id, title: video.title, video_link: video.video_link, type: video.type, cover_image: '' });
                          setEditPreview(getImageSrc(video.cover_image));
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="cust-action-btn cust-action-delete"
                        title="Delete"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="cust-toggle-wrap">
                      <div
                        className={`cust-toggle ${video.isActive ? 'on' : ''}`}
                        onClick={() => handleStatus(video.id)}
                      >
                        <div className="cust-toggle-knob"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="cust-no-data">No Data Available</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Training Video</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Video For *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="user">User</option>
                    <option value="astrologer">Astrologer</option>
                  </select>
                </div>
                <div className="cust-form-group">
                  <label>Video Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Video Title" />
                </div>
                <div className="cust-form-group">
                  <label>Video Link *</label>
                  <input type="text" value={form.video_link} onChange={e => setForm({ ...form, video_link: e.target.value })} required placeholder="Video Link" />
                </div>
                <div className="cust-form-group">
                  <label>Cover Image *</label>
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e, false)} required />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Training Video</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Video For *</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                    <option value="user">User</option>
                    <option value="astrologer">Astrologer</option>
                  </select>
                </div>
                <div className="cust-form-group">
                  <label>Video Title *</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                </div>
                <div className="cust-form-group">
                  <label>Video Link *</label>
                  <input type="text" value={editForm.video_link} onChange={e => setEditForm({ ...editForm, video_link: e.target.value })} required />
                </div>
                <div className="cust-form-group">
                  <label>Cover Image</label>
                  {editPreview && <img src={editPreview} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />}
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e, true)} />
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

export default TrainingVideos;
