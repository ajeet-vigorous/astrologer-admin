import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { dailyHoroscopeInsightApi, horoscopeSignApi } from '../api/services';

const DailyHoroscopeInsight = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signs, setSigns] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [form, setForm] = useState({
    horoScopeSignId: '',
    description: '',
    date: '',
    insightImage: null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, search };
      if (dateFilter) params.date = dateFilter;
      const res = await dailyHoroscopeInsightApi.getAll(params);
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
    setLoading(false);
  };

  const fetchSigns = async () => {
    try {
      const res = await horoscopeSignApi.getAll({ page: 1, limit: 1000 });
      setSigns(res.data.data || []);
    } catch (err) {
      console.error('Error fetching signs:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, dateFilter]);

  useEffect(() => {
    fetchSigns();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'insightImage') {
      setForm({ ...form, insightImage: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ horoScopeSignId: '', description: '', date: '', insightImage: null });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      horoScopeSignId: row.horoScopeSignId || '',
      description: row.description || '',
      date: row.date ? row.date.substring(0, 10) : '',
      insightImage: null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('horoScopeSignId', form.horoScopeSignId);
      formData.append('description', form.description);
      formData.append('date', form.date);
      if (form.insightImage) formData.append('insightImage', form.insightImage);
      if (editData) {
        formData.append('id', editData.id);
        await dailyHoroscopeInsightApi.edit(formData);
      } else {
        await dailyHoroscopeInsightApi.add(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving insight:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this insight?')) {
      try {
        await dailyHoroscopeInsightApi.delete({ id });
        fetchData();
      } catch (err) {
        console.error('Error deleting insight:', err);
      }
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Sign', render: (row) => row.signName || row.horoscopeSign?.name || '-' },
    { header: 'Description', render: (row) => row.description ? (row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description) : '-' },
    { header: 'Date', render: (row) => row.date ? new Date(row.date).toLocaleDateString() : '-' },
    {
      header: 'Image',
      render: (row) => row.insightImage ? (
        <img src={row.insightImage} alt="insight" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '6px' }} />
      ) : '-'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
          <button onClick={() => handleDelete(row.id)} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Daily Horoscope Insights"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        headerActions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
            <button onClick={openAdd} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
          </div>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Insight' : 'Add Insight'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Sign" type="select" name="horoScopeSignId" value={form.horoScopeSignId} onChange={handleChange} required options={signs.map(s => ({ value: s.id, label: s.name }))} />
          <FormInput label="Description" type="textarea" name="description" value={form.description} onChange={handleChange} required placeholder="Enter description" />
          <FormInput label="Date" type="date" name="date" value={form.date} onChange={handleChange} required />
          <FormInput label="Insight Image" type="file" name="insightImage" onChange={handleChange} />
          {editData && editData.insightImage && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', color: '#555' }}>Current Image:</label>
              <img src={editData.insightImage} alt="current" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '6px', display: 'block', marginTop: '5px' }} />
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

export default DailyHoroscopeInsight;
