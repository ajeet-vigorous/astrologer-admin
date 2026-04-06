import React, { useState, useEffect } from 'react';
import { notificationApi } from '../api/services';
import Loader from '../components/Loader';
import { Bell, Pencil, Send, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Notifications = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendData, setSendData] = useState(null);
  const [sendRole, setSendRole] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const emptyForm = { title: '', description: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll({ page });
      const d = res.data || {};
      setData(d.notifications || []);
      setUsers(d.users || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await notificationApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await notificationApi.edit({
        filed_id: editForm.filed_id,
        title: editForm.title,
        description: editForm.description
      });
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatusToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Change status of this notification?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await notificationApi.status({ status_id: id });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const openEdit = (row) => {
    setEditForm({ filed_id: row.id, title: row.title || '', description: row.description || '' });
    setShowEditModal(true);
  };

  const openSend = (row) => {
    setSendData(row);
    setSendRole('All');
    setSelectedUserIds([]);
    setUserSearch('');
    setShowSendModal(true);
  };

  const handleSend = async () => {
    try {
      const payload = { notification_id: sendData.id };
      if (sendRole === 'User') payload.role = 'User';
      else if (sendRole === 'Astrologer') payload.role = 'Astrologer';
      else if (sendRole === 'UserNeverRecharged') payload.role = 'UserNeverRecharged';
      else if (sendRole === 'UserNotUsedFreeChat') payload.role = 'UserNotUsedFreeChat';
      else if (sendRole === 'Specific' && selectedUserIds.length > 0) payload.userIds = selectedUserIds;
      await notificationApi.send(payload);
      Swal.fire({ title: 'Sent!', text: 'Notification sent successfully!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
      setShowSendModal(false);
      setSendData(null);
    } catch (err) {
      Swal.fire({ title: 'Error!', text: 'Failed to send: ' + err.message, icon: 'error', confirmButtonColor: '#7c3aed' });
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    return (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.contactNo || '').includes(userSearch);
  });

  const truncate = (text, len = 80) => {
    if (!text) return '--';
    return text.length > len ? text.substring(0, len) + '...' : text;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {startPage > 1 && (
            <>
              <button onClick={() => setPage(1)} className={`cust-page-btn ${page === 1 ? 'active' : ''}`}>1</button>
              {startPage > 2 && <span className="cust-page-dots">...</span>}
            </>
          )}
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="cust-page-dots">...</span>}
              <button onClick={() => setPage(totalPages)} className={`cust-page-btn ${page === totalPages ? 'active' : ''}`}>{totalPages}</button>
            </>
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  const renderForm = (f, setF, onSubmit, btnText) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-group">
        <label>Title <span style={{ color: 'red' }}>*</span></label>
        <input type="text" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required placeholder="Notification Title" />
      </div>
      <div className="cust-form-group">
        <label>Description <span style={{ color: 'red' }}>*</span></label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} required placeholder="Notification description..." rows={4} />
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Bell size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Notifications</h2>
            <div className="cust-count">{totalRecords} total</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Notification
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? (
          <Loader text="Loading notifications..." />
        ) : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No Data Available</td></tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{(page - 1) * 15 + index + 1}</td>
                      <td className="cust-name-cell">{row.title || '--'}</td>
                      <td title={row.description}>{truncate(row.description)}</td>
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
                          <button onClick={() => openEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => openSend(row)} className="cust-action-btn cust-action-view" title="Send"><Send size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Add Notification Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Notification</h3>
              <button onClick={() => setShowAddModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add Notification')}
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Notification</h3>
              <button onClick={() => setShowEditModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, handleEdit, 'Save')}
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="cust-overlay" onClick={() => setShowSendModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Send Notification</h3>
              <button onClick={() => setShowSendModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Sending</label>
                <div className="cust-name-cell">{sendData?.title}</div>
              </div>
              <div className="cust-form-group">
                <label>Send To <span style={{ color: 'red' }}>*</span></label>
                <select value={sendRole} onChange={e => setSendRole(e.target.value)}>
                  <option value="All">All</option>
                  <option value="User">User</option>
                  <option value="Astrologer">Astrologer</option>
                  <option value="UserNeverRecharged">User Never Recharged</option>
                  <option value="UserNotUsedFreeChat">User Not Used Free Chat/Call</option>
                  <option value="Specific">Specific Users</option>
                </select>
              </div>

              {sendRole === 'Specific' && (
                <div className="cust-form-group">
                  <label>Select Users</label>
                  <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." style={{ marginBottom: 8 }} />
                  <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, background: '#f8fafc' }}>
                    {filteredUsers.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', margin: '12px 0' }}>No users found</p>
                    ) : (
                      filteredUsers.map(u => (
                        <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}>
                          <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                          <span>{u.name || 'Unknown'} {u.contactNo ? `(${u.contactNo})` : ''}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedUserIds.length > 0 && (
                    <span className="cust-err" style={{ color: '#7c3aed' }}>{selectedUserIds.length} user(s) selected</span>
                  )}
                </div>
              )}

              <button onClick={handleSend} className="cust-btn cust-btn-success cust-btn-full">
                <Send size={15} /> Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
