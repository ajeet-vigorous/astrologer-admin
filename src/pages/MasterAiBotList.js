import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAstrologerApi } from '../api/services';

const MasterAiBotList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await aiAstrologerApi.getMasterBots({ page, search, per_page: 15 });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching master AI bots:', err);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmDelete = (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  const handleDelete = async () => {
    try {
      await aiAstrologerApi.deleteMasterBot(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      console.error('Error deleting master AI bot:', err);
    }
  };

  const truncate = (str, len) => {
    if (!str) return '--';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const startIndex = pagination ? pagination.start : ((page - 1) * 15 + 1);

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Master AI Chat Bots</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={styles.searchInput}
            />
            <button onClick={() => navigate('/admin/master-ai-bot/create')} style={styles.primaryBtn}>
              Create Master Bot
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
                <th style={styles.th}>Chat Charge (INR)</th>
                <th style={styles.th}>Chat Charge (USD)</th>
                <th style={styles.th}>System Instruction</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, i) => (
                <tr key={row._id || row.id || i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={styles.td}>{startIndex + i}</td>
                  <td style={styles.td}>
                    {row.profile_image ? (
                      <img
                        src={row.profile_image.startsWith('http') ? row.profile_image : '/' + row.profile_image}
                        alt={row.name}
                        style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 45, height: 45, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>N/A</div>
                    )}
                  </td>
                  <td style={styles.td}>{row.name || '--'}</td>
                  <td style={styles.td}>{row.chat_charge_inr != null ? row.chat_charge_inr : '--'}</td>
                  <td style={styles.td}>{row.chat_charge_usd != null ? row.chat_charge_usd : '--'}</td>
                  <td style={styles.td} title={row.system_instruction}>{truncate(row.system_instruction, 50)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/admin/master-ai-bot/edit/${row._id || row.id}`)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => confirmDelete(row._id || row.id, row.name)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: 30, color: '#9ca3af' }}>No data found</td>
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

export default MasterAiBotList;
