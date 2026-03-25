import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../api/services';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [userdatas, setUserdatas] = useState([]);
  const [rechargeForm, setRechargeForm] = useState({ userId: '', amount: '' });
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
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await customerApi.getAll(params);
      setCustomers(res.data.customers || []);
      setUserdatas(res.data.userdatas || []);
      setPagination({
        totalPages: res.data.totalPages, totalRecords: res.data.totalRecords,
        start: res.data.start, end: res.data.end, page: res.data.page
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, fromDate, toDate]);

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
      await customerApi.rechargeWallet(rechargeForm);
      setShowRechargeModal(false);
      setRechargeForm({ userId: '', amount: '' });
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

  const clearFilters = () => {
    setSearch(''); setFromDate(''); setToDate(''); setPage(1);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
        <span style={{ fontSize: 13, color: '#666' }}>
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
            style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, cursor: page <= 1 ? 'default' : 'pointer', background: '#fff', fontSize: 12, opacity: page <= 1 ? 0.5 : 1 }}>
            Previous
          </button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: p === page ? '#7c3aed' : '#fff', color: p === page ? '#fff' : '#333', fontSize: 12, fontWeight: p === page ? 600 : 400 }}>
              {p}
            </button>
          ))}
          {pagination.totalPages > 15 && <span style={{ padding: '6px 4px' }}>...</span>}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
            style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, cursor: page >= pagination.totalPages ? 'default' : 'pointer', background: '#fff', fontSize: 12, opacity: page >= pagination.totalPages ? 0.5 : 1 }}>
            Next
          </button>
        </div>
      </div>
    );
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#555' };
  const btnPrimary = { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Customers</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowRechargeModal(true)} style={{ ...btnPrimary, background: '#d97706' }}>
              Recharge Wallet
            </button>
            <button onClick={() => { setEditData(null); setForm(emptyForm); setImagePreview(null); setErrors({}); setShowAddModal(true); }} style={btnPrimary}>
              + Add Customer
            </button>
            <button onClick={handlePrint} style={{ ...btnPrimary, background: '#2563eb' }}>PDF</button>
            <button onClick={handleExport} style={{ ...btnPrimary, background: '#059669' }}>CSV</button>
          </div>
        </div>

        {/* Search + Date Filter - exact Laravel layout */}
        <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Search</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input type="text" placeholder="Search by name or contact..." value={search}
                onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
                style={{ ...inputStyle, flex: 1 }} />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
                  &times;
                </button>
              )}
            </div>
          </div>
          <div>
            <label style={labelStyle}>From Date</label>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>To Date</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} style={inputStyle} />
          </div>
          {(search || fromDate || toDate) && (
            <button onClick={clearFilters} style={{ ...btnPrimary, background: '#6b7280' }}>Clear All</button>
          )}
        </div>

        {/* Table - exact Laravel columns */}
        {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Profile</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Contact No</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Birth Date</th>
                  <th style={thStyle}>Birth Time</th>
                  <th style={thStyle}>Created At</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: '#999' }}>No customers found.</td></tr>
                ) : customers.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{(pagination?.start || 1) + i}</td>
                    <td style={tdStyle}>
                      <img
                        src={c.profile ? (c.profile.startsWith('http') ? c.profile : `/public/${c.profile}`) : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>'}
                        alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">?</text></svg>'; }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{c.name}</td>
                    <td style={tdStyle}>{c.countryCode ? `${c.countryCode} ` : ''}{c.contactNo}</td>
                    <td style={tdStyle}>{c.email || '-'}</td>
                    <td style={tdStyle}>{formatDate(c.birthDate)}</td>
                    <td style={tdStyle}>{c.birthTime || '-'}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{formatDateTime(c.created_at)}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => navigate(`/admin/customers/${c.id}`)}
                          style={{ background: '#059669', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          View
                        </button>
                        <button onClick={() => handleEdit(c)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          Edit
                        </button>
                        <button onClick={() => { setDeleteId(c.id); setShowDeleteModal(true); }}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          Delete
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

      {/* Add/Edit Customer Modal - exact Laravel fields */}
      {showAddModal && (
        <div style={overlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{editData ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 10 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                {errors.name && <span style={errStyle}>{errors.name[0]}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Code</label>
                  <input style={inputStyle} name="countryCode" placeholder="+91" value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Contact No *</label>
                  <input style={inputStyle} name="contactNo" value={form.contactNo} onChange={e => setForm({ ...form, contactNo: e.target.value })} required maxLength={10} />
                  {errors.contactNo && <span style={errStyle}>{errors.contactNo[0]}</span>}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <span style={errStyle}>{errors.email[0]}</span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Password {editData ? '(leave blank to keep)' : ''}</label>
                <input style={inputStyle} type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Birth Date</label>
                  <input style={inputStyle} type="date" name="birthDate" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Birth Time</label>
                  <input style={inputStyle} type="time" name="birthTime" value={form.birthTime} onChange={e => setForm({ ...form, birthTime: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Birth Place</label>
                <input style={inputStyle} name="birthPlace" value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Current Address</label>
                <textarea style={{ ...inputStyle, minHeight: 60 }} name="addressLine1" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Pin Code</label>
                  <input style={inputStyle} name="pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} maxLength={6} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Gender *</label>
                  <select style={inputStyle} name="gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} name="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13 }} />
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginTop: 8 }} />}
              </div>
              <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', padding: '10px 0', fontSize: 14, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Saving...' : (editData ? 'Update Customer' : 'Add Customer')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - exact Laravel */}
      {showDeleteModal && (
        <div style={overlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, color: '#f59e0b', marginBottom: 15 }}>&#9888;</div>
            <h3 style={{ margin: '0 0 10px' }}>Are you sure?</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>This customer will be deleted.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Wallet Modal - exact Laravel */}
      {showRechargeModal && (
        <div style={overlayStyle} onClick={() => setShowRechargeModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Add Money</h3>
              <button onClick={() => setShowRechargeModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>&times;</button>
            </div>
            <form onSubmit={handleRechargeWallet}>
              <div style={{ marginBottom: 15 }}>
                <label style={labelStyle}>Select User *</label>
                <select style={inputStyle} value={rechargeForm.userId} onChange={e => setRechargeForm({ ...rechargeForm, userId: e.target.value })} required>
                  <option value="">-- Select User --</option>
                  {userdatas.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.contactNo})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={labelStyle}>Amount *</label>
                <input style={inputStyle} type="number" min="1" value={rechargeForm.amount} onChange={e => setRechargeForm({ ...rechargeForm, amount: e.target.value })} required />
              </div>
              <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', padding: '10px 0', fontSize: 14, background: '#d97706' }}>
                {submitting ? 'Processing...' : 'Recharge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 13 };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: '#fff', borderRadius: 12, padding: 25, maxWidth: 550, width: '95%', maxHeight: '90vh', overflow: 'hidden' };
const errStyle = { color: '#dc2626', fontSize: 11, marginTop: 2, display: 'block' };

export default Customers;
