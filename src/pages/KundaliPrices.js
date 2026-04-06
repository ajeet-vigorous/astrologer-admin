import React, { useState, useEffect, useCallback } from 'react';
import { kundaliApi } from '../api/services';
import Loader from '../components/Loader';
import { ScrollText, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import '../styles/Customers.css';

const KundaliPrices = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ filed_id: '', price: '', price_usd: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kundaliApi.getPrices({ page });
      setData(res.data.kundaliAmount || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (item) => {
    setEditForm({ filed_id: item.id, price: item.price || '', price_usd: item.price_usd || '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await kundaliApi.editAmount(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getSmartPages = () => {
    if (!pagination) return [];
    const totalPages = pagination.totalPages;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    const filtered = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < filtered.length; i++) {
      if (i > 0 && filtered[i] - filtered[i - 1] > 1) {
        result.push('...');
      }
      result.push(filtered[i]);
    }
    return result;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const smartPages = getSmartPages();
    return (
      <div className="cust-pagination">
        <div className="cust-page-info">Showing {pagination.totalRecords === 0 ? 0 : pagination.start} to {pagination.end} of {pagination.totalRecords} entries</div>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn">
            <ChevronLeft size={16} />
          </button>
          {smartPages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn${p === page ? ' active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <ScrollText size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Kundali Prices</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading prices..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kundali Type</th>
                  <th>Amount (INR)</th>
                  <th>Amount (USD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No prices found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td className="cust-name-cell">{row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : '---'}</td>
                    <td>{row.price || '---'}</td>
                    <td>{row.price_usd || '---'}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => handleEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Amount</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="cust-form-group">
                  <label>Amount (INR)</label>
                  <input type="text" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="Amount" required />
                </div>
                <div className="cust-form-group">
                  <label>Amount (USD)</label>
                  <input type="text" value={editForm.price_usd} onChange={e => setEditForm({ ...editForm, price_usd: e.target.value })}
                    placeholder="Amount" required />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Update Amount</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KundaliPrices;
