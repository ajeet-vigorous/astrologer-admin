import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { dataMonitorApi } from '../api/services';

const ChatsMonitoring = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ astrologerId: '', userId: '', date: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dataMonitorApi.getChatsMonitoring({ page, ...filters });
      setData(res.data.data || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, page: res.data.page });
      if (res.data.astrologers) setAstrologers(res.data.astrologers);
      if (res.data.users) setUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching chats monitoring:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 15) + i + 1 },
    { header: 'User', render: (row) => row.Username || '-' },
    { header: 'Contact', key: 'contactNo' },
    { header: 'Astrologer', key: 'astrologerName' },
    { header: 'Chat ID', key: 'chatId' },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Chats Monitoring</h2>
        <select name="astrologerId" value={filters.astrologerId} onChange={handleFilterChange}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
          <option value="">All Astrologers</option>
          {astrologers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select name="userId" value={filters.userId} onChange={handleFilterChange}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
          <option value="">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.contactNo})</option>)}
        </select>
        <input type="date" name="date" value={filters.date} onChange={handleFilterChange}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
      </div>
      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ChatsMonitoring;
