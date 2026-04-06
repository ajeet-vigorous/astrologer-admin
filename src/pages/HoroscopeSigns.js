import React, { useState, useEffect } from 'react';
import { horoscopeSignApi } from '../api/services';
import Loader from '../components/Loader';
import { Star, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const HoroscopeSigns = () => {
  const [signs, setSigns] = useState([]);
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
      const res = await horoscopeSignApi.getAll({ page });
      setSigns(res.data.signs || []);
      setPagination({
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
        start: res.data.start,
        end: res.data.end,
        page: res.data.page
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageData = '';
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      if (editData) {
        await horoscopeSignApi.edit({ filed_id: editData.id, name: form.name, image: imageData || undefined });
      } else {
        await horoscopeSignApi.add({ name: form.name, image: imageData });
      }
      setShowModal(false);
      setEditData(null);
      setForm({ name: '' });
      setImageFile(null);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (sign) => {
    setEditData(sign);
    setForm({ name: sign.name });
    setImageFile(null);
    setShowModal(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      await horoscopeSignApi.status({ status_id: id });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This horoscope sign will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await horoscopeSignApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (e) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = getPageNumbers();
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Star size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Horoscope Signs</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm({ name: '' }); setImageFile(null); setShowModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Sign
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading horoscope signs..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {signs.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No horoscope signs found.</td></tr>
                ) : signs.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td>
                      {row.image ? (
                        <img src={row.image} alt={row.name} className="cust-avatar" />
                      ) : (
                        <span className="cust-no-data">No Image</span>
                      )}
                    </td>
                    <td>
                      <span
                        onClick={() => handleStatusToggle(row.id)}
                        className={`cust-verify-badge ${row.isActive ? 'verified' : 'unverified'}`}
                      >
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => handleEdit(row)} className="cust-action-btn cust-action-edit" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="cust-action-btn cust-action-delete" title="Delete">
                          <Trash2 size={15} />
                        </button>
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

      {showModal && (
        <div className="cust-overlay" onClick={() => setShowModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>{editData ? 'Edit Horoscope Sign' : 'Add Horoscope Sign'}</h3>
              <button onClick={() => setShowModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Sign Name *</label>
                <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cust-form-group">
                <label>Image</label>
                <input type="file" name="image" onChange={e => setImageFile(e.target.files[0])} accept="image/*" />
              </div>
              {editData && editData.image && !imageFile && (
                <div className="cust-form-group">
                  <label>Current Image</label>
                  <img src={editData.image} alt="Current" className="cust-img-preview" />
                </div>
              )}
              <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
                {editData ? 'Update' : 'Add'} Sign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoroscopeSigns;
