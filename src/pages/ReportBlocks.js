import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { reportBlockApi } from '../api/services';

const ReportBlocks = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportBlockApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching report blocks:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report/block?')) {
      try {
        await reportBlockApi.delete({ id });
        fetchData();
      } catch (err) {
        console.error('Error deleting report block:', err);
      }
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'User', render: (row) => row.userName || row.user?.name || '-' },
    { header: 'Astrologer', render: (row) => row.astrologerName || row.astrologer?.name || '-' },
    { header: 'Rating', render: (row) => row.rating != null ? row.rating : '-' },
    { header: 'Review', render: (row) => row.review ? (row.review.length > 50 ? row.review.substring(0, 50) + '...' : row.review) : '-' },
    { header: 'Date', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => handleDelete(row.id)} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Report / Block"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
      />
    </div>
  );
};

export default ReportBlocks;
