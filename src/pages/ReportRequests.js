import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { reportRequestApi } from '../api/services';

const ReportRequests = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportRequestApi.getAll({ page, searchString: search });
      const d = res.data?.data || res.data;
      setData(d?.reportRequest || d?.data || []);
      setPagination(d?.totalPages ? { totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.currentPage } : null);
    } catch (err) {
      console.error('Error fetching report requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleExportCsv = async () => {
    try {
      const res = await reportRequestApi.exportCsv({ search });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report-requests.csv');
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
      const res = await reportRequestApi.printPdf({ search });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const columns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    { header: 'Customer', render: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.customerName || '-' },
    { header: 'Contact', render: (row) => row.contactNo || '-' },
    { header: 'Astrologer', render: (row) => row.astrologerName || '-' },
    { header: 'Report Type', render: (row) => row.reportType || '-' },
    { header: 'Rate', render: (row) => row.reportRate ? `₹${parseFloat(row.reportRate).toFixed(2)}` : '-' },
    { header: 'Birth Date', render: (row) => row.birthDate || '-' },
    {
      header: 'Status',
      render: (row) => {
        const hasFile = !!row.reportFile;
        return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: hasFile ? '#d1fae5' : '#fef3c7', color: hasFile ? '#065f46' : '#92400e' }}>{hasFile ? 'Completed' : 'Pending'}</span>;
      }
    },
    {
      header: 'Report',
      render: (row) => row.reportFile ? <a href={`${window.location.origin.replace(':3000',':5000')}/${row.reportFile}`} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', fontWeight: 600 }}>Download</a> : '--'
    },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-' }
  ];

  return (
    <div>
      <DataTable
        title="Report Requests"
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

export default ReportRequests;
