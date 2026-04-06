import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { documentApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/Customers.css';

const AstrologerDocuments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [editForm, setEditForm] = useState({ filed_id: '', name: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getAll({ page });
      setData(res.data.document || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await documentApi.add({ name }); setShowAddModal(false); setName(''); fetchData(); } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await documentApi.edit(editForm); setShowEditModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await documentApi.delete({ del_id: id });
        fetchData();
        Swal.fire('Deleted!', 'Document has been deleted.', 'success');
      } catch (err) { console.error(err); }
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <FileText size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Astrologer Documents</h2>
          {pagination && <span className="cust-count">({pagination.totalRecords} total)</span>}
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Document
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        {loading ? <Loader /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan="3" className="cust-no-data">No documents found</td></tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id || row._id || i}>
                      <td>{(pagination?.start || 0) + i}</td>
                      <td className="cust-name-cell">{row.name}</td>
                      <td>
                        <div className="cust-actions">
                          <button
                            className="cust-action-btn cust-action-edit"
                            title="Edit"
                            onClick={() => { setEditForm({ filed_id: row.id, name: row.name }); setShowEditModal(true); }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="cust-action-btn cust-action-delete"
                            title="Delete"
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="cust-pagination">
            <span className="cust-page-info">
              Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}
            </span>
            <div className="cust-page-btns">
              <button className="cust-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`cust-page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="cust-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Document</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter document name" />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add Document</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Document</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologerDocuments;
