import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pujaSubCategoryApi } from '../api/services';

const PujaSubCategories = () => {
  const [data, setData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ categoriesId: '', name: '', image: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', categoriesId: '', name: '', image: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await pujaSubCategoryApi.getAll({ page });
      setData(res.data.categories || []);
      setAllCategories(res.data.AllCategories || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await pujaSubCategoryApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ categoriesId: '', name: '', image: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await pujaSubCategoryApi.edit(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try {
      await pujaSubCategoryApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEdit = (cat) => {
    setEditForm({ filed_id: cat.id, categoriesId: cat.category_id, name: cat.name, image: cat.image || '' });
    setShowEditModal(true);
  };

  const getImgSrc = (img) => {
    if (!img) return '/build/assets/images/default.jpg';
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Image', render: (row) => (
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
          <img src={getImgSrc(row.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
        </div>
      )
    },
    { header: 'Category Name', render: (row) => <span style={{ fontWeight: 500 }}>{row.category_name}</span> },
    { header: 'Name', render: (row) => <span style={{ fontWeight: 500 }}>{row.name}</span> },
    {
      header: 'Status', render: (row) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!row.isActive} onChange={() => handleStatus(row.id)} />
          <span>{row.isActive ? 'Active' : 'Inactive'}</span>
        </label>
      )
    },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openEdit(row)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
          <button onClick={async () => { if (!window.confirm('Delete "' + row.name + '"?')) return; try { await pujaSubCategoryApi.delete({ id: row.id }); fetchData(); } catch(e) { alert('Failed'); } }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Puja SubCategories"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button onClick={() => { setForm({ categoriesId: '', name: '', image: '' }); setShowAddModal(true); }} style={styles.addBtn}>Add Puja SubCategories</button>
        }
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Puja Category">
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category</label>
            <select value={form.categoriesId} onChange={(e) => setForm({ ...form, categoriesId: e.target.value })} style={styles.select} required>
              <option value="" disabled>--Select Category--</option>
              {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <FormInput label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>SubCategory Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} required />
            {form.image && <img src={form.image} alt="" style={{ width: 150, marginTop: 10 }} />}
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Add Sub Category</button></div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Puja Category">
        <form onSubmit={handleEdit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>Category</label>
            <select value={editForm.categoriesId} onChange={(e) => setEditForm({ ...editForm, categoriesId: e.target.value })} style={styles.select} required>
              <option value="" disabled>--Select Category--</option>
              {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <FormInput label="Name" name="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required placeholder="Name" />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>SubCategory Image</label>
            {editForm.image && <img src={editForm.image.startsWith('data:') ? editForm.image : getImgSrc(editForm.image)} alt="" style={{ width: 150, marginBottom: 10 }} onError={(e) => { e.target.style.display = 'none'; }} />}
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
          </div>
          <div style={{ marginTop: 15 }}><button type="submit" style={styles.addBtn}>Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }
};

export default PujaSubCategories;
