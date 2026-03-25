import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { courseApi } from '../api/services';

const CourseCategories = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [form, setForm] = useState({ name: '', image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', name: '', image: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await courseApi.getCategories({ page });
      setData(res.data.categories || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
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

  const handleStatus = async () => {
    try {
      await courseApi.categoryStatus({ status_id: statusId });
      setShowStatusModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEdit = (cat) => {
    setEditForm({ filed_id: cat.id, name: cat.name, image: cat.image || '' });
    setShowEditModal(true);
  };

  const getImgSrc = (img) => {
    if (!img) return '/build/assets/images/person.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('data:')) return img;
    return '/' + img;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, margin: '20px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>Course Categories</h2>
        <button onClick={() => { setForm({ name: '', image: '' }); setShowAddModal(true); }} style={styles.addBtn}>Add Course Category</button>
      </div>

      {data.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {data.map(cat => (
            <div key={cat.id} style={styles.card}>
              <div style={styles.cardImgWrap}>
                <img src={getImgSrc(cat.image)} alt="" style={styles.cardImg} onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                <div style={styles.cardOverlay}><span style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</span></div>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => openEdit(cat)} style={styles.editBtn}>Edit</button>
                <label style={styles.switchLabel}>
                  <input type="checkbox" checked={!!cat.isActive} onChange={() => { setStatusId(cat.id); setShowStatusModal(true); }} />
                  <span style={{ color: cat.isActive ? '#059669' : '#dc2626' }}>{cat.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10 }}><h3 style={{ color: '#9ca3af' }}>No Data Available</h3></div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 20 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>&lt;</button>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ ...styles.pageBtn, ...(page === i + 1 ? styles.pageBtnActive : {}) }}>{i + 1}</button>
          ))}
          <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>&gt;</button>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Course Category">
        <form onSubmit={handleAdd}>
          <FormInput label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Category Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} required />
            {form.image && <img src={form.image} alt="" style={{ width: 150, marginTop: 10, borderRadius: 6 }} />}
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Add Course Category</button></div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course Category">
        <form onSubmit={handleEdit}>
          <FormInput label="Name" name="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required placeholder="Category Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category Image</label>
            {editForm.image && <img src={getImgSrc(editForm.image)} alt="" style={{ width: 150, marginBottom: 10, borderRadius: 6 }} onError={(e) => { e.target.style.display = 'none'; }} />}
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Save</button></div>
        </form>
      </Modal>

      {/* Status Confirmation Modal */}
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
    </div>
  );
};

const styles = {
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardImgWrap: { position: 'relative', height: 170, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' },
  cardActions: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid #e5e7eb', gap: 20 },
  editBtn: { background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  switchLabel: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  pageBtn: { padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 400, width: '90%' }
};

export default CourseCategories;
