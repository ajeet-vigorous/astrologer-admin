import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import { reportApi } from '../api/services';

const Reports = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    reportImage: null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching report types:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleChange = (e) => {
    if (e.target.name === 'reportImage') {
      setForm({ ...form, reportImage: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ title: '', reportImage: null });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      title: row.title || '',
      reportImage: null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      if (form.reportImage) formData.append('reportImage', form.reportImage);
      if (editData) {
        formData.append('id', editData.id);
        await reportApi.edit(formData);
      } else {
        await reportApi.add(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving report type:', err);
    }
  };

  const handleStatusToggle = async (row) => {
    try {
      await reportApi.status({ id: row.id, status: row.status === 1 ? 0 : 1 });
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Title', key: 'title' },
    {
      header: 'Image',
      render: (row) => row.reportImage ? (
        <img src={row.reportImage} alt={row.title} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '6px' }} />
      ) : '-'
    },
    {
      header: 'Status',
      render: (row) => (
        <span onClick={() => handleStatusToggle(row)} style={{ cursor: 'pointer' }}>
          <StatusBadge active={row.status === 1} />
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Report Types"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        headerActions={
          <button onClick={openAdd} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Report Type</button>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Report Type' : 'Add Report Type'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required placeholder="Enter title" />
          <FormInput label="Report Image" type="file" name="reportImage" onChange={handleChange} />
          {editData && editData.reportImage && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', color: '#555' }}>Current Image:</label>
              <img src={editData.reportImage} alt="current" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '6px', display: 'block', marginTop: '5px' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{editData ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reports;
