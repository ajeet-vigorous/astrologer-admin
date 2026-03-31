import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAstrologerApi } from '../api/services';

const AiAstrologerList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await aiAstrologerApi.getAll({ page, searchString: search });
      const d = res.data?.data || res.data || {};
      setData(d.aiAstrologers || d.data || []);
      setPagination(d.totalPages ? { totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page } : null);
    } catch (err) {
      console.error('Error fetching AI astrologers:', err);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmDelete = (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  const handleDelete = async () => {
    try {
      await aiAstrologerApi.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      console.error('Error deleting AI astrologer:', err);
    }
  };

  const truncate = (str, len) => {
    if (!str) return '--';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const getSkillNames = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) return '--';
    return skills.map(s => s.name || s).join(', ');
  };

  const perPage = 15;
  const startIndex = pagination ? pagination.start : ((page - 1) * perPage + 1);

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>AI Counsellors</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={styles.searchInput}
            />
            <button onClick={() => navigate('/admin/ai-astrologer/create')} style={styles.primaryBtn}>
              Create AI Counsellor
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Profile Image</th>
                <th style={styles.th}>NAME</th>
                <th style={styles.th}>About</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Primary Skill</th>
                <th style={styles.th}>All Skills</th>
                <th style={styles.th}>Chat Charge (&#8377;)</th>
                <th style={styles.th}>Experience</th>
                <th style={styles.th}>System Instruction</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, i) => (
                <tr key={row._id || row.id || i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={styles.td}>{startIndex + i}</td>
                  <td style={styles.td}>
                    {row.image ? (
                      <img
                        src={row.image.startsWith('http') ? row.image : '/' + row.image}
                        alt={row.name}
                        style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 45, height: 45, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>N/A</div>
                    )}
                  </td>
                  <td style={styles.td}>{row.name || '--'}</td>
                  <td style={styles.td} title={row.about}>{truncate(row.about, 50)}</td>
                  <td style={styles.td}>{row.categoryList ? row.categoryList.map(c => c.name).join(', ') : row.astrologerCategoryId || '--'}</td>
                  <td style={styles.td}>{row.primarySkillList ? row.primarySkillList.map(s => s.name).join(', ') : row.primary_skill || '--'}</td>
                  <td style={styles.td}>{row.allSkillsList ? row.allSkillsList.map(s => s.name).join(', ') : row.all_skills || '--'}</td>
                  <td style={styles.td}>{row.chat_charge != null ? '₹' + row.chat_charge : '--'}</td>
                  <td style={styles.td}>{row.experience != null ? row.experience + ' yrs' : '--'}</td>
                  <td style={styles.td} title={row.system_intruction}>{truncate(row.system_intruction, 30)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/admin/ai-astrologer/edit/${row._id || row.id}`)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => confirmDelete(row._id || row.id, row.name)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} style={{ ...styles.td, textAlign: 'center', padding: 30, color: '#9ca3af' }}>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div style={styles.pagination}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{
                    ...styles.pageBtn,
                    background: pagination.page === i + 1 ? '#7c3aed' : '#fff',
                    color: pagination.page === i + 1 ? '#fff' : '#374151',
                    border: pagination.page === i + 1 ? '1px solid #7c3aed' : '1px solid #d1d5db'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: 30, color: '#dc2626' }}>!</span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Are you sure?</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                You want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal({ show: false, id: null, name: '' })} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleDelete} style={styles.confirmDeleteBtn}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  searchInput: { padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 200 },
  primaryBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#f8f9fa', padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: 13, color: '#374151' },
  editBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  deleteBtn: { background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  pagination: { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb' },
  pageBtn: { padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 400, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  cancelBtn: { padding: '8px 24px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14, color: '#374151' },
  confirmDeleteBtn: { padding: '8px 24px', border: 'none', borderRadius: 6, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }
};

export default AiAstrologerList;
