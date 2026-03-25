import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { profileBoostApi } from '../api/services';

const ProfileBoostHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [];
  for (let y = 2020; y <= new Date().getFullYear(); y++) years.push(y);

  const fetchData = useCallback(async () => {
    try {
      const res = await profileBoostApi.getHistory({ page, month, year });
      setData(res.data.boosted || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page, month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dt) => {
    if (!dt) return '--';
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Astrologer Name', render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={row.profileImage?.startsWith('http') ? row.profileImage : '/' + (row.profileImage || '')} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
          </div>
          <span>{row.name || '--'}</span>
        </div>
      )
    },
    { header: 'Boost Start Time', render: (row) => <div style={{ textAlign: 'center' }}>{formatDate(row.boosted_datetime)}</div> },
    { header: 'Boost End Time', render: (row) => <div style={{ textAlign: 'center' }}>{formatDate(row.enddate_time)}</div> },
    {
      header: 'Monthly Boost Count', render: (row) => (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 18 }}>{row.monthly_boost_count}</span><br />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{row.monthname} {row.yearname}</span>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <select value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} style={styles.select}>
          <option value="">Select Month</option>
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }} style={styles.select}>
          <option value="">Select Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => { setPage(1); fetchData(); }} style={styles.filterBtn}>Filter</button>
      </div>

      <DataTable
        title="Profile Boost History"
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
};

const styles = {
  select: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  filterBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default ProfileBoostHistory;
