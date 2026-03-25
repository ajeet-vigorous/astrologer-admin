import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { withdrawalApi } from '../api/services';

const WithdrawalMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await withdrawalApi.getMethods();
      setMethods(res.data.methods || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusToggle = async (id) => {
    try {
      await withdrawalApi.methodStatus({ status_id: id });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleEdit = async () => {
    if (!editName.trim()) { alert('Please enter method name'); return; }
    try {
      await withdrawalApi.methodEdit({ filed_id: editId, name: editName });
      setEditModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: 42, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative',
      background: checked ? '#10b981' : '#d1d5db', transition: 'background 0.2s'
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
        top: 2, left: checked ? 22 : 2, transition: 'left 0.2s'
      }} />
    </div>
  );

  const columns = [
    { header: '#', render: (_, i) => i + 1 },
    { header: 'Method Name', render: (row) => row.method_name || '-' },
    {
      header: 'Status', render: (row) => (
        <ToggleSwitch checked={row.isActive == 1} onChange={() => handleStatusToggle(row.id)} />
      )
    },
    {
      header: 'Action', render: (row) => (
        <button onClick={() => { setEditId(row.id); setEditName(row.method_name || ''); setEditModal(true); }}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Withdrawal Methods"
        columns={columns}
        data={methods}
      />

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Method">
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 13, display: 'block', marginBottom: 4 }}>Method Name</label>
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setEditModal(false)} style={{ padding: '8px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleEdit} style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawalMethods;
