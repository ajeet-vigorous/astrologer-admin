import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import { horoscopeSignApi } from '../api/services';

const HoroscopeSigns = () => {
  const [signs, setSigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await horoscopeSignApi.getAll({ page });
      setSigns(res.data.signs || []);
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
      let imageData = '';
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }

      if (editData) {
        await horoscopeSignApi.edit({ filed_id: editData.id, name: form.name, image: imageData || undefined });
      } else {
        await horoscopeSignApi.add({ name: form.name, image: imageData });
      }
      setShowModal(false);
      setEditData(null);
      setForm({ name: '' });
      setImageFile(null);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (sign) => {
    setEditData(sign);
    setForm({ name: sign.name });
    setImageFile(null);
    setShowModal(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      await horoscopeSignApi.status({ status_id: id });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Name', key: 'name' },
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
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Horoscope Signs"
        columns={columns}
        data={signs}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button
            onClick={() => { setEditData(null); setForm({ name: '' }); setImageFile(null); setShowModal(true); }}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}
          >
            + Add Sign
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Horoscope Sign' : 'Add Horoscope Sign'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Sign Name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
            {editData ? 'Update' : 'Add'} Sign
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HoroscopeSigns;
