import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { withdrawalApi } from '../api/services';

const WalletHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currency, setCurrency] = useState({ value: '₹' });
  const [gst, setGst] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistory(params);
      const d = res.data;
      setData(d.wallet || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
      if (d.currency) setCurrency(d.currency);
      if (d.gst !== undefined) setGst(d.gst);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, paymentMethod, fromDate, toDate]);

  const handleClear = () => { setSearch(''); setPaymentMethod(''); setFromDate(''); setToDate(''); setPage(1); };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistoryCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'wallet_history.csv'; a.click();
    } catch (e) { alert('Failed to export CSV'); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.walletHistoryPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e) { alert('Failed to export PDF'); }
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Profile', render: (row) => (
        row.userProfile ? <img src={row.userProfile} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> :
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{(row.userName || '?')[0]}</div>
      )
    },
    { header: 'Name', render: (row) => row.userName || '-' },
    { header: 'Contact', render: (row) => row.userContact || '-' },
    { header: `Amount (${currency.value || '₹'})`, render: (row) => parseFloat(row.amount || 0).toFixed(2) },
    { header: `GST (${gst}%)`, render: (row) => ((parseFloat(row.amount || 0) * gst) / 100).toFixed(2) },
    {
      header: `Total (${currency.value || '₹'})`, render: (row) => {
        const amt = parseFloat(row.amount || 0);
        return (amt + (amt * gst) / 100).toFixed(2);
      }
    },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-' },
    { header: 'Method', render: (row) => row.paymentMode ? row.paymentMode.charAt(0).toUpperCase() + row.paymentMode.slice(1) : '-' },
    {
      header: 'Status', render: (row) => {
        const s = row.paymentStatus || '';
        const c = s === 'success' ? { bg: '#d1fae5', color: '#065f46' } : { bg: '#fee2e2', color: '#991b1b' };
        return <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color }}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
      }
    }
  ];

  return (
    <div>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
          <option value="">All Methods</option>
          <option value="admin">Admin</option>
          <option value="razorpay">Razorpay</option>
          <option value="refund">Refund</option>
        </select>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <button onClick={handleClear} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Clear</button>
        <button onClick={handleExportCSV} style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>CSV Report</button>
        <button onClick={handleExportPDF} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>PDF Report</button>
      </div>

      <DataTable
        title="Wallet History"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={(val) => { setSearch(val); setPage(1); }}
        searchValue={search}
      />
    </div>
  );
};

export default WalletHistory;
