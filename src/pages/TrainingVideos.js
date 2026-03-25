import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import { trainingVideoApi } from '../api/services';

const TrainingVideos = () => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', video_link: '', type: 'user', cover_image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', video_link: '', type: 'user', cover_image: '' });
  const [editPreview, setEditPreview] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await trainingVideoApi.getAll({ page });
      setVideos(res.data.videos || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
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

  const handleDelete = async () => {
    try { await trainingVideoApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Training Videos</h2>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>Add New Video</button>
      </div>

      {videos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {videos.map(video => (
            <div key={video.id} style={styles.card}>
              <div style={{ padding: 20 }}>
                <div style={{ height: 180, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={video.cover_image ? (video.cover_image.startsWith('http') ? video.cover_image : '/' + video.cover_image) : '/build/assets/images/default.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
                </div>
                {video.video_link && <a href={video.video_link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: 14, wordBreak: 'break-all', display: 'block', height: 40, overflow: 'hidden' }}>{video.video_link}</a>}
                <div style={{ color: '#475569', marginTop: 8, fontSize: 14 }}>{video.title}</div>
                <div style={{ color: '#6b7280', marginTop: 4, fontSize: 13 }}>Type: {video.type ? video.type.charAt(0).toUpperCase() + video.type.slice(1) : '--'}</div>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <button onClick={() => { setEditForm({ filed_id: video.id, title: video.title, video_link: video.video_link, type: video.type, cover_image: '' }); setEditPreview(video.cover_image ? (video.cover_image.startsWith('http') ? video.cover_image : '/' + video.cover_image) : ''); setShowEditModal(true); }} style={styles.linkBtn}>Edit</button>
                <button onClick={() => { setDeleteId(video.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', marginLeft: 'auto' }}>
                  <input type="checkbox" checked={!!video.isActive} onChange={() => handleStatus(video.id)} />
                  <span style={{ fontSize: 13 }}>{video.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No Data Available</div>
      )}

      {pagination && pagination.totalRecords > 0 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 14 }}>Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>&laquo;</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} style={{ ...styles.pageBtn, ...(page === i + 1 ? { background: '#3b82f6', color: '#fff' } : {}) }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} style={styles.pageBtn}>&raquo;</button>
          </div>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Training Video">
        <form onSubmit={handleAdd} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video For *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={styles.input}>
              <option value="user">User</option>
              <option value="astrologer">Astrologer</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={styles.input} placeholder="Video Title" /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video Link *</label><input type="text" value={form.video_link} onChange={e => setForm({ ...form, video_link: e.target.value })} required style={styles.input} placeholder="Video Link" /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Cover Image *</label><input type="file" accept="image/*" onChange={e => handleImageChange(e, false)} required style={styles.input} /></div>
          <button type="submit" style={styles.addBtn}>Save</button>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Training Video">
        <form onSubmit={handleEdit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video For *</label>
            <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={styles.input}>
              <option value="user">User</option>
              <option value="astrologer">Astrologer</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video Title *</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={styles.input} /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Video Link *</label><input type="text" value={editForm.video_link} onChange={e => setEditForm({ ...editForm, video_link: e.target.value })} required style={styles.input} /></div>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Cover Image</label>
            {editPreview && <img src={editPreview} alt="" style={{ width: 150, marginBottom: 8, borderRadius: 4 }} onError={(e) => { e.target.style.display = 'none'; }} />}
            <input type="file" accept="image/*" onChange={e => handleImageChange(e, true)} style={styles.input} />
          </div>
          <button type="submit" style={styles.addBtn}>Save</button>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Training Video">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are you sure?</p>
          <p style={{ color: '#6b7280', marginTop: 8 }}>This process cannot be undone.</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 },
  label: { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  pageBtn: { padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }
};

export default TrainingVideos;
