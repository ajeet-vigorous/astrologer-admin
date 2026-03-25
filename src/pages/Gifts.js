import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import { giftApi } from '../api/services';

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', amountDollar: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await giftApi.getAll({ page });
      setGifts(res.data.gifts || []);
      setPagination({
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
        start: res.data.start,
        end: res.data.end,
        page: res.data.page
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageData = form.image || '';
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      if (editData) {
        await giftApi.edit({ filed_id: editData.id, name: form.name, amount: form.amount, amountDollar: form.amountDollar, image: imageData });
      } else {
        await giftApi.add({ name: form.name, amount: form.amount, amountDollar: form.amountDollar, image: imageData });
      }
      setShowModal(false);
      setEditData(null);
      setForm({ name: '', amount: '', amountDollar: '', image: '' });
      setImageFile(null);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (gift) => {
    setEditData(gift);
    setForm({ name: gift.name, amount: gift.amount, amountDollar: gift.amountDollar || '', image: gift.image || '' });
    setImageFile(null);
    setShowModal(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      await giftApi.status({ status_id: id });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gift?')) {
      try {
        await giftApi.delete({ del_id: id });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Name', key: 'name' },
    { header: 'INR Amount', render: (row) => '\u20B9' + (row.amount || 0) },
    { header: 'USD Amount', render: (row) => '$' + (row.amountDollar || 0) },
    {
      header: 'Image', render: (row) => row.image ? (
        <img src={row.image} alt={row.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
      ) : <span style={{ color: '#999', fontSize: 12 }}>No Image</span>
    },
    {
      header: 'Status', render: (row) => (
        <span onClick={() => handleStatusToggle(row.id)} style={{ cursor: 'pointer' }}>
          <StatusBadge active={row.isActive} />
        </span>
      )
    },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleEdit(row)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
          <button onClick={() => handleDelete(row.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Gifts"
        columns={columns}
        data={gifts}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button
            onClick={() => { setEditData(null); setForm({ name: '', amount: '', amountDollar: '', image: '' }); setImageFile(null); setShowModal(true); }}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}
          >
            + Add Gift
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Gift' : 'Add Gift'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Gift Name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="INR Amount" name="amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <FormInput label="USD Amount" name="amountDollar" type="number" value={form.amountDollar} onChange={e => setForm({ ...form, amountDollar: e.target.value })} required />
          <FormInput label="Image" name="image" type="file" onChange={e => setImageFile(e.target.files[0])} />
          {editData && editData.image && !imageFile && (
            <div style={{ marginBottom: 10 }}>
              <img src={editData.image} alt="Current" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
              <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>Current image</p>
            </div>
          )}
          <button type="submit" style={{
            background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 25px',
            borderRadius: 6, cursor: 'pointer', width: '100%', fontSize: 15, marginTop: 10
          }}>
            {editData ? 'Update' : 'Add'} Gift
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Gifts;
