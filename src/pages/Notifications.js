import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { notificationApi } from '../api/services';

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
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

  const handleStatus = async () => {
    try { await notificationApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
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
      alert('Notification sent successfully!');
      setShowSendModal(false);
      setSendData(null);
    } catch (err) { alert('Failed to send: ' + err.message); }
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
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</div>
        <div style={styles.paginationButtons}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>Prev</button>
          {pages.map(p => (<button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}>Next</button>
        </div>
      </div>
    );
  };

  const renderForm = (f, setF, onSubmit, btnText) => (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Title <span style={{ color: 'red' }}>*</span></label>
        <input type="text" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required style={styles.input} placeholder="Notification Title" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Description <span style={{ color: 'red' }}>*</span></label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} required style={{ ...styles.input, minHeight: 100 }} placeholder="Notification description..." />
      </div>
      <button type="submit" style={styles.addBtn}>{btnText}</button>
    </form>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Notifications</h2>
          <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} style={styles.addBtn}>Add Notification</button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Title', 'Description', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}><span style={{ fontWeight: 500 }}>{row.title || '--'}</span></td>
                    <td style={{ ...styles.td, maxWidth: 300, whiteSpace: 'normal' }} title={row.description}>{truncate(row.description)}</td>
                    <td style={styles.td}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={() => { setStatusId(row.id); setShowStatusModal(true); }} />
                        <span style={{ color: row.isActive ? '#059669' : '#dc2626', fontWeight: 500, fontSize: 12 }}>{row.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(row)} style={styles.linkBtn}>Edit</button>
                        <button onClick={() => openSend(row)} style={{ ...styles.linkBtn, color: '#059669' }}>Send</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Notification">
        {renderForm(form, setForm, handleAdd, 'Add Notification')}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Notification">
        {renderForm(editForm, setEditForm, handleEdit, 'Save')}
      </Modal>

      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Notification">
        <div>
          <p style={{ marginBottom: 15, color: '#374151' }}>
            Sending: <strong>{sendData?.title}</strong>
          </p>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Send To <span style={{ color: 'red' }}>*</span></label>
            <select value={sendRole} onChange={e => setSendRole(e.target.value)} style={styles.input}>
              <option value="All">All</option>
              <option value="User">User</option>
              <option value="Astrologer">Astrologer</option>
              <option value="UserNeverRecharged">User Never Recharged</option>
              <option value="UserNotUsedFreeChat">User Not Used Free Chat/Call</option>
              <option value="Specific">Specific Users</option>
            </select>
          </div>

          {sendRole === 'Specific' && (
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Select Users</label>
              <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ ...styles.input, marginBottom: 8 }} placeholder="Search users..." />
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: 6, padding: 8 }}>
                {filteredUsers.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>No users found</p>
                ) : (
                  filteredUsers.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                      <span>{u.name || 'Unknown'} {u.contactNo ? `(${u.contactNo})` : ''}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedUserIds.length > 0 && (
                <p style={{ fontSize: 12, color: '#7c3aed', marginTop: 4 }}>{selectedUserIds.length} user(s) selected</p>
              )}
            </div>
          )}

          <button onClick={handleSend} style={{ ...styles.addBtn, width: '100%', background: '#059669' }}>Send Notification</button>
        </div>
      </Modal>

      {showStatusModal && (
        <div style={styles.overlay} onClick={() => setShowStatusModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Are You Sure?</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>You want to change the status?</p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={handleStatus} style={styles.addBtn}>Yes</button>
              <button onClick={() => setShowStatusModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  linkBtn: { background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 500, fontSize: 13 },
  label: { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#7c3aed', color: '#fff', padding: '12px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #6d28d9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  rowEven: { background: '#f8f9fa' },
  rowOdd: { background: '#fff' },
  noData: { padding: '40px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 15 },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 400, width: '90%' }
};

export default Notifications;
