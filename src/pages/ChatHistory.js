import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { chatHistoryApi } from '../api/services';

const ChatHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await chatHistoryApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleExportCsv = async () => {
    try {
      const res = await chatHistoryApi.exportCsv({ search });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'chat-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handlePrintPdf = async () => {
    try {
      const res = await chatHistoryApi.printPdf({ search });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Customer Name', render: (row) => row.customerName || row.customer?.name || '-' },
    { header: 'Astrologer Name', render: (row) => row.astrologerName || row.astrologer?.name || '-' },
    { header: 'Total Min', render: (row) => row.totalMinutes || row.totalMin || '0' },
    { header: 'Date', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'completed';
        const colors = { completed: { bg: '#d1fae5', color: '#065f46' }, missed: { bg: '#fee2e2', color: '#991b1b' }, ongoing: { bg: '#dbeafe', color: '#1e40af' } };
        const c = colors[status] || colors.completed;
        return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.color }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      }
    }
  ];

  return (
    <div>
      <DataTable
        title="Chat History"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        headerActions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCsv} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Export CSV</button>
            <button onClick={handlePrintPdf} style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Print PDF</button>
          </div>
        }
      />
    </div>
  );
};

export default ChatHistory;
