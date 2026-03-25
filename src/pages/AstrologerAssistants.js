import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { astrologerApi } from '../api/services';

const AstrologerAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await astrologerApi.getAssistants({ page });
      const d = res.data;
      setAssistants(d.assistants || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assistant?')) {
      try {
        await astrologerApi.deleteAssistant({ del_id: id });
        fetchData();
      } catch (e) { console.error(e); }
    }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Astrologer', render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.profileImage ? <img src={row.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> :
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{(row.astrologerName || '?')[0]}</div>}
          <span style={{ fontWeight: 500 }}>{row.astrologerName}</span>
        </div>
      )
    },
    { header: 'Assistant Name', render: (row) => row.name || '-' },
    { header: 'Contact', render: (row) => row.contactNo || '-' },
    { header: 'Email', render: (row) => row.email || '-' },
    { header: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-' },
    {
      header: 'Actions', render: (row) => (
        <button onClick={() => handleDelete(row.id)}
          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
      )
    }
  ];

  return (
    <DataTable
      title="Astrologer Assistants"
      columns={columns}
      data={assistants}
      pagination={pagination}
      onPageChange={setPage}
    />
  );
};

export default AstrologerAssistants;
