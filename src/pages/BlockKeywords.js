import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { dataMonitorApi } from '../api/services';

const BlockKeywords = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ type: '', pattern: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dataMonitorApi.getBlockKeywords({ page });
      setData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching block keywords:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ type: '', pattern: '' });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({ type: row.type || '', pattern: row.pattern || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await dataMonitorApi.updateKeyword({ id: editData.id, ...form });
      } else {
        await dataMonitorApi.storeKeyword(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving keyword:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this keyword?')) {
      try {
        await dataMonitorApi.deleteKeyword(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting keyword:', err);
      }
    }
  };

  const columns = [
    { header: '#', render: (row, i) => i + 1 },
    { header: 'Type', key: 'type' },
    { header: 'Pattern', render: (row) => {
      const pattern = row.pattern || '';
      return pattern.length > 80 ? pattern.substring(0, 80) + '...' : pattern;
    }},
    { header: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
          <button onClick={() => handleDelete(row.id)} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Block Keywords"
        columns={columns}
        data={data}
        headerActions={
          <button onClick={openAdd} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Keyword</button>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Keyword' : 'Add Keyword'}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>Type</label>
            <select name="type" value={form.type} onChange={handleChange} required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">Select Type</option>
              <option value="offensive-word">Offensive Word</option>
              <option value="phone-number">Phone Number</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
            </select>
          </div>
          <FormInput label="Pattern" name="pattern" value={form.pattern} onChange={handleChange} required placeholder="Enter pattern or keyword" />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{editData ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BlockKeywords;
