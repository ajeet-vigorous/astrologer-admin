import React, { useState, useEffect, useCallback } from 'react';
import { rechargeApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { IndianRupee, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Recharge = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ amount: '', amount_usd: '', cashback: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rechargeApi.getAll({ page });
      setData(res.data.rechargeAmount || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const numbersOnly = (value) => value === '' || /^\d*\.?\d*$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await rechargeApi.edit({ filed_id: editData.id, amount: form.amount, amount_usd: form.amount_usd, cashback: form.cashback });
      } else {
        await rechargeApi.add(form);
      }
      setShowModal(false);
      setEditData(null);
      setForm({ amount: '', amount_usd: '', cashback: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (row) => {
    setEditData(row);
    setForm({ amount: row.amount || '', amount_usd: row.amount_usd || '', cashback: row.cashback || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This recharge amount will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await rechargeApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const totalPages = pagination.totalPages;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <IndianRupee size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Recharge Amounts</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm({ amount: '', amount_usd: '', cashback: '' }); setShowModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Amount
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading recharge amounts..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount (INR)</th>
                  <th>Amount (USD)</th>
                  <th>Cashback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No recharge amounts found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td className="cust-name-cell">{row.amount ? `\u20B9${row.amount}` : '---'}</td>
                    <td>{row.amount_usd ? `$${row.amount_usd}` : '---'}</td>
                    <td>
                      {row.cashback ? (
                        <span className="cust-verify-badge verified">{row.cashback}%</span>
                      ) : '---'}
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => handleEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(row.id)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Recharge Amount' : 'Add Recharge Amount'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Amount (INR) *</label>
            <input type="text" value={form.amount} onChange={e => numbersOnly(e.target.value) && setForm({ ...form, amount: e.target.value })} required placeholder="Enter INR amount" />
          </div>
          <div className="cust-form-group">
            <label>Amount (USD) *</label>
            <input type="text" value={form.amount_usd} onChange={e => numbersOnly(e.target.value) && setForm({ ...form, amount_usd: e.target.value })} required placeholder="Enter USD amount" />
          </div>
          <div className="cust-form-group">
            <label>Cashback (in %)</label>
            <input type="text" value={form.cashback} onChange={e => numbersOnly(e.target.value) && setForm({ ...form, cashback: e.target.value })} placeholder="Enter cashback percentage" />
          </div>
          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
            {editData ? 'Update' : 'Add'} Recharge Amount
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Recharge;
