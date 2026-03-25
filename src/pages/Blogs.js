import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { blogApi } from '../api/services';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusId, setStatusId] = useState(null);
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

  const handleDelete = async () => {
    try { await blogApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
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

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return '/' + img;
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
        <label style={styles.label}>Title <span style={{ color: 'red' }}>*</span></label>
        <input type="text" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required style={styles.input} placeholder="Blog Title" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={styles.label}>Author <span style={{ color: 'red' }}>*</span></label>
          <input type="text" value={f.author} onChange={e => setF({ ...f, author: e.target.value })} required style={styles.input} placeholder="Author Name" />
        </div>
        <div>
          <label style={styles.label}>Posted On <span style={{ color: 'red' }}>*</span></label>
          <input type="date" value={f.postedOn} onChange={e => setF({ ...f, postedOn: e.target.value })} required style={styles.input} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Description <span style={{ color: 'red' }}>*</span></label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} required style={{ ...styles.input, minHeight: 120 }} placeholder="Blog description..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={styles.label}>Blog Image</label>
          {isEdit && f.blogImage && !f.blogImage.startsWith('data:') && (
            <img src={getImgSrc(f.blogImage)} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          {f.blogImage && f.blogImage.startsWith('data:') && (
            <img src={f.blogImage} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />
          )}
          <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'blogImage', isEdit)} />
        </div>
        <div>
          <label style={styles.label}>Preview Image</label>
          {isEdit && f.previewImage && !f.previewImage.startsWith('data:') && (
            <img src={getImgSrc(f.previewImage)} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          {f.previewImage && f.previewImage.startsWith('data:') && (
            <img src={f.previewImage} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />
          )}
          <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'previewImage', isEdit)} />
        </div>
      </div>
      <button type="submit" style={styles.addBtn}>{btnText}</button>
    </form>
  );

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>Blogs</h2>
        <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} style={styles.addBtn}>Add Blog</button>
        <div style={{ marginLeft: 'auto' }}>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ ...styles.input, width: 220 }} placeholder="Search blogs..." />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10 }}><h3 style={{ color: '#9ca3af' }}>Loading...</h3></div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10 }}><h3 style={{ color: '#9ca3af' }}>No Data Available</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {data.map(blog => (
            <div key={blog.id} style={styles.card}>
              <div style={styles.cardImgWrap}>
                {blog.blogImage ? (
                  <img src={getImgSrc(blog.blogImage)} alt="" style={styles.cardImg}
                    onClick={() => setViewerImg(getImgSrc(blog.blogImage))}
                    onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
                    <span style={{ color: '#9ca3af', fontSize: 14 }}>No Image</span>
                  </div>
                )}
                <div style={styles.cardOverlay}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{truncate(blog.title, 40)}</span>
                </div>
              </div>
              <div style={{ padding: '12px 15px' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Author:</span> {blog.author || '--'} &nbsp;|&nbsp;
                  <span style={{ fontWeight: 600 }}>Date:</span> {formatDate(blog.postedOn)}
                </div>
                <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{truncate(blog.description, 100)}</p>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => openEdit(blog)} style={styles.editBtn}>Edit</button>
                <button onClick={() => { setDeleteId(blog.id); setShowDeleteModal(true); }} style={{ ...styles.editBtn, color: '#ef4444' }}>Delete</button>
                <label style={styles.switchLabel}>
                  <input type="checkbox" checked={!!blog.isActive} onChange={() => { setStatusId(blog.id); setShowStatusModal(true); }} />
                  <span style={{ color: blog.isActive ? '#059669' : '#dc2626' }}>{blog.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderPagination()}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Blog">
        {renderForm(form, setForm, handleAdd, 'Add Blog', false)}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Blog">
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
  cardImgWrap: { position: 'relative', height: 180, overflow: 'hidden', cursor: 'pointer' },
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

export default Blogs;
