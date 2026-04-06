import React, { useState, useEffect } from 'react';
import { horoscopeApi, horoscopeSignApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Horoscope = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signs, setSigns] = useState([]);
  const [signFilter, setSignFilter] = useState('');
  const [form, setForm] = useState({ horoScopeSignId: '', horoscopeType: '', title: '', description: '', fromDate: '', toDate: '' });

  const horoscopeTypes = [{ value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly' }];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, search };
      if (signFilter) params.horoScopeSignId = signFilter;
      const res = await horoscopeApi.getAll(params);
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchSigns = async () => { try { const res = await horoscopeSignApi.getAll({ page: 1, limit: 1000 }); setSigns(res.data.data || []); } catch (err) { console.error(err); } };

  useEffect(() => { fetchData(); }, [page, search, signFilter]);
  useEffect(() => { fetchSigns(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setEditData(null); setForm({ horoScopeSignId: '', horoscopeType: '', title: '', description: '', fromDate: '', toDate: '' }); setShowModal(true); };

  const openEdit = (row) => {
    setEditData(row);
    setForm({ horoScopeSignId: row.horoScopeSignId || '', horoscopeType: row.horoscopeType || '', title: row.title || '', description: row.description || '', fromDate: row.fromDate ? row.fromDate.substring(0, 10) : '', toDate: row.toDate ? row.toDate.substring(0, 10) : '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) { await horoscopeApi.edit({ ...form, id: editData.id }); }
      else { await horoscopeApi.add(form); }
      setShowModal(false); fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This horoscope will be deleted!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7c3aed', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, Delete' });
    if (result.isConfirmed) {
      try { await horoscopeApi.delete({ id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (err) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const renderPagination = () => {
    if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Page {page} of {pagination.totalPages}</span>
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
          <Star size={25} color="#7c3aed" />
          <div><h2 className="cust-title">Horoscope</h2></div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={openAdd} className="cust-btn cust-btn-primary"><Plus size={15} /> Add</button>
        </div>
      </div>

      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="cust-input cust-search-input" />
            {search && <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear"><X size={13} /></button>}
          </div>
        </div>
        <div className="cust-filter-group">
          <label className="cust-filter-label">Sign</label>
          <select value={signFilter} onChange={e => { setSignFilter(e.target.value); setPage(1); }} className="cust-input" style={{ width: 160 }}>
            <option value="">All Signs</option>
            {signs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading horoscopes..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Sign</th><th>Type</th><th>Title</th><th>From</th><th>To</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7} className="cust-no-data">No horoscopes found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td className="cust-name-cell">{row.signName || row.horoscopeSign?.name || '-'}</td>
                    <td><span className="cust-req-badge purple">{row.horoscopeType}</span></td>
                    <td>{row.title || '-'}</td>
                    <td className="cust-date-cell">{row.fromDate ? new Date(row.fromDate).toLocaleDateString() : '-'}</td>
                    <td className="cust-date-cell">{row.toDate ? new Date(row.toDate).toLocaleDateString() : '-'}</td>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Horoscope' : 'Add Horoscope'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Sign *</label>
            <select name="horoScopeSignId" value={form.horoScopeSignId} onChange={handleChange} required>
              <option value="">Select Sign</option>
              {signs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="cust-form-group">
            <label>Type *</label>
            <select name="horoscopeType" value={form.horoscopeType} onChange={handleChange} required>
              <option value="">Select Type</option>
              {horoscopeTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="cust-form-group"><label>Title *</label><input name="title" value={form.title} onChange={handleChange} required placeholder="Enter title" /></div>
          <div className="cust-form-group"><label>Description *</label><textarea name="description" value={form.description} onChange={handleChange} required placeholder="Enter description" rows={4} /></div>
          <div className="cust-form-row">
            <div className="cust-form-group"><label>From Date *</label><input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required /></div>
            <div className="cust-form-group"><label>To Date *</label><input type="date" name="toDate" value={form.toDate} onChange={handleChange} required /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editData ? 'Update' : 'Add'} Horoscope</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Horoscope;
