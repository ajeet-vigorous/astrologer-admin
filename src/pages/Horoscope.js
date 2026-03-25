import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { horoscopeApi, horoscopeSignApi } from '../api/services';

const Horoscope = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signs, setSigns] = useState([]);
  const [signFilter, setSignFilter] = useState('');
  const [form, setForm] = useState({
    horoScopeSignId: '',
    horoscopeType: '',
    title: '',
    description: '',
    fromDate: '',
    toDate: ''
  });

  const horoscopeTypes = [
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Yearly', label: 'Yearly' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, search };
      if (signFilter) params.horoScopeSignId = signFilter;
      const res = await horoscopeApi.getAll(params);
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching horoscopes:', err);
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
  }, [page, search, signFilter]);

  useEffect(() => {
    fetchSigns();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ horoScopeSignId: '', horoscopeType: '', title: '', description: '', fromDate: '', toDate: '' });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      horoScopeSignId: row.horoScopeSignId || '',
      horoscopeType: row.horoscopeType || '',
      title: row.title || '',
      description: row.description || '',
      fromDate: row.fromDate ? row.fromDate.substring(0, 10) : '',
      toDate: row.toDate ? row.toDate.substring(0, 10) : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await horoscopeApi.edit({ ...form, id: editData.id });
      } else {
        await horoscopeApi.add(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving horoscope:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this horoscope?')) {
      try {
        await horoscopeApi.delete({ id });
        fetchData();
      } catch (err) {
        console.error('Error deleting horoscope:', err);
      }
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Sign', render: (row) => row.signName || row.horoscopeSign?.name || '-' },
    { header: 'Type', key: 'horoscopeType' },
    { header: 'Title', key: 'title' },
    { header: 'From Date', render: (row) => row.fromDate ? new Date(row.fromDate).toLocaleDateString() : '-' },
    { header: 'To Date', render: (row) => row.toDate ? new Date(row.toDate).toLocaleDateString() : '-' },
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
        title="Horoscope"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        headerActions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={signFilter} onChange={(e) => { setSignFilter(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Signs</option>
              {signs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={openAdd} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
          </div>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Horoscope' : 'Add Horoscope'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Sign" type="select" name="horoScopeSignId" value={form.horoScopeSignId} onChange={handleChange} required options={signs.map(s => ({ value: s.id, label: s.name }))} />
          <FormInput label="Type" type="select" name="horoscopeType" value={form.horoscopeType} onChange={handleChange} required options={horoscopeTypes} />
          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required placeholder="Enter title" />
          <FormInput label="Description" type="textarea" name="description" value={form.description} onChange={handleChange} required placeholder="Enter description" />
          <FormInput label="From Date" type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required />
          <FormInput label="To Date" type="date" name="toDate" value={form.toDate} onChange={handleChange} required />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{editData ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Horoscope;
