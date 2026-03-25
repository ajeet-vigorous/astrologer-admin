import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { kundaliApi } from '../api/services';

const KundaliEarnings = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = { page };
      if (searchString) params.searchString = searchString;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await kundaliApi.getEarnings(params);
      setData(res.data.kundaliEarnings || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page, searchString, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setSearchString('');
    setPage(1);
  };

  const formatDate = (dt) => {
    if (!dt) return '--';
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'User Type', render: (row) => <div style={{ textAlign: 'center' }}>{row.user_type}</div> },
    { header: 'User', render: (row) => <div style={{ textAlign: 'center' }}>{row.userName} - {row.userContactNo}</div> },
    { header: 'Date', render: (row) => <div style={{ textAlign: 'center' }}>{formatDate(row.created_at)}</div> },
    { header: 'Kundali Type', render: (row) => <div style={{ textAlign: 'center' }}>{row.kundaliType || '--'}</div> },
    {
      header: 'PDF', render: (row) => (
        <div style={{ textAlign: 'center' }}>
          {row.pdf_link ? (
            <a href={row.pdf_link.startsWith('http') ? row.pdf_link : '/' + row.pdf_link} target="_blank" rel="noreferrer"
              style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 500 }}>Download</a>
          ) : 'No Pdf Available'}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="text" value={searchString} onChange={e => setSearchString(e.target.value)}
            placeholder="Search..." style={styles.input} />
          <button type="submit" style={styles.filterBtn}>Search</button>
        </form>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontWeight: 600 }}>From:</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={styles.input} />
          <label style={{ fontWeight: 600 }}>To:</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={styles.input} />
          <button onClick={() => { setPage(1); }} style={styles.filterBtn}>Filter</button>
          <button onClick={handleClear} style={{ ...styles.filterBtn, background: '#6b7280' }}>Clear</button>
        </div>
      </div>

      <DataTable
        title="Kundali Report"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

const styles = {
  input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  filterBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default KundaliEarnings;
