import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import { pageApi } from '../api/services';

const PAGE_TYPES = [
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'aboutus', label: 'About Us' },
  { value: 'refundpolicy', label: 'Refund Policy' },
  { value: 'astrologerPrivacy', label: 'Astrologer Privacy Policy' },
  { value: 'astrologerTerms', label: 'Astrologer Terms & Conditions' },
  { value: 'others', label: 'Others' }
];

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', type: '', description: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', type: '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await pageApi.getAll();
      setPages(res.data.pages || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await pageApi.add(form); setShowAddModal(false); setForm({ title: '', type: '', description: '' }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await pageApi.edit(editForm); setShowEditModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try { await pageApi.status({ status_id: id }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await pageApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const getTypeLabel = (type) => {
    const found = PAGE_TYPES.find(t => t.value === type);
    return found ? found.label : type || '--';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Pages</h2>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>Add Page</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {pages.map(page => (
          <div key={page.id} style={styles.card}>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{page.title}</h3>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Type: {getTypeLabel(page.type)}</div>
              <div style={{ color: '#475569', fontSize: 14, maxHeight: 120, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: page.description }} />
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditForm({ filed_id: page.id, title: page.title, type: page.type, description: page.description || '' }); setShowEditModal(true); }} style={styles.linkBtn}>Edit</button>
                <button onClick={() => { setDeleteId(page.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!page.isActive} onChange={() => handleStatus(page.id)} />
                <span style={{ fontSize: 13 }}>{page.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No pages found</div>}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Page">
        <form onSubmit={handleAdd} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={styles.input} placeholder="Title" /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Type *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required style={styles.input}>
              <option value="">--Select Type--</option>
              {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...styles.input, minHeight: 150 }} /></div>
          <button type="submit" style={styles.addBtn}>Add Page</button>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Page">
        <form onSubmit={handleEdit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Title *</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={styles.input} /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Type *</label>
            <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} required style={styles.input}>
              <option value="">--Select Type--</option>
              {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Description</label><textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...styles.input, minHeight: 150 }} /></div>
          <button type="submit" style={styles.addBtn}>Save</button>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Page">
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
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }
};

export default Pages;
