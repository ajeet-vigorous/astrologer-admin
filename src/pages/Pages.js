import React, { useState, useEffect, useCallback } from 'react';
import { FileStack, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';
import { pageApi } from '../api/services';
import '../styles/Customers.css';

const PAGE_TYPES = [
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'aboutus', label: 'About Us' },
  { value: 'refundpolicy', label: 'Refund Policy' },
  { value: 'astrologerPrivacy', label: 'Astrologer Privacy Policy' },
  { value: 'astrologerTerms', label: 'Astrologer Terms & Conditions' },
  { value: 'others', label: 'Others' }
];

const ITEMS_PER_PAGE = 10;

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: '', description: '' });
  const [editForm, setEditForm] = useState({ filed_id: '', title: '', type: '', description: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pageApi.getAll();
      setPages(res.data.pages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(pages.length / ITEMS_PER_PAGE);
  const paginatedPages = pages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await pageApi.add(form);
      setShowAddModal(false);
      setForm({ title: '', type: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await pageApi.edit(editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatus = async (id) => {
    try {
      await pageApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
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
        await pageApi.delete({ del_id: id });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const getTypeLabel = (type) => {
    const found = PAGE_TYPES.find(t => t.value === type);
    return found ? found.label : type || '--';
  };

  const getPaginationButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items = [];
    items.push(1);
    if (currentPage > 3) items.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(i);
    }
    if (currentPage < totalPages - 2) items.push('...');
    items.push(totalPages);
    return items;
  };

  if (loading) return <Loader />;

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <FileStack size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Pages</h2>
          <span className="cust-count">({pages.length} total)</span>
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Page
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="cust-card">
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="cust-no-data">No pages found</td>
                </tr>
              ) : (
                paginatedPages.map((page, idx) => (
                  <tr key={page.id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td className="cust-name-cell">{page.title}</td>
                    <td>{getTypeLabel(page.type)}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{ __html: page.description }}
                        className="cust-desc-cell"
                      />
                    </td>
                    <td>
                      <span
                        className={`cust-verify-badge ${page.isActive ? 'verified' : 'unverified'}`}
                        onClick={() => handleStatus(page.id)}
                      >
                        {page.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button
                          className="cust-action-btn cust-action-edit"
                          onClick={() => {
                            setEditForm({
                              filed_id: page.id,
                              title: page.title,
                              type: page.type,
                              description: page.description || ''
                            });
                            setShowEditModal(true);
                          }}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="cust-action-btn cust-action-delete"
                          onClick={() => handleDelete(page.id)}
                          title="Delete"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cust-pagination">
            <span className="cust-page-info">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              {' '}-{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, pages.length)} of {pages.length}
            </span>
            <div className="cust-page-btns">
              <button
                className="cust-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationButtons().map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="cust-page-dots">...</span>
                ) : (
                  <button
                    key={item}
                    className={`cust-page-btn ${currentPage === item ? 'active' : ''}`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                className="cust-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Page</h3>
              <button className="cust-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleAdd}>
                <div className="cust-form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Enter title"
                  />
                </div>
                <div className="cust-form-group">
                  <label>Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="">-- Select Type --</option>
                    {PAGE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="cust-form-group">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={6}
                  />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
                  <Plus size={16} /> Add Page
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Page</h3>
              <button className="cust-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="cust-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cust-form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="cust-form-group">
                  <label>Type *</label>
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    required
                  >
                    <option value="">-- Select Type --</option>
                    {PAGE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="cust-form-group">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    rows={6}
                  />
                </div>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
