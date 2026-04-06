import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAstrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { Bot, Pencil, Trash2, Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const AiAstrologerList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiAstrologerApi.getAll({ page, searchString: search });
      const d = res.data?.data || res.data || {};
      setData(d.aiAstrologers || d.data || []);
      setPagination(d.totalPages ? { totalPages: d.totalPages, totalRecords: d.totalRecords, start: d.start, end: d.end, page: d.page } : null);
    } catch (err) {
      console.error('Error fetching AI astrologers:', err);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await aiAstrologerApi.delete(id);
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const truncate = (str, len) => {
    if (!str) return '--';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const perPage = 15;
  const startIndex = pagination ? pagination.start : ((page - 1) * perPage + 1);

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === pagination.page ? 'active' : ''}`}>
              {p}
            </button>
          ))}
          {pagination.totalPages > 15 && <span className="cust-page-dots">...</span>}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Bot size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">AI Counsellors</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/ai-astrologer/create')} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Create AI Counsellor
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
              className="cust-input cust-search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cust-card">
        {/* Table */}
        {loading ? <Loader text="Loading AI counsellors..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Primary Skill</th>
                  <th>All Skills</th>
                  <th>Chat Charge (&#8377;)</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} className="cust-no-data">No AI counsellors found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row._id || row.id || i}>
                    <td>{startIndex + i}</td>
                    <td>
                      {row.image ? (
                        <img
                          src={row.image.startsWith('http') ? row.image : '/' + row.image}
                          alt={row.name}
                          className="cust-avatar"
                          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">N/A</text></svg>'; }}
                        />
                      ) : (
                        <img
                          src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%23e5e7eb" rx="18"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999">N/A</text></svg>'
                          alt="" className="cust-avatar"
                        />
                      )}
                    </td>
                    <td className="cust-name-cell">{row.name || '--'}</td>
                    <td>{row.categoryList ? row.categoryList.map(c => c.name).join(', ') : row.astrologerCategoryId || '--'}</td>
                    <td>{row.primarySkillList ? row.primarySkillList.map(s => s.name).join(', ') : row.primary_skill || '--'}</td>
                    <td>{row.allSkillsList ? row.allSkillsList.map(s => s.name).join(', ') : row.all_skills || '--'}</td>
                    <td>{row.chat_charge != null ? '\u20B9' + row.chat_charge : '--'}</td>
                    <td>{row.experience != null ? row.experience + ' yrs' : '--'}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => navigate(`/admin/ai-astrologer/edit/${row._id || row.id}`)} className="cust-action-btn cust-action-edit" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(row._id || row.id, row.name)} className="cust-action-btn cust-action-delete" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
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

export default AiAstrologerList;
