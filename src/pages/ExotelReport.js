import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { reportExotelApi } from '../api/services';

const ExotelReport = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportExotelApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching exotel report:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'User', render: (row) => row.userName || '-' },
    { header: 'Astrologer', render: (row) => row.astrologerName || '-' },
    { header: 'From', key: 'fromNumber' },
    { header: 'To', key: 'toNumber' },
    { header: 'Duration', render: (row) => row.duration ? `${row.duration} sec` : '-' },
    { header: 'Status', render: (row) => {
      const status = row.status || 'unknown';
      const colors = {
        completed: { bg: '#dcfce7', color: '#166534' },
        failed: { bg: '#fee2e2', color: '#991b1b' },
        busy: { bg: '#fef3c7', color: '#92400e' },
        'no-answer': { bg: '#e0e7ff', color: '#3730a3' }
      };
      const c = colors[status] || { bg: '#f3f4f6', color: '#374151' };
      return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.color }}>{status}</span>;
    }},
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' }
  ];

  return (
    <div>
      <DataTable
        title="Exotel Call History"
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

export default ExotelReport;
