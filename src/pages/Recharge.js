import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { rechargeApi } from '../api/services';

const Recharge = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ amount: '', amount_usd: '', cashback: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', amount: '', amount_usd: '', cashback: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await rechargeApi.getAll({ page });
      setData(res.data.rechargeAmount || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const numbersOnly = (value) => value === '' || /^\d*\.?\d*$/.test(value);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await rechargeApi.add(form); setShowAddModal(false); setForm({ amount: '', amount_usd: '', cashback: '' }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await rechargeApi.edit(editForm); setShowEditModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await rechargeApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Amount (INR)', render: (row) => <span style={{ fontWeight: 500 }}>{row.amount || '- - -'}</span> },
    { header: 'Amount (USD)', render: (row) => row.amount_usd || '- - -' },
    { header: 'Cashback', render: (row) => row.cashback ? row.cashback + '%' : '---' },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={() => { setEditForm({ filed_id: row.id, amount: row.amount || '', amount_usd: row.amount_usd || '', cashback: row.cashback || '' }); setShowEditModal(true); }} style={styles.linkBtn}>Edit</button>
          <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
        </div>
      )
    }
  ];

  const renderForm = (formData, setFormData, onSubmit, btnText) => (
    <form onSubmit={onSubmit} style={{ padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Amount (INR) *</label>
        <input type="text" value={formData.amount} onChange={e => numbersOnly(e.target.value) && setFormData({ ...formData, amount: e.target.value })} required style={styles.input} placeholder="Amount" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Amount (USD) *</label>
        <input type="text" value={formData.amount_usd} onChange={e => numbersOnly(e.target.value) && setFormData({ ...formData, amount_usd: e.target.value })} required style={styles.input} placeholder="Amount" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Cashback (in %)</label>
        <input type="text" value={formData.cashback} onChange={e => numbersOnly(e.target.value) && setFormData({ ...formData, cashback: e.target.value })} style={styles.input} placeholder="Cashback" />
      </div>
      <button type="submit" style={styles.addBtn}>{btnText}</button>
    </form>
  );

  return (
    <div>
      <DataTable title="Recharge Amount" columns={columns} data={data} pagination={pagination} onPageChange={setPage}
        headerActions={<button onClick={() => { setForm({ amount: '', amount_usd: '', cashback: '' }); setShowAddModal(true); }} style={styles.addBtn}>Add Amount</button>} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Recharge Amount">
        {renderForm(form, setForm, handleAdd, 'Add Recharge Amount')}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Recharge Amount">
        {renderForm(editForm, setEditForm, handleEdit, 'Update Recharge Amount')}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Recharge Amount">
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

export default Recharge;
