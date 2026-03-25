import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { emailTemplateApi } from '../api/services';

const EmailTemplates = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', subject: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await emailTemplateApi.getAll({ page, searchString: search });
      setData(res.data.data || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, page: res.data.page });
    } catch (err) {
      console.error('Error fetching email templates:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ name: '', subject: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({ name: row.name || '', subject: row.subject || '', description: row.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await emailTemplateApi.edit({ filed_id: editData.id, name: form.name, subject: form.subject, editdescription: form.description });
      } else {
        await emailTemplateApi.add(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving email template:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 6) + i + 1 },
    { header: 'Name', key: 'name' },
    { header: 'Subject', key: 'subject' },
    { header: 'Description', render: (row) => row.description ? (row.description.length > 80 ? row.description.substring(0, 80) + '...' : row.description) : '-' },
    { header: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' },
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
        title="Email Templates"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        headerActions={
          <button onClick={openAdd} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Template</button>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Email Template' : 'Add Email Template'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Template name" />
          <FormInput label="Subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="Email subject" />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 600 }}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Email body/description" rows={6}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{editData ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmailTemplates;
