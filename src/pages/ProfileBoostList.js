import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { profileBoostApi } from '../api/services';

const ProfileBoostList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await profileBoostApi.getList({ page });
      setData(res.data.profilelist || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getBenefitsString = (benefits) => {
    if (!benefits) return '--';
    const arr = Array.isArray(benefits) ? benefits : [];
    const str = arr.join(', ');
    return str.length > 60 ? str.substring(0, 60) + '...' : str || '--';
  };

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Chat Commission', render: (row) => <div style={{ textAlign: 'center' }}>{row.chat_commission ? `${row.chat_commission} %` : '--'}</div> },
    { header: 'Call Commission', render: (row) => <div style={{ textAlign: 'center' }}>{row.call_commission ? `${row.call_commission} %` : '--'}</div> },
    { header: 'Profile Monthly Boost', render: (row) => <div style={{ textAlign: 'center' }}>{row.profile_boost || '--'}</div> },
    { header: 'Profile Benefits', render: (row) => <div style={{ textAlign: 'center', cursor: 'pointer' }} title={Array.isArray(row.profile_boost_benefits) ? row.profile_boost_benefits.join(', ') : ''}>{getBenefitsString(row.profile_boost_benefits)}</div> },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/profile-boost/edit/${row.id}`)} style={styles.linkBtn}>Edit</button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      title="Profile Benefits"
      columns={columns}
      data={data}
      pagination={pagination}
      onPageChange={setPage}
      headerActions={
        <button onClick={() => navigate('/admin/profile-boost/add')} style={styles.addBtn}>Add Profile Boost</button>
      }
    />
  );
};

const styles = {
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }
};

export default ProfileBoostList;
