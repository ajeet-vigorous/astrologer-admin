import React, { useState, useEffect } from 'react';
import { Wallet, Pencil, X } from 'lucide-react';
import Loader from '../components/Loader';
import { withdrawalApi } from '../api/services';
import '../styles/Customers.css';

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
    if (!editName.trim()) {
      alert('Please enter method name');
      return;
    }
    try {
      await withdrawalApi.methodEdit({ filed_id: editId, name: editName });
      setEditModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Wallet size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Withdrawal Methods</h2>
            <div className="cust-count">{methods.length} total</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader text="Loading methods..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Method Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 ? (
                  <tr><td colSpan={4} className="cust-no-data">No withdrawal methods found.</td></tr>
                ) : methods.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td className="cust-name-cell">{row.method_name || '-'}</td>
                    <td>
                      <div className="cust-toggle-wrap">
                        <div className={`cust-toggle ${row.isActive == 1 ? 'on' : ''}`} onClick={() => handleStatusToggle(row.id)}>
                          <div className="cust-toggle-knob" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => { setEditId(row.id); setEditName(row.method_name || ''); setEditModal(true); }}
                          className="cust-action-btn cust-action-edit" title="Edit">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="cust-overlay" onClick={() => setEditModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Method</h3>
              <button onClick={() => setEditModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Method Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Enter method name" />
              </div>
              <div className="cust-form-row">
                <button onClick={() => setEditModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Cancel</button>
                <button onClick={handleEdit} className="cust-btn cust-btn-primary cust-btn-full">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalMethods;
