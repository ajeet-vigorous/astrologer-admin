import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import { couponApi } from '../api/services';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    name: '', couponCode: '', validFrom: '', validTo: '',
    minAmount: '', maxAmount: '', description: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await couponApi.getAll({ page });
      setCoupons(res.data.coupons || []);
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

  const emptyForm = { name: '', couponCode: '', validFrom: '', validTo: '', minAmount: '', maxAmount: '', description: '' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await couponApi.edit({ filed_id: editData.id, ...form });
      } else {
        await couponApi.add(form);
      }
      setShowModal(false);
      setEditData(null);
      setForm(emptyForm);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (coupon) => {
    setEditData(coupon);
    setForm({
      name: coupon.name || '',
      couponCode: coupon.couponCode || '',
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validTo: coupon.validTo ? coupon.validTo.split('T')[0] : '',
      minAmount: coupon.minAmount || '',
      maxAmount: coupon.maxAmount || '',
      description: coupon.description || ''
    });
    setShowModal(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      await couponApi.status({ status_id: id });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete coupon "${row.couponCode}"? This cannot be undone.`)) return;
    try {
      await couponApi.delete({ del_id: row.id });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Name', key: 'name' },
    { header: 'Coupon Code', render: (row) => (
      <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13 }}>
        {row.couponCode}
      </span>
    )},
    { header: 'Valid From', render: (row) => row.validFrom ? new Date(row.validFrom).toLocaleDateString() : '-' },
    { header: 'Valid To', render: (row) => row.validTo ? new Date(row.validTo).toLocaleDateString() : '-' },
    { header: 'Min Amount', render: (row) => '\u20B9' + (row.minAmount || 0) },
    { header: 'Max Amount', render: (row) => '\u20B9' + (row.maxAmount || 0) },
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
          <button onClick={() => handleDelete(row)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Coupons"
        columns={columns}
        data={coupons}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button
            onClick={() => { setEditData(null); setForm(emptyForm); setShowModal(true); }}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}
          >
            + Add Coupon
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required />
          <FormInput label="Coupon Code" name="couponCode" value={form.couponCode} onChange={handleChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormInput label="Valid From" name="validFrom" type="date" value={form.validFrom} onChange={handleChange} required />
            <FormInput label="Valid To" name="validTo" type="date" value={form.validTo} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormInput label="Min Amount" name="minAmount" type="number" value={form.minAmount} onChange={handleChange} required />
            <FormInput label="Max Amount" name="maxAmount" type="number" value={form.maxAmount} onChange={handleChange} required />
          </div>
          <FormInput label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
          <button type="submit" style={{
            background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 25px',
            borderRadius: 6, cursor: 'pointer', width: '100%', fontSize: 15, marginTop: 10
          }}>
            {editData ? 'Update' : 'Add'} Coupon
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;
