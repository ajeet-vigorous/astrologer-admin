import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { courseApi } from '../api/services';

const CourseList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const emptyForm = { name: '', description: '', course_category_id: '', course_badge: '', course_price: '', course_price_usd: '', image: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getList({ page });
      const d = res.data || {};
      setData(d.courses || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    courseApi.getCategories({ page: 1 }).then(res => setCategories(res.data.categories || [])).catch(console.error);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await courseApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await courseApi.edit(editForm);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await courseApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleStatus = async () => {
    try { await courseApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleImageChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) setEditForm(f => ({ ...f, image: reader.result }));
        else setForm(f => ({ ...f, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id, name: row.name || '', description: row.description || '',
      course_category_id: row.course_category_id || '', course_badge: row.course_badge || '',
      course_price: row.course_price || '', course_price_usd: row.course_price_usd || '',
      image: row.image || ''
    });
    setShowEditModal(true);
  };

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return '/' + img;
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
          <input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required style={styles.input} placeholder="Course Name" />
        </div>
        <div>
          <label style={styles.label}>Category</label>
          <select value={f.course_category_id} onChange={e => setF({ ...f, course_category_id: e.target.value })} style={styles.input}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Description</label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} style={{ ...styles.input, minHeight: 70 }} placeholder="Course description" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={styles.label}>Badge</label>
          <input type="text" value={f.course_badge} onChange={e => setF({ ...f, course_badge: e.target.value })} style={styles.input} placeholder="Badge" />
        </div>
        <div>
          <label style={styles.label}>Price (INR)</label>
          <input type="text" value={f.course_price} onChange={e => setF({ ...f, course_price: e.target.value })} style={styles.input} placeholder="₹0.00" />
        </div>
        <div>
          <label style={styles.label}>Price (USD)</label>
          <input type="text" value={f.course_price_usd} onChange={e => setF({ ...f, course_price_usd: e.target.value })} style={styles.input} placeholder="$0.00" />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Image</label>
        {isEdit && f.image && !f.image.startsWith('data:') && (
          <img src={getImgSrc(f.image)} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.image && f.image.startsWith('data:') && (
          <img src={f.image} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />
        )}
        <input type="file" accept="image/*" onChange={e => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" style={styles.addBtn}>{btnText}</button>
    </form>
  );

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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Courses</h2>
          <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} style={styles.addBtn}>Add Course</button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Image', 'Name', 'Category', 'Price (INR)', 'Price (USD)', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb' }}>
                        {row.image ? (
                          <img src={getImgSrc(row.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}><span style={{ fontWeight: 500 }}>{row.name || '--'}</span></td>
                    <td style={styles.td}>{row.category_name || '--'}</td>
                    <td style={styles.td}>{row.course_price ? `₹${Number(row.course_price).toFixed(2)}` : '--'}</td>
                    <td style={styles.td}>{row.course_price_usd ? `$${Number(row.course_price_usd).toFixed(2)}` : '--'}</td>
                    <td style={styles.td}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={() => { setStatusId(row.id); setShowStatusModal(true); }} />
                        <span style={{ color: row.isActive ? '#059669' : '#dc2626', fontWeight: 500, fontSize: 12 }}>{row.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(row)} style={styles.linkBtn}>Edit</button>
                        <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Course">
        {renderForm(form, setForm, handleAdd, 'Add Course', false)}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course">
        {renderForm(editForm, setEditForm, handleEdit, 'Save', true)}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Course">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are you sure?</p>
          <p style={{ color: '#6b7280', marginTop: 8 }}>This process cannot be undone.</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
          </div>
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

export default CourseList;
