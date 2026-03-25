import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { dataMonitorApi } from '../api/services';

const CallsMonitoring = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dataMonitorApi.getCallsMonitoring({ page });
      setData(res.data.data || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, page: res.data.page });
    } catch (err) {
      console.error('Error fetching calls monitoring:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 15) + i + 1 },
    { header: 'User', render: (row) => row.Username || '-' },
    { header: 'Contact', key: 'contactNo' },
    { header: 'Astrologer', key: 'astrologerName' },
    { header: 'Channel', key: 'channelName' },
    { header: 'SID', render: (row) => row.sId ? (row.sId.length > 20 ? row.sId.substring(0, 20) + '...' : row.sId) : '-' },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' }
  ];

  return (
    <div>
      <DataTable
        title="Calls Monitoring"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

export default CallsMonitoring;
