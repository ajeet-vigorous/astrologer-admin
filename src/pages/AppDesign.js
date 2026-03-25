import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { appDesignApi } from '../api/services';

const AppDesign = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await appDesignApi.getAll({ page });
      setData(res.data.appdesign || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async () => {
    try { await appDesignApi.status({ status_id: statusId }); setShowStatusModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Images', render: (row) => {
      const images = Array.isArray(row.image) ? row.image.slice(0, 3) : [];
      return (
        <div style={{ display: 'flex' }}>
          {images.map((img, i) => (
            <img key={i} src={img.startsWith('http') ? img : '/' + img} alt=""
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', marginLeft: i > 0 ? -12 : 0, cursor: 'pointer' }}
              onClick={() => setImageModal({ open: true, src: img.startsWith('http') ? img : '/' + img })}
              onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
          ))}
        </div>
      );
    }},
    { header: 'Title', render: (row) => <span style={{ fontWeight: 500 }}>{row.title || '--'}</span> },
    { header: 'Status', render: (row) => <span style={{ color: row.is_active ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{row.is_active ? 'Active' : 'Inactive'}</span> },
    { header: 'Action', render: (row) => (
      <button onClick={() => { setStatusId(row.id); setShowStatusModal(true); }} style={styles.linkBtn}>Change Status</button>
    )}
  ];

  return (
    <div>
      <DataTable title="App Design" columns={columns} data={data} pagination={pagination} onPageChange={setPage} />

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Status">
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Are You Sure?</p>
          <p style={{ color: '#6b7280', marginTop: 8 }}>You want to change status!</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setShowStatusModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
            <button onClick={handleStatus} style={styles.addBtn}>Yes, Change it!</button>
          </div>
        </div>
      </Modal>

      {imageModal.open && (
        <div onClick={() => setImageModal({ open: false, src: '' })} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={imageModal.src} alt="Full View" style={{ maxWidth: '100%', maxHeight: '680px', borderRadius: 8 }} />
            <button onClick={() => setImageModal({ open: false, src: '' })} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }
};

export default AppDesign;
