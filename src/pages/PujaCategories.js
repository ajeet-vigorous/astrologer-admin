import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pujaCategoryApi } from '../api/services';

const PujaCategories = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ name: '', image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', name: '', image: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await pujaCategoryApi.getAll({ page });
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
      const res = await pujaCategoryApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ name: '', image: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await pujaCategoryApi.edit(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try {
      await pujaCategoryApi.status({ status_id: id });
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
    return '/' + img;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, margin: '20px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Puja Categories</h2>
        <button onClick={() => { setForm({ name: '', image: '' }); setShowAddModal(true); }} style={styles.addBtn}>Add Puja Category</button>
      </div>

      {data.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {data.map(cat => (
            <div key={cat.id} style={styles.card}>
              <div style={styles.cardImgWrap}>
                <img src={getImgSrc(cat.image)} alt="" style={styles.cardImg} onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                <div style={styles.cardOverlay}><span style={{ fontWeight: 500 }}>{cat.name}</span></div>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => openEdit(cat)} style={styles.editBtn}>Edit</button>
                <label style={styles.switchLabel}>
                  <input type="checkbox" checked={!!cat.isActive} onChange={() => handleStatus(cat.id)} />
                  <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                </label>
                <button onClick={async () => {
                  if (!window.confirm('Delete "' + cat.name + '"? This cannot be undone.')) return;
                  try {
                    await pujaCategoryApi.delete({ id: cat.id });
                    fetchData();
                  } catch(e) { alert('Failed to delete'); }
                }} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60 }}><h3>No Data Available</h3></div>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Puja Category">
        <form onSubmit={handleAdd}>
          <FormInput label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} required />
            {form.image && <img src={form.image} alt="" style={{ width: 150, marginTop: 10 }} />}
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Add Puja Category</button></div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Puja Category">
        <form onSubmit={handleEdit}>
          <FormInput label="Name" name="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required placeholder="Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category Image</label>
            {editForm.image && <img src={editForm.image.startsWith('data:') ? editForm.image : getImgSrc(editForm.image)} alt="" style={{ width: 150, marginBottom: 10 }} onError={(e) => { e.target.style.display = 'none'; }} />}
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' },
  cardImgWrap: { position: 'relative', height: 160, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' },
  cardActions: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid #e5e7eb', gap: 15 },
  editBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 },
  switchLabel: { display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 },
  pageBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff' },
  pageBtnActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }
};

export default PujaCategories;
