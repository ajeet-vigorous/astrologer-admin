import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../api/services';
import Loader from '../components/Loader';
import { Eye, Pencil, Trash2, Plus, Wallet, FileText, FileSpreadsheet, X, ChevronLeft, ChevronRight, AlertTriangle, Users, Search, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [rechargeCustomer, setRechargeCustomer] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [form, setForm] = useState({
    name: '', contactNo: '', email: '', gender: '', birthDate: '', birthTime: '',
    birthPlace: '', addressLine1: '', location: '', pincode: '', countryCode: '', country: '', password: '', profile: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await customerApi.getAll(params);
      setCustomers(res.data.customers || []);
      setPagination({
        totalPages: res.data.totalPages, totalRecords: res.data.totalRecords,
        start: res.data.start, end: res.data.end, page: res.data.page
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, dateApplied]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const emptyForm = {
    name: '', contactNo: '', email: '', gender: '', birthDate: '', birthTime: '',
    birthPlace: '', addressLine1: '', location: '', pincode: '', countryCode: '', country: '', password: '', profile: ''
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profile: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      let res;
      if (editData) {
        res = await customerApi.edit({ field_id: editData.id, ...form });
      } else {
        res = await customerApi.add(form);
      }
      if (res.data.error) {
        setErrors(res.data.error);
        setSubmitting(false);
        return;
      }
      setShowAddModal(false);
      setEditData(null);
      setForm(emptyForm);
      setImagePreview(null);
      fetchData();
    } catch (e) { alert(e.message); }
    setSubmitting(false);
  };

  const handleEdit = async (customer) => {
    try {
      const res = await customerApi.getEdit(customer.id);
      const c = res.data.customer || customer;
      setEditData(c);
      setForm({
        name: c.name || '', contactNo: c.contactNo || '', email: c.email || '',
        gender: c.gender || '', birthDate: c.birthDate ? c.birthDate.split('T')[0] : '',
        birthTime: c.birthTime || '', birthPlace: c.birthPlace || '',
        addressLine1: c.addressLine1 || '', location: c.location || '',
        pincode: c.pincode || '', countryCode: c.countryCode || '',
        country: c.country || '', password: '', profile: ''
      });
      setImagePreview(c.profile ? (c.profile.startsWith('http') ? c.profile : `/public/${c.profile}`) : null);
      setShowAddModal(true);
    } catch (e) {
      setEditData(customer);
      setShowAddModal(true);
    }
  };

  const handleDelete = async () => {
    try {
      await customerApi.delete({ del_id: deleteId });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleRechargeWallet = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customerApi.rechargeWallet({ userId: rechargeCustomer.id, amount: rechargeAmount });
      setShowRechargeModal(false);
      setRechargeCustomer(null);
      setRechargeAmount('');
      alert('Wallet recharged successfully!');
    } catch (e) { alert('Failed to recharge wallet'); }
    setSubmitting(false);
  };

  const handlePrint = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      const res = await customerApi.printPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      window.open(window.URL.createObjectURL(blob));
    } catch (e) { alert('Failed to generate PDF'); }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      const res = await customerApi.exportCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'customerList.csv';
      a.click();
    } catch (e) { alert('Failed to export CSV'); }
  };

  const handleDateSubmit = () => {
    setDateApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setFromDate(moment().toDate()); setToDate(moment().toDate()); setDateApplied(false); setPage(1);
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, '0');
    const mon = String(dt.getMonth() + 1).padStart(2, '0');
    const yr = dt.getFullYear();
    let hr = dt.getHours(); const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am';
    hr = hr % 12 || 12;
    return `${day}-${mon}-${yr} ${hr}:${min} ${ampm}`;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>
              {p}
            </button>
          ))}
          {pagination.totalPages > 15 && <span className="cust-page-dots">...</span>}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Users size={25} className="" color='#7c3aed' />
          <div>
            <h2 className="cust-title">Customers</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm(emptyForm); setImagePreview(null); setErrors({}); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> New
          </button>
          <button onClick={handlePrint} className="cust-btn cust-btn-danger">
            <FileText size={15} /> PDF
          </button>
          <button onClick={handleExport} className="cust-btn cust-btn-success">
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="cust-filterbar">
        
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
          <Search size={14} className="cust-search-icon" />
          <input type="text" placeholder="Search by name or contact..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
            className="cust-input cust-search-input" />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
              <X size={13} />
            </button>
          )}
          </div>
        </div>
        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">From</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={fromDate}
                onChange={date => { setFromDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={toDate}
                onChange={date => { setToDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-actions">
            <button onClick={handleDateSubmit} className="cust-btn cust-btn-primary">
              <Search size={13} /> Apply
            </button>
            {(search || dateApplied) && (
              <button onClick={clearFilters} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cust-card">

        {/* Table */}
        {loading ? <Loader text="Loading customers..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact No</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="cust-no-data">No customers found.</td></tr>
                ) : customers.map((c, i) => (
                  <tr key={c.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      <img
                        src={c.profile ? (c.profile.startsWith('http') ? c.profile : `/public/${c.profile}`) : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>'}
                        alt="" className="cust-avatar"
                        onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>'; }}
                      />
                    </td>
                    <td className="cust-name-cell">{c.name}</td>
                    <td>{c.countryCode ? `${c.countryCode} ` : ''}{c.contactNo}</td>
                    <td className="cust-date-cell">{formatDateTime(c.created_at)}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => navigate(`/admin/customers/${c.id}`)} className="cust-action-btn cust-action-view" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleEdit(c)} className="cust-action-btn cust-action-edit" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => { setRechargeCustomer(c); setRechargeAmount(''); setShowRechargeModal(true); }} className="cust-action-btn cust-action-recharge" title="Recharge Wallet">
                          <Wallet size={15} />
                        </button>
                        <button onClick={() => { setDeleteId(c.id); setShowDeleteModal(true); }} className="cust-action-btn cust-action-delete" title="Delete">
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

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>{editData ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowAddModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Name *</label>
                <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                {errors.name && <span className="cust-err">{errors.name[0]}</span>}
              </div>
              <div className="cust-form-row" style={{ gridTemplateColumns: '80px 1fr' }}>
                <div className="cust-form-group">
                  <label>Code</label>
                  <input name="countryCode" placeholder="+91" value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} />
                </div>
                <div className="cust-form-group">
                  <label>Contact No *</label>
                  <input name="contactNo" value={form.contactNo} onChange={e => setForm({ ...form, contactNo: e.target.value })} required maxLength={10} />
                  {errors.contactNo && <span className="cust-err">{errors.contactNo[0]}</span>}
                </div>
              </div>
              <div className="cust-form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <span className="cust-err">{errors.email[0]}</span>}
              </div>
              <div className="cust-form-group">
                <label>Password {editData ? '(leave blank to keep)' : ''}</label>
                <input type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="cust-form-row">
                <div className="cust-form-group">
                  <label>Birth Date</label>
                  <input type="date" name="birthDate" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div className="cust-form-group">
                  <label>Birth Time</label>
                  <input type="time" name="birthTime" value={form.birthTime} onChange={e => setForm({ ...form, birthTime: e.target.value })} />
                </div>
              </div>
              <div className="cust-form-group">
                <label>Birth Place</label>
                <input name="birthPlace" value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} />
              </div>
              <div className="cust-form-group">
                <label>Current Address</label>
                <textarea name="addressLine1" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} rows={3} />
              </div>
              <div className="cust-form-row">
                <div className="cust-form-group">
                  <label>City</label>
                  <input name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="cust-form-group">
                  <label>Pin Code</label>
                  <input name="pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} maxLength={6} />
                </div>
              </div>
              <div className="cust-form-row">
                <div className="cust-form-group">
                  <label>Gender *</label>
                  <select name="gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div className="cust-form-group">
                  <label>Country</label>
                  <input name="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
              <div className="cust-form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="cust-img-preview" />}
              </div>
              <button type="submit" disabled={submitting} className="cust-btn cust-btn-primary cust-btn-full">
                {submitting ? 'Saving...' : (editData ? 'Update Customer' : 'Add Customer')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="cust-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-delete-content">
              <div className="cust-delete-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>Are you sure?</h3>
              <p>This customer will be deleted.</p>
              <div className="cust-delete-actions">
                <button onClick={() => setShowDeleteModal(false)} className="cust-btn cust-btn-ghost">Cancel</button>
                <button onClick={handleDelete} className="cust-btn cust-btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && rechargeCustomer && (
        <div className="cust-overlay" onClick={() => setShowRechargeModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Recharge Wallet</h3>
              <button onClick={() => setShowRechargeModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleRechargeWallet} className="cust-modal-body">
              <div className="cust-recharge-user">
                <Wallet size={18} />
                <div>
                  <strong>{rechargeCustomer.name}</strong>
                  <span>{rechargeCustomer.contactNo}</span>
                </div>
              </div>
              <div className="cust-form-group">
                <label>Amount *</label>
                <input type="number" min="1" placeholder="Enter amount" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} required />
              </div>
              <button type="submit" disabled={submitting} className="cust-btn cust-btn-warning cust-btn-full">
                {submitting ? 'Processing...' : 'Recharge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
