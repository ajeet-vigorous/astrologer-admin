import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { ticketApi } from '../api/services';

const Tickets = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleClose = async (id) => {
    if (window.confirm('Are you sure you want to close this ticket?')) {
      try {
        await ticketApi.close({ id });
        fetchData();
      } catch (err) {
        console.error('Error closing ticket:', err);
      }
    }
  };

  const handlePause = async (id) => {
    if (window.confirm('Are you sure you want to pause this ticket?')) {
      try {
        await ticketApi.pause({ id });
        fetchData();
      } catch (err) {
        console.error('Error pausing ticket:', err);
      }
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'User Name', render: (row) => row.userName || row.user?.name || '-' },
    { header: 'Issue', render: (row) => row.issue ? (row.issue.length > 60 ? row.issue.substring(0, 60) + '...' : row.issue) : '-' },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'open';
        const colors = { open: { bg: '#dbeafe', color: '#1e40af' }, closed: { bg: '#fee2e2', color: '#991b1b' }, paused: { bg: '#fef3c7', color: '#92400e' } };
        const c = colors[status] || colors.open;
        return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.color }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      }
    },
    { header: 'Date', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.status !== 'closed' && (
            <button onClick={() => handleClose(row.id)} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          )}
          {row.status !== 'paused' && row.status !== 'closed' && (
            <button onClick={() => handlePause(row.id)} style={{ padding: '4px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pause</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Tickets"
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

export default Tickets;
