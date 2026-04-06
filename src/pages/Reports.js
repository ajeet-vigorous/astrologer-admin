import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/services';
import Loader from '../components/Loader';
import { FileText, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Reports = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    reportImage: null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page, search });
      const d = res.data.data || res.data.reports || res.data.result || [];
      setData(Array.isArray(d) ? d : []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching report types:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleChange = (e) => {
    if (e.target.name === 'reportImage') {
      setForm({ ...form, reportImage: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ title: '', reportImage: null });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      title: row.title || '',
      reportImage: null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      if (form.reportImage) formData.append('reportImage', form.reportImage);
      if (editData) {
        formData.append('id', editData.id);
        await reportApi.edit(formData);
      } else {
        await reportApi.add(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving report type:', err);
    }
  };

  const handleStatusToggle = async (row) => {
    try {
      await reportApi.status({ id: row.id, status: row.status === 1 ? 0 : 1 });
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This report type will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await reportApi.delete({ del_id: id });
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
          Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.totalRecords || 0)} of {pagination.totalRecords || 0}
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
          <FileText size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Report Types</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords || 0} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={openAdd} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Report Type
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading report types..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No report types found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{((page - 1) * 10) + i + 1}</td>
                    <td className="cust-name-cell">{row.title}</td>
                    <td>
                      {row.reportImage ? (
                        <img src={row.reportImage} alt={row.title} className="cust-avatar" />
                      ) : '-'}
                    </td>
                    <td>
                      <span
                        onClick={() => handleStatusToggle(row)}
                        className={`cust-verify-badge ${row.status === 1 ? 'verified' : 'unverified'}`}
                      >
                        {row.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEdit(row)} className="cust-action-btn cust-action-edit" title="Edit">
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
              <h3>{editData ? 'Edit Report Type' : 'Add Report Type'}</h3>
              <button onClick={() => setShowModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Enter title" />
              </div>
              <div className="cust-form-group">
                <label>Report Image</label>
                <input type="file" name="reportImage" onChange={handleChange} accept="image/*" />
              </div>
              {editData && editData.reportImage && (
                <div className="cust-form-group">
                  <label>Current Image</label>
                  <img src={editData.reportImage} alt="current" className="cust-img-preview" />
                </div>
              )}
              <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
                {editData ? 'Update' : 'Add'} Report Type
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
