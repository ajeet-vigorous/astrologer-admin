import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { adsVideoApi } from '../api/services';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusId, setStatusId] = useState(null);
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

  const handleDelete = async () => {
    try { await adsVideoApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
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

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return '/' + img;
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</div>
        <div style={styles.paginationButtons}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>Prev</button>
          {pages.map(p => (<button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}>Next</button>
        </div>
      </div>
    );
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Video Title <span style={{ color: 'red' }}>*</span></label>
        <input type="text" value={f.videoTitle} onChange={e => setF({ ...f, videoTitle: e.target.value })} required style={styles.input} placeholder="Enter video title" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>YouTube Link <span style={{ color: 'red' }}>*</span></label>
        <input type="text" value={f.youtubeLink} onChange={e => setF({ ...f, youtubeLink: e.target.value })} required style={styles.input} placeholder="https://youtube.com/..." />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Cover Image</label>
        {isEdit && f.coverImage && !f.coverImage.startsWith('data:') && (
          <img src={getImgSrc(f.coverImage)} alt="" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.coverImage && f.coverImage.startsWith('data:') && (
          <img src={f.coverImage} alt="" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" style={styles.addBtn}>{btnText}</button>
    </form>
  );

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>Videos Ads</h2>
        <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} style={styles.addBtn}>Add Video</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10 }}><h3 style={{ color: '#9ca3af' }}>Loading...</h3></div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10 }}><h3 style={{ color: '#9ca3af' }}>No Data Available</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {data.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardImgWrap}>
                {item.coverImage ? (
                  <img src={getImgSrc(item.coverImage)} alt="" style={styles.cardImg}
                    onClick={() => setViewerImg(getImgSrc(item.coverImage))}
                    onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
                    <span style={{ color: '#9ca3af', fontSize: 14 }}>No Cover</span>
                  </div>
                )}
                <div style={styles.cardOverlay}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{item.videoTitle || '--'}</span>
                </div>
              </div>
              <div style={{ padding: '12px 15px' }}>
                {item.youtubeLink && (
                  <a href={item.youtubeLink} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', fontSize: 12, fontWeight: 500, wordBreak: 'break-all' }}>
                    {item.youtubeLink.length > 50 ? item.youtubeLink.substring(0, 50) + '...' : item.youtubeLink}
                  </a>
                )}
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => openEdit(item)} style={styles.editBtn}>Edit</button>
                <button onClick={() => { setDeleteId(item.id); setShowDeleteModal(true); }} style={{ ...styles.editBtn, color: '#ef4444' }}>Delete</button>
                <label style={styles.switchLabel}>
                  <input type="checkbox" checked={!!item.isActive} onChange={() => { setStatusId(item.id); setShowStatusModal(true); }} />
                  <span style={{ color: item.isActive ? '#059669' : '#dc2626' }}>{item.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderPagination()}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Video">
        {renderForm(form, setForm, handleAdd, 'Add Video', false)}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Video">
        {renderForm(editForm, setEditForm, handleEdit, 'Save', true)}
      </Modal>

      {showDeleteModal && (
        <div style={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Are you sure?</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>This process cannot be undone.</p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
              <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div style={styles.overlay} onClick={() => setShowStatusModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Are You Sure?</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>You want to change the status?</p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={handleStatus} style={styles.addBtn}>Yes</button>
              <button onClick={() => setShowStatusModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {viewerImg && (
        <div style={styles.overlay} onClick={() => setViewerImg(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewerImg(null)} style={styles.closeBtn}>✕</button>
            <img src={viewerImg} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  label: { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardImgWrap: { position: 'relative', height: 170, overflow: 'hidden', cursor: 'pointer' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' },
  cardActions: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid #e5e7eb', gap: 20 },
  editBtn: { background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  switchLabel: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 400, width: '90%' },
  closeBtn: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
};

export default AdsVideos;
