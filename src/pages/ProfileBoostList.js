import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileBoostApi } from '../api/services';
import Loader from '../components/Loader';
import { Pencil, Plus, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

const ProfileBoostList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileBoostApi.getList({ page });
      setData(res.data.profilelist || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getBenefits = (benefits) => {
    if (!benefits || !Array.isArray(benefits)) return '-';
    const str = benefits.join(', ');
    return str.length > 50 ? str.substring(0, 50) + '...' : str || '-';
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map(p => <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>)}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Zap size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Profile Boost</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/profile-boost/add')} className="cust-btn cust-btn-primary"><Plus size={15} /> Add Boost</button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading boost settings..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Chat Commission</th><th>Call Commission</th><th>Monthly Boost</th><th>Benefits</th><th>Actions</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="cust-no-data">No data found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>{row.chat_commission ? `${row.chat_commission}%` : '-'}</td>
                    <td>{row.call_commission ? `${row.call_commission}%` : '-'}</td>
                    <td className="cust-name-cell">{row.profile_boost || '-'}</td>
                    <td title={Array.isArray(row.profile_boost_benefits) ? row.profile_boost_benefits.join(', ') : ''}>{getBenefits(row.profile_boost_benefits)}</td>
                    <td><div className="cust-actions"><button onClick={() => navigate(`/admin/profile-boost/edit/${row.id}`)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>
    </div>
  );
};

export default ProfileBoostList;
