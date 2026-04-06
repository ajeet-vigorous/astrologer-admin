import React, { useState, useEffect } from 'react';
import { Video, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle, Play } from 'lucide-react';
import Swal from 'sweetalert2';
import { adsVideoApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const AdsVideos = () => {
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

  const emptyForm = { videoTitle: '', youtubeLink: '', coverImage: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adsVideoApi.getAll({ page });
      const d = res.data?.data || res.data || {};
      setData(d.adsVideo || []);
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
        if (isEdit) setEditForm(f => ({ ...f, coverImage: reader.result }));
        else setForm(f => ({ ...f, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await adsVideoApi.add({
        videoTitle: form.videoTitle,
        youtubeLink: form.youtubeLink,
        coverImage: form.coverImage
      });
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
        videoTitle: editForm.videoTitle,
        youtubeLink: editForm.youtubeLink
      };
      if (editForm.coverImage && editForm.coverImage.startsWith('data:')) {
        payload.coverImage = editForm.coverImage;
      }
      const res = await adsVideoApi.edit(payload);
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
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await adsVideoApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleStatus = async () => {
    try { await adsVideoApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id,
      videoTitle: row.videoTitle || '',
      youtubeLink: row.youtubeLink || '',
      coverImage: row.coverImage || ''
    });
    setShowEditModal(true);
  };


  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page]);
    if (page > 1) pages.add(page - 1);
    if (page < totalPages) pages.add(page + 1);
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('dots-' + i);
      }
      result.push(sorted[i]);
    }
    return result;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {getPageNumbers().map(p =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-group">
        <label>Video Title <span className="cust-err">*</span></label>
        <input type="text" value={f.videoTitle} onChange={e => setF({ ...f, videoTitle: e.target.value })} required placeholder="Enter video title" />
      </div>
      <div className="cust-form-group">
        <label>YouTube Link <span className="cust-err">*</span></label>
        <input type="text" value={f.youtubeLink} onChange={e => setF({ ...f, youtubeLink: e.target.value })} required placeholder="https://youtube.com/..." />
      </div>
      <div className="cust-form-group">
        <label>Cover Image</label>
        {isEdit && f.coverImage && !f.coverImage.startsWith('data:') && (
          <img src={getImgSrc(f.coverImage)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.coverImage && f.coverImage.startsWith('data:') && (
          <img src={f.coverImage} alt="" className="cust-img-preview" />
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  return (
    <div>
      <style>{`
        .video-card-thumb {
          position: relative;
          height: 140px;
          overflow: hidden;
          cursor: pointer;
          background: #f1f5f9;
        }
        .video-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s;
        }
        .video-card-thumb:hover .video-card-img {
          transform: scale(1.05);
        }
        .video-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #94a3b8;
        }
        .video-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: #fff;
        }
        .video-card-title {
          font-weight: 600;
          font-size: 13px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .video-card-body {
          padding: 10px 12px;
        }
        .video-card-link {
          color: #7c3aed;
          font-size: 11.5px;
          font-weight: 500;
          word-break: break-all;
          text-decoration: none;
        }
        .video-card-link:hover {
          text-decoration: underline;
        }
        .video-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-top: 1px solid #f1f5f9;
        }
        .video-viewer-wrap {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        .video-viewer-close {
          position: absolute;
          top: -14px;
          right: -14px;
          background: #fff !important;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 1;
        }
        .video-viewer-img {
          max-width: 90vw;
          max-height: 85vh;
          border-radius: 8px;
          object-fit: contain;
        }
      `}</style>

      {/* Topbar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Video size={18} className="cust-topbar-icon" />
          <h2 className="cust-title">Video Ads</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Video
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="cust-card">
        {loading ? (
          <Loader />
        ) : data.length === 0 ? (
          <div className="cust-no-data">No Data Available</div>
        ) : (
          <div className="video-card-grid">
            {data.map(item => (
              <div key={item.id} className="cust-card" >
                {/* Thumbnail / Cover */}
                <div className="video-card-thumb" onClick={() => item.coverImage && setViewerImg(getImgSrc(item.coverImage))}>
                  {item.coverImage ? (
                    <img src={getImgSrc(item.coverImage)} alt="" className="video-card-img"
                      onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                  ) : (
                    <div className="video-card-placeholder">
                      <Play size={28} />
                    </div>
                  )}
                  <div className="video-card-overlay">
                    <span className="video-card-title">{item.videoTitle || '--'}</span>
                  </div>
                </div>

                {/* Link */}
                <div className="video-card-body">
                  {item.youtubeLink && (
                    <a href={item.youtubeLink} target="_blank" rel="noreferrer" className="video-card-link">
                      {item.youtubeLink.length > 50 ? item.youtubeLink.substring(0, 50) + '...' : item.youtubeLink}
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="video-card-actions">
                  <div className="cust-actions">
                    <button onClick={() => openEdit(item)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={14} /></button>
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
        {renderPagination()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Video</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add Video', false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Video</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, handleEdit, 'Save', true)}
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {showStatusModal && (
        <div className="cust-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-delete-content">
              <div className="cust-delete-icon">
                <AlertTriangle size={26} />
              </div>
              <h3>Are You Sure?</h3>
              <p>You want to change the status?</p>
              <div className="cust-delete-actions">
                <button onClick={handleStatus} className="cust-btn cust-btn-primary">Yes</button>
                <button onClick={() => setShowStatusModal(false)} className="cust-btn cust-btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div className="video-viewer-wrap" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewerImg(null)} className="cust-modal-close video-viewer-close"><X size={18} /></button>
            <img src={viewerImg} alt="" className="video-viewer-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsVideos;
