import React, { useState, useEffect, useCallback } from 'react';
import { pujaPackageApi } from '../api/services';
import Loader from '../components/Loader';
import { HandHeart, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const PujaFaq = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pujaPackageApi.getFaqList({ page });
      setData(res.data.Pujafaq || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await pujaPackageApi.deleteFaq({ faq_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete FAQ', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
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

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-start');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('dots-end');
      pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={idx} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Puja FAQ's</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ title: '', description: '' }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Puja FAQ
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading puja FAQs..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={4} className="cust-no-data">No puja FAQs found.</td></tr>
                ) : data.map((faq, i) => (
                  <tr key={faq.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td className="cust-name-cell">{faq.title}</td>
                    <td title={faq.description}>{truncate(faq.description)}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEdit(faq)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(faq.id)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Puja FAQ</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Question <span className="af-req">*</span></label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Enter question" />
                </div>
                <div className="cust-form-group">
                  <label>Answer <span className="af-req">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required placeholder="Enter answer" />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add Puja FAQ</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Puja FAQ</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Question <span className="af-req">*</span></label>
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required placeholder="Enter question" />
                </div>
                <div className="cust-form-group">
                  <label>Answer <span className="af-req">*</span></label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} required placeholder="Enter answer" />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaFaq;
