import React, { useState, useEffect, useCallback } from 'react';
import { pujaPackageApi } from '../api/services';
import Loader from '../components/Loader';
import { HandHeart, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const PujaPackages = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] });
  const [editForm, setEditForm] = useState({ id: null, title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pujaPackageApi.getList({ page });
      setData(res.data.packeges || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await pujaPackageApi.store(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await pujaPackageApi.update(editForm.id, editForm);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
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
        await pujaPackageApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete package', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const handleStatus = async (id) => {
    try {
      await pujaPackageApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEdit = (pkg) => {
    setEditForm({
      id: pkg.id, title: pkg.title, person: pkg.person,
      package_price: pkg.package_price, package_price_usd: pkg.package_price_usd || '',
      package_points: (pkg.description && Array.isArray(pkg.description) && pkg.description.length > 0) ? pkg.description : ['']
    });
    setShowEditModal(true);
  };

  const addPoint = (isEdit) => {
    if (isEdit) setEditForm(f => ({ ...f, package_points: [...f.package_points, ''] }));
    else setForm(f => ({ ...f, package_points: [...f.package_points, ''] }));
  };

  const removePoint = (idx, isEdit) => {
    if (isEdit) setEditForm(f => ({ ...f, package_points: f.package_points.filter((_, i) => i !== idx) }));
    else setForm(f => ({ ...f, package_points: f.package_points.filter((_, i) => i !== idx) }));
  };

  const updatePoint = (idx, val, isEdit) => {
    if (isEdit) {
      setEditForm(f => { const pts = [...f.package_points]; pts[idx] = val; return { ...f, package_points: pts }; });
    } else {
      setForm(f => { const pts = [...f.package_points]; pts[idx] = val; return { ...f, package_points: pts }; });
    }
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

  const renderForm = (f, setF, isEdit, onSubmit) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Title <span className="af-req">*</span></label>
          <input type="text" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required placeholder="Package title" />
        </div>
        <div className="cust-form-group">
          <label>Person <span className="af-req">*</span></label>
          <input type="number" value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })} required placeholder="Person" />
        </div>
      </div>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>Price (INR) <span className="af-req">*</span></label>
          <input type="text" value={f.package_price} onChange={(e) => setF({ ...f, package_price: e.target.value })} required placeholder="Price" />
        </div>
        <div className="cust-form-group">
          <label>USD Price</label>
          <input type="text" value={f.package_price_usd} onChange={(e) => setF({ ...f, package_price_usd: e.target.value })} placeholder="USD Price" />
        </div>
      </div>
      <div className="cust-form-group">
        <div className="cust-topbar">
          <label>Package Points</label>
          <button type="button" onClick={() => addPoint(isEdit)} className="cust-btn cust-btn-success">
            <Plus size={14} /> Add Point
          </button>
        </div>
        {f.package_points.map((pt, idx) => (
          <div key={idx} className="cust-form-group">
            <div className="cust-actions">
              <textarea value={pt} onChange={(e) => updatePoint(idx, e.target.value, isEdit)}
                placeholder="Enter package point" required rows={2} />
              {f.package_points.length > 1 && (
                <button type="button" onClick={() => removePoint(idx, isEdit)} className="cust-action-btn cust-action-delete"><X size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{isEdit ? 'Update Package' : 'Add Package'}</button>
    </form>
  );

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Puja Packages</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Package
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading puja packages..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Person</th>
                  <th>Price (INR)</th>
                  <th>Price (USD)</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="cust-no-data">No puja packages found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td className="cust-name-cell">{row.title}</td>
                    <td>{row.person}</td>
                    <td>{`₹${row.package_price}`}</td>
                    <td>{row.package_price_usd ? `$${row.package_price_usd}` : '--'}</td>
                    <td>{(row.description && Array.isArray(row.description)) ? row.description.length + ' points' : '0 points'}</td>
                    <td>
                      <div className="cust-toggle-wrap">
                        <div className={`cust-toggle ${row.package_status ? 'on' : ''}`} onClick={() => handleStatus(row.id)}>
                          <div className="cust-toggle-knob"></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Package</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, false, handleAdd)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Package</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, true, handleEdit)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaPackages;
