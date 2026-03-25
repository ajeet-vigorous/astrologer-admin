import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { webHomeFaqApi } from '../api/services';

const WebHomeFaq = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await webHomeFaqApi.getAll({ page });
      setData(res.data.webfaq || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await webHomeFaqApi.add(form); setShowAddModal(false); setForm({ title: '', description: '' }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await webHomeFaqApi.edit(editForm); setShowEditModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await webHomeFaqApi.delete({ faq_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const truncate = (str, words = 10) => {
    if (!str) return '--';
    const arr = str.split(' ');
    return arr.length > words ? arr.slice(0, words).join(' ') + '...' : str;
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Title', render: (row) => <span style={{ fontWeight: 500 }}>{row.title}</span> },
    { header: 'Description', render: (row) => <span title={row.description} style={{ cursor: 'pointer' }}>{truncate(row.description)}</span> },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={() => { setEditForm({ filed_id: row.id, title: row.title, description: row.description || '' }); setShowEditModal(true); }} style={styles.linkBtn}>Edit</button>
          <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable title="Website FAQ's" columns={columns} data={data} pagination={pagination} onPageChange={setPage}
        headerActions={<button onClick={() => setShowAddModal(true)} style={styles.addBtn}>Add Website Faqs</button>} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Website Faqs">
        <form onSubmit={handleAdd} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={styles.input} placeholder="Add Title" /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ ...styles.input, minHeight: 100 }} /></div>
          <button type="submit" style={styles.addBtn}>Add Website Faqs</button>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Website Faqs">
        <form onSubmit={handleEdit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Title *</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={styles.input} /></div>
          <div style={{ marginBottom: 12 }}><label style={styles.label}>Description *</label><textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required style={{ ...styles.input, minHeight: 100 }} /></div>
          <button type="submit" style={styles.addBtn}>Save</button>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete FAQ">
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
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
};

export default WebHomeFaq;
