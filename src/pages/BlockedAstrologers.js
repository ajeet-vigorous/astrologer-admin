import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { blockAstrologerApi } from '../api/services';

const BlockedAstrologers = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await blockAstrologerApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching blocked astrologers:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    {
      header: 'User Profile',
      render: (row) => (
        <img
          src={row.userImage || row.user?.image || row.user?.profileImage || 'https://via.placeholder.com/50'}
          alt="User"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50'; }}
          style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
        />
      )
    },
    {
      header: 'User Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.userName || row.user?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{row.userContactNumber || row.user?.contactNumber || row.user?.phone || ''}</div>
        </div>
      )
    },
    {
      header: 'Astrologer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.astrologerName || row.astrologer?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{row.astrologerContactNumber || row.astrologer?.contactNumber || row.astrologer?.phone || ''}</div>
        </div>
      )
    },
    {
      header: 'Reason',
      render: (row) => row.reason ? (row.reason.length > 60 ? row.reason.substring(0, 60) + '...' : row.reason) : '-'
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.createdAt)
    }
  ];

  return (
    <div>
      <DataTable
        title="Blocked Astrologers"
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

export default BlockedAstrologers;
