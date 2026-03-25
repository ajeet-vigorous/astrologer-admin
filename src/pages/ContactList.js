import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { appFeedbackApi } from '../api/services';

const ContactList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await appFeedbackApi.getContacts({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'contactNo' },
    { header: 'Message', render: (row) => row.message ? (row.message.length > 80 ? row.message.substring(0, 80) + '...' : row.message) : '-' },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' }
  ];

  return (
    <div>
      <DataTable
        title="Contact Form Submissions"
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

export default ContactList;
