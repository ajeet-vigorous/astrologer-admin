import React, { useState, useEffect } from 'react';
import { astrologerCategoryApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { Pencil, Plus, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

const AstrologerCategories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await astrologerCategoryApi.getAll({ page });
      setCategories(res.data.categories || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => resolve(r.result); r.onerror = reject; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageData = '';
      if (imageFile) imageData = await fileToBase64(imageFile);
      if (editData) { await astrologerCategoryApi.edit({ filed_id: editData.id, name: form.name, image: imageData || undefined }); }
      else { await astrologerCategoryApi.add({ name: form.name, image: imageData }); }
      setShowModal(false); setEditData(null); setForm({ name: '' }); setImageFile(null); fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (cat) => { setEditData(cat); setForm({ name: cat.name }); setImageFile(null); setShowModal(true); };
  const handleStatusToggle = async (id) => { try { await astrologerCategoryApi.status({ status_id: id }); fetchData(); } catch (e) { console.error(e); } };

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
          <LayoutGrid size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Astrologer Categories</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm({ name: '' }); setImageFile(null); setShowModal(true); }} className="cust-btn cust-btn-primary"><Plus size={15} /> Add Category</button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading categories..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Image</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No categories found.</td></tr>
                ) : categories.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>{row.image ? <img src={row.image} alt={row.name} className="cust-avatar" style={{ borderRadius: 6 }} /> : <span style={{ color: '#94a3b8', fontSize: 12 }}>No image</span>}</td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td><span onClick={() => handleStatusToggle(row.id)} className={`cust-verify-badge ${row.isActive ? 'verified' : 'unverified'}`}>{row.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="cust-actions"><button onClick={() => handleEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group"><label>Category Name *</label><input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="cust-form-group"><label>Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
          {editData && editData.image && !imageFile && (
            <div style={{ marginBottom: 12 }}><img src={editData.image} alt="Current" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0' }} /></div>
          )}
          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editData ? 'Update' : 'Add'} Category</button>
        </form>
      </Modal>
    </div>
  );
};

export default AstrologerCategories;
