import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { commissionApi } from '../api/services';

const Commissions = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [commissionTypes, setCommissionTypes] = useState([]);
  const [filterAstrologerId, setFilterAstrologerId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    commissionTypeId: '',
    commission: '',
    astrologerId: ''
  });
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filterAstrologerId) {
        params.astrologerId = filterAstrologerId;
      }
      const res = await commissionApi.getAll(params);
      const d = res.data;
      setData(d.commission || []);
      setAstrologers(d.astrologer || []);
      setCommissionTypes(d.commissionType || []);
      setPagination({
        totalPages: d.totalPages,
        totalRecords: d.totalRecords,
        start: d.start,
        end: d.end,
        currentPage: d.page
      });
    } catch (err) {
      console.error('Error fetching commissions:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, filterAstrologerId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ commissionTypeId: '', commission: '', astrologerId: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      commissionTypeId: row.commissionTypeId || '',
      commission: row.commission || '',
      astrologerId: row.astrologerId || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editData) {
        res = await commissionApi.edit({ ...form, filed_id: editData.id });
      } else {
        res = await commissionApi.add(form);
      }
      if (res.data.error) {
        if (Array.isArray(res.data.error)) {
          alert(res.data.error.join(', '));
        } else {
          setErrors(res.data.error);
        }
        return;
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving commission:', err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await commissionApi.delete({ del_id: deleteId });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting commission:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 15) + i + 1 },
    { header: 'Astrologer', render: (row) => row.astrologerName || '-' },
    { header: 'Contact', render: (row) => row.contactNo || '-' },
    { header: 'Commission Type', render: (row) => row.commssionType || '-' },
    { header: 'Commission %', key: 'commission' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
          <button onClick={() => confirmDelete(row.id)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Commission Rate"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        loading={loading}
        headerActions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={filterAstrologerId}
              onChange={(e) => { setFilterAstrologerId(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', minWidth: '180px' }}
            >
              <option value="">All Astrologers</option>
              {astrologers.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button onClick={openAdd} style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 13 }}>+ Add Commission</button>
          </div>
        }
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Commission' : 'Add Commission'}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Astrologer *</label>
            <select name="astrologerId" value={form.astrologerId} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Astrologer</option>
              {astrologers.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {errors.astrologerId && <div style={errorStyle}>{errors.astrologerId[0]}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Commission Type *</label>
            <select name="commissionTypeId" value={form.commissionTypeId} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Commission Type</option>
              {commissionTypes.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
            {errors.commissionTypeId && <div style={errorStyle}>{errors.commissionTypeId[0]}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Commission % *</label>
            <input type="number" name="commission" value={form.commission} onChange={handleChange} required placeholder="Enter commission %" style={inputStyle} min="0" max="100" />
            {errors.commission && <div style={errorStyle}>{errors.commission[0]}</div>}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              {editData ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '15px', color: '#374151', marginBottom: '20px' }}>Are you sure you want to delete this commission? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ padding: '8px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#555' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };
const errorStyle = { color: '#dc2626', fontSize: 11, marginTop: 2 };

export default Commissions;
