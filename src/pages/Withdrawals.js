import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { withdrawalApi } from '../api/services';

const Withdrawals = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tdsReport, setTdsReport] = useState(null);
  const [walletReport, setWalletReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Release modal
  const [releaseModal, setReleaseModal] = useState(false);
  const [releaseId, setReleaseId] = useState(null);
  const [releaseNote, setReleaseNote] = useState('');

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  // TDS report modal
  const [tdsModal, setTdsModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      if (orderType) params.orderType = orderType;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.getAll(params);
      const d = res.data;
      setData(d.withdrawlRequest || []);
      setPagination({ totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page });
      setTdsReport(d.tdsReport || null);
      setWalletReport(d.walletReport || null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, orderType, fromDate, toDate]);

  const handleRelease = async () => {
    if (!releaseNote || releaseNote.length < 10) {
      alert('Please enter a note (minimum 10 characters)');
      return;
    }
    try {
      await withdrawalApi.release({ del_id: releaseId, note: releaseNote });
      setReleaseModal(false);
      setReleaseNote('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCancel = async () => {
    try {
      await withdrawalApi.cancel({ del_id: cancelId });
      setCancelModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.tdsCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'tds_report.csv'; a.click();
    } catch (e) { alert('Failed to export CSV'); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (search) params.searchString = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await withdrawalApi.tdsPdf(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e) { alert('Failed to export PDF'); }
  };

  const handleClear = () => {
    setSearch(''); setOrderType(''); setFromDate(''); setToDate(''); setPage(1);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: { bg: '#fef3c7', color: '#92400e' },
      Released: { bg: '#d1fae5', color: '#065f46' },
      Cancelled: { bg: '#fee2e2', color: '#991b1b' }
    };
    const c = colors[status] || colors.Pending;
    return <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color }}>{status}</span>;
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Name', render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {row.profileImage ? <img src={row.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> :
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{(row.name || '?')[0]}</div>}
            <div><div style={{ fontWeight: 500 }}>{row.name}</div><div style={{ fontSize: 11, color: '#888' }}>{row.contactNo}</div></div>
          </div>
        </div>
      )
    },
    { header: 'Amount', render: (row) => `${row.country === 'India' ? '₹' : '$'}${row.withdrawAmount || 0}` },
    { header: 'TDS', render: (row) => row.tds_pay_amount || 0 },
    { header: 'Payable', render: (row) => row.pay_amount || 0 },
    { header: 'Date', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '-' },
    { header: 'Method', render: (row) => row.method_name || '-' },
    { header: 'Status', render: (row) => getStatusBadge(row.status || 'Pending') },
    {
      header: 'Actions', render: (row) => row.status === 'Pending' ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setReleaseId(row.id); setReleaseNote(''); setReleaseModal(true); }}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Release</button>
          <button onClick={() => { setCancelId(row.id); setCancelModal(true); }}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
        </div>
      ) : <span style={{ color: '#999', fontSize: 12 }}>{row.status}</span>
    }
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={orderType} onChange={e => { setOrderType(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="released">Released</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
        <button onClick={handleClear} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Clear</button>
        <button onClick={handleExportCSV} style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>CSV Report</button>
        <button onClick={handleExportPDF} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>PDF Report</button>
        <button onClick={() => setTdsModal(true)} style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>TDS Summary</button>
      </div>

      <DataTable
        title="Withdrawal Requests"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={(val) => { setSearch(val); setPage(1); }}
        searchValue={search}
      />

      {/* Release Modal */}
      <Modal isOpen={releaseModal} onClose={() => setReleaseModal(false)} title="Release Confirmation">
        <p>Are you sure you want to release this withdrawal?</p>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 500, fontSize: 13 }}>Note (min 10 characters):</label>
          <textarea value={releaseNote} onChange={e => setReleaseNote(e.target.value)}
            rows={3} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginTop: 4, fontSize: 13 }}
            placeholder="Enter release note..." />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={() => setReleaseModal(false)} style={{ padding: '8px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleRelease} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Release</button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Confirmation">
        <p>Are you sure you want to cancel this withdrawal? The amount will be refunded to the astrologer's wallet.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={() => setCancelModal(false)} style={{ padding: '8px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>No</button>
          <button onClick={handleCancel} style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Yes, Cancel</button>
        </div>
      </Modal>

      {/* TDS Summary Modal */}
      <Modal isOpen={tdsModal} onClose={() => setTdsModal(false)} title="TDS Report Summary">
        {tdsReport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 500 }}>Total Withdraw Amount</span>
              <span style={{ fontWeight: 600 }}>{tdsReport.total_withdraw}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 500 }}>Total TDS Deducted</span>
              <span style={{ fontWeight: 600 }}>{tdsReport.total_tds}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 500 }}>Total Payable Amount</span>
              <span style={{ fontWeight: 600 }}>{tdsReport.total_payable}</span>
            </div>
            {walletReport && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontWeight: 500 }}>Remaining Wallet Amount</span>
                <span style={{ fontWeight: 600 }}>{walletReport.remaining_amount}</span>
              </div>
            )}
          </div>
        )}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button onClick={() => setTdsModal(false)} style={{ padding: '8px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default Withdrawals;
