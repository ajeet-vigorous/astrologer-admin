import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { kundaliApi } from '../api/services';

const KundaliPrices = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ filed_id: '', price: '', price_usd: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await kundaliApi.getPrices({ page });
      setData(res.data.kundaliAmount || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (item) => {
    setEditForm({ filed_id: item.id, price: item.price || '', price_usd: item.price_usd || '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await kundaliApi.editAmount(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Kundali Type', render: (row) => <span style={{ fontWeight: 500 }}>{row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : '---'}</span> },
    { header: 'Amount (INR)', render: (row) => <span style={{ fontWeight: 500 }}>{row.price || '---'}</span> },
    { header: 'Amount (USD)', render: (row) => <span style={{ fontWeight: 500 }}>{row.price_usd || '---'}</span> },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => handleEdit(row)} style={styles.linkBtn}>Edit</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Kundali Amount"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Amount">
        <form onSubmit={handleEditSubmit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Amount (INR)</label>
            <input type="text" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
              placeholder="Amount" required style={styles.input} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Amount (USD)</label>
            <input type="text" value={editForm.price_usd} onChange={e => setEditForm({ ...editForm, price_usd: e.target.value })}
              placeholder="Amount" required style={styles.input} />
          </div>
          <button type="submit" style={styles.submitBtn}>Update Amount</button>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 },
  label: { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  submitBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginTop: 8 }
};

export default KundaliPrices;
