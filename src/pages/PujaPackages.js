import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pujaPackageApi } from '../api/services';

const PujaPackages = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] });
  const [editForm, setEditForm] = useState({ id: null, title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] });

  const fetchData = useCallback(async () => {
    try {
      const res = await pujaPackageApi.getList({ page });
      setData(res.data.packeges || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
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

  const handleDelete = async () => {
    try {
      await pujaPackageApi.delete({ del_id: deleteId });
      setShowDeleteModal(false);
      fetchData();
    } catch (err) { console.error(err); }
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

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Title', render: (row) => <span style={{ fontWeight: 500 }}>{row.title}</span> },
    { header: 'Person', render: (row) => row.person },
    { header: 'Price (INR)', render: (row) => `₹${row.package_price}` },
    { header: 'Price (USD)', render: (row) => row.package_price_usd ? `$${row.package_price_usd}` : '--' },
    { header: 'Points', render: (row) => (row.description && Array.isArray(row.description)) ? row.description.length + ' points' : '0 points' },
    {
      header: 'Status', render: (row) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!row.package_status} onChange={() => handleStatus(row.id)} />
          <span>{row.package_status ? 'Active' : 'Inactive'}</span>
        </label>
      )
    },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openEdit(row)} style={styles.linkBtn}>Edit</button>
          <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
        </div>
      )
    }
  ];

  const renderForm = (f, setF, isEdit, onSubmit) => (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormInput label="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required placeholder="Package title" />
        <FormInput label="Person" type="number" value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })} required placeholder="Person" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
        <FormInput label="Price (INR)" value={f.package_price} onChange={(e) => setF({ ...f, package_price: e.target.value })} required placeholder="Price" />
        <FormInput label="USD Price" value={f.package_price_usd} onChange={(e) => setF({ ...f, package_price_usd: e.target.value })} placeholder="USD Price" />
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>Package Points</label>
          <button type="button" onClick={() => addPoint(isEdit)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>+ Add Point</button>
        </div>
        {f.package_points.map((pt, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <textarea value={pt} onChange={(e) => updatePoint(idx, e.target.value, isEdit)}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minHeight: 50 }}
              placeholder="Enter package point" required />
            {f.package_points.length > 1 && (
              <button type="button" onClick={() => removePoint(idx, isEdit)}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>X</button>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>{isEdit ? 'Update Package' : 'Add Package'}</button></div>
    </form>
  );

  return (
    <div>
      <DataTable title="Puja Packages" columns={columns} data={data} pagination={pagination} onPageChange={setPage}
        headerActions={<button onClick={() => { setForm({ title: '', person: '', package_price: '', package_price_usd: '', package_points: [''] }); setShowAddModal(true); }} style={styles.addBtn}>Add Package</button>}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Package">
        {renderForm(form, setForm, false, handleAdd)}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Package">
        {renderForm(editForm, setEditForm, true, handleEdit)}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Package">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are you sure?</p>
          <p style={{ color: '#6b7280' }}>This process cannot be undone.</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }
};

export default PujaPackages;
