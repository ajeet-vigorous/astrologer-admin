import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pujaPackageApi } from '../api/services';

const PujaFaq = () => {
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
      const res = await pujaPackageApi.getFaqList({ page });
      setData(res.data.Pujafaq || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await pujaPackageApi.addFaq(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ title: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await pujaPackageApi.editFaq(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await pujaPackageApi.deleteFaq({ faq_id: deleteId });
      setShowDeleteModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEdit = (faq) => {
    setEditForm({ filed_id: faq.id, title: faq.title, description: faq.description });
    setShowEditModal(true);
  };

  const truncate = (text, words = 10) => {
    if (!text) return '';
    const arr = text.split(' ');
    return arr.length > words ? arr.slice(0, words).join(' ') + '...' : text;
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Title', render: (row) => <span style={{ fontWeight: 500 }}>{row.title}</span> },
    { header: 'Description', render: (row) => <span title={row.description} style={{ cursor: 'pointer' }}>{truncate(row.description)}</span> },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openEdit(row)} style={styles.linkBtn}>Edit</button>
          <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable title="Puja FAQ's" columns={columns} data={data} pagination={pagination} onPageChange={setPage}
        headerActions={<button onClick={() => { setForm({ title: '', description: '' }); setShowAddModal(true); }} style={styles.addBtn}>Add Puja FAQ</button>}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Puja FAQ">
        <form onSubmit={handleAdd}>
          <FormInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Add Title" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={styles.textarea} rows={4} required placeholder="Enter description" />
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Add Puja FAQ</button></div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Puja FAQ">
        <form onSubmit={handleEdit}>
          <FormInput label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required placeholder="Add Title" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Description</label>
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              style={styles.textarea} rows={4} required placeholder="Enter description" />
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Save</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete FAQ">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are you sure?</p>
          <p style={{ color: '#6b7280' }}>This process cannot be undone.</p>
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
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
};

export default PujaFaq;
