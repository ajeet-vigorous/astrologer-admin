import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import { skillApi } from '../api/services';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await skillApi.getAll({ page });
      setSkills(res.data.skills || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await skillApi.edit({ filed_id: editData.id, name: form.name });
      } else {
        await skillApi.add({ name: form.name });
      }
      setShowModal(false);
      setEditData(null);
      setForm({ name: '' });
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (skill) => {
    setEditData(skill);
    setForm({ name: skill.name });
    setShowModal(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      await skillApi.status({ status_id: id });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillApi.delete({ del_id: id });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Name', key: 'name' },
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
        title="Skills"
        columns={columns}
        data={skills}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button
            onClick={() => { setEditData(null); setForm({ name: '' }); setShowModal(true); }}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}
          >
            + Add Skill
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Skill' : 'Add Skill'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Skill Name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <button type="submit" style={{
            background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 25px',
            borderRadius: 6, cursor: 'pointer', width: '100%', fontSize: 15, marginTop: 10
          }}>
            {editData ? 'Update' : 'Add'} Skill
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Skills;
