import React, { useState, useEffect, useCallback } from 'react';
import { webHomeFaqApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { CircleHelp, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

const WebHomeFaq = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await webHomeFaqApi.getAll({ page });
      setData(res.data.webfaq || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await webHomeFaqApi.add(form);
      setShowAddModal(false);
      setForm({ title: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await webHomeFaqApi.edit(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    });
    if (result.isConfirmed) {
      try {
        await webHomeFaqApi.delete({ faq_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const truncate = (str, words = 10) => {
    if (!str) return '--';
    const arr = str.split(' ');
    return arr.length > words ? arr.slice(0, words).join(' ') + '...' : str;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const current = page;
    let pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('dots-start');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('dots-end');
      pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === current ? 'active' : ''}`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <CircleHelp size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Website FAQ's</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ title: '', description: '' }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Website Faqs
          </button>
        </div>
      </div>

      {/* Card + Table */}
      <div className="cust-card">
        {loading ? <Loader text="Loading FAQs..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={4} className="cust-no-data">No FAQs found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td className="cust-name-cell">{row.title}</td>
                    <td title={row.description}>{truncate(row.description)}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => { setEditForm({ filed_id: row.id, title: row.title, description: row.description || '' }); setShowEditModal(true); }} className="cust-action-btn cust-action-edit" title="Edit">
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

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Website Faqs</h3>
              <button onClick={() => setShowAddModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Add Title" />
              </div>
              <div className="cust-form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={4} />
              </div>
              <button type="submit" disabled={submitting} className="cust-btn cust-btn-primary cust-btn-full">
                {submitting ? 'Saving...' : 'Add Website Faqs'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Website Faqs</h3>
              <button onClick={() => setShowEditModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Title *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="cust-form-group">
                <label>Description *</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required rows={4} />
              </div>
              <button type="submit" disabled={submitting} className="cust-btn cust-btn-primary cust-btn-full">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebHomeFaq;
