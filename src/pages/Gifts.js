import React, { useState, useEffect } from 'react';
import { giftApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', amountDollar: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await giftApi.getAll({ page });
      setGifts(res.data.gifts || []);
      setPagination({
        totalPages: res.data.totalPages, totalRecords: res.data.totalRecords,
        start: res.data.start, end: res.data.end, page: res.data.page
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageData = form.image || '';
      if (imageFile) imageData = await fileToBase64(imageFile);
      if (editData) { await giftApi.edit({ filed_id: editData.id, name: form.name, amount: form.amount, amountDollar: form.amountDollar, image: imageData }); }
      else { await giftApi.add({ name: form.name, amount: form.amount, amountDollar: form.amountDollar, image: imageData }); }
      setShowModal(false); setEditData(null); setForm({ name: '', amount: '', amountDollar: '', image: '' }); setImageFile(null); fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (gift) => { setEditData(gift); setForm({ name: gift.name, amount: gift.amount, amountDollar: gift.amountDollar || '', image: gift.image || '' }); setImageFile(null); setShowModal(true); };
  const handleStatusToggle = async (id) => { try { await giftApi.status({ status_id: id }); fetchData(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This gift will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try { await giftApi.delete({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map(p => <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>)}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Gift size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Gifts</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm({ name: '', amount: '', amountDollar: '', image: '' }); setImageFile(null); setShowModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Gift
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading gifts..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Image</th><th>Name</th><th>INR</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {gifts.length === 0 ? (
                  <tr><td colSpan={7} className="cust-no-data">No gifts found.</td></tr>
                ) : gifts.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      {row.image ? (
                        <img src={row.image} alt={row.name} className="cust-avatar" style={{ borderRadius: 6 }} />
                      ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>No image</span>}
                    </td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td>&#8377;{row.amount || 0}</td>
                    <td>
                      <span onClick={() => handleStatusToggle(row.id)} className={`cust-verify-badge ${row.isActive ? 'verified' : 'unverified'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Gift' : 'Add Gift'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Gift Name *</label>
            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="cust-form-group">
            <label>INR Amount *</label>
            <input type="number" name="amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="cust-form-group">
            <label>USD Amount *</label>
            <input type="number" name="amountDollar" value={form.amountDollar} onChange={e => setForm({ ...form, amountDollar: e.target.value })} required />
          </div>
          <div className="cust-form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
          </div>
          {editData && editData.image && !imageFile && (
            <div style={{ marginBottom: 12 }}>
              <img src={editData.image} alt="Current" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0' }} />
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>Current image</p>
            </div>
          )}
          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editData ? 'Update' : 'Add'} Gift</button>
        </form>
      </Modal>
    </div>
  );
};

export default Gifts;
