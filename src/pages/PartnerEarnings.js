import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { partnerEarningApi } from '../api/services';

const PartnerEarnings = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await partnerEarningApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching partner earnings:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleExportCsv = async () => {
    try {
      const res = await partnerEarningApi.exportCsv({ search });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'partner-earnings.csv');
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
      const res = await partnerEarningApi.printPdf({ search });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Astrologer Name', render: (row) => row.astrologerName || row.astrologer?.name || '-' },
    { header: 'Total Calls', render: (row) => row.totalCalls || 0 },
    { header: 'Total Chats', render: (row) => row.totalChats || 0 },
    { header: 'Total Reports', render: (row) => row.totalReports || 0 },
    { header: 'Total Earning', render: (row) => row.totalEarning != null ? `$${Number(row.totalEarning).toFixed(2)}` : '$0.00' }
  ];

  return (
    <div>
      <DataTable
        title="Partner Earnings"
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

export default PartnerEarnings;
