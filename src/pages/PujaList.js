import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { pujaApi } from '../api/services';

const PujaList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await pujaApi.getList({ page });
      setData(res.data.pujalist || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async (id) => {
    try {
      await pujaApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await pujaApi.delete({ del_id: deleteId });
      setShowDeleteModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getImgSrc = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return '/build/assets/images/default.jpg';
    const img = images[0];
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const isDatePassed = (datetime) => {
    if (!datetime) return false;
    return new Date() > new Date(datetime);
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Image', render: (row) => (
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
          <img src={getImgSrc(row.puja_images)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
        </div>
      )
    },
    { header: 'Title', render: (row) => <span style={{ fontWeight: 500 }}>{row.puja_title || '--'}</span> },
    { header: 'Sub Title', render: (row) => row.puja_subtitle || '--' },
    { header: 'Puja Place', render: (row) => row.puja_place || '--' },
    {
      header: 'Status', render: (row) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!row.puja_status} onChange={() => handleStatus(row.id)} />
          <span>{row.puja_status ? 'Active' : 'Inactive'}</span>
        </label>
      )
    },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate(`/admin/puja/edit/${row.id}`)} style={styles.linkBtn}>Edit</button>
          <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={{ ...styles.linkBtn, color: '#ef4444' }}>Delete</button>
          <button onClick={() => navigate(`/admin/puja/view/${row.id}`)} style={styles.linkBtn}>View</button>
        </div>
      )
    },
    {
      header: 'Message', render: (row) => (
        isDatePassed(row.puja_start_datetime) ? <span style={{ color: '#6b7280', fontSize: 12 }}>(Date has been passed)</span> : ''
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Puja List"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button onClick={() => navigate('/admin/puja/add')} style={styles.addBtn}>Add Puja</button>
        }
      />

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Puja">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are you sure?</p>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Do you really want to delete this record? This process cannot be undone.</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }
};

export default PujaList;
