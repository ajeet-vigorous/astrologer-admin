import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { astroMallApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { ShoppingBag, Plus, Eye, Pencil, Trash2, FileText, FileSpreadsheet, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Customers.css';

import getImageUrl from '../utils/getImageUrl';

const AstroMallProducts = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown menu
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Add Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProductId, setDetailProductId] = useState(null);
  const [detailQuestion, setDetailQuestion] = useState('');
  const [detailAnswer, setDetailAnswer] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await astroMallApi.getProducts({ page, searchString: search });
      const d = res.data;
      setData(d.astromallProduct || []);
      setPagination({
        totalPages: d.totalPages || 0,
        totalRecords: d.totalRecords || 0,
        start: d.start || 0,
        end: d.end || 0,
        page: d.page || 1
      });
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      setSearch(searchInput);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Status toggle with SweetAlert2
  const handleStatusToggle = (item) => {
    const isActive = item.isActive === 1 || item.isActive === true;
    Swal.fire({
      title: 'Are You Sure?',
      text: `You want ${isActive ? 'Inactive' : 'Active'}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await astroMallApi.productStatus({ status_id: item.id });
          fetchData();
        } catch (err) {
          console.error('Error toggling status:', err);
        }
      }
    });
  };

  // Add Detail modal
  const openDetailModal = (productId) => {
    setDetailProductId(productId);
    setDetailQuestion('');
    setDetailAnswer('');
    setShowDetailModal(true);
    setOpenDropdown(null);
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      await astroMallApi.addProductDetail({
        productId: detailProductId,
        question: detailQuestion,
        answer: detailAnswer
      });
      setShowDetailModal(false);
      fetchData();
    } catch (err) {
      console.error('Error adding product detail:', err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This product will be deleted!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7c3aed', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, Delete' });
    if (result.isConfirmed) {
      try { await astroMallApi.deleteProduct({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const getImageSrc = (item) => {
    const img = item.productImage || item.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return getImageUrl(img);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${mon}-${year}`;
  };

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
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>
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
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <ShoppingBag size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Products</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/astromall/products/add')} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="cust-input cust-search-input"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="cust-filter-actions">
          <button onClick={handleSearch} className="cust-btn cust-btn-primary">
            <Search size={13} /> Search
          </button>
        </div>
      </div>

      <div className="cust-card">
        {/* Card Grid */}
        {loading ? (
          <Loader text="Loading products..." />
        ) : data.length === 0 ? (
          <div className="cust-no-data">No Data Available</div>
        ) : (
          <div className="mall-card-grid">
            {data.map((item) => {
              const imgSrc = getImageSrc(item);
              const isActive = item.isActive === 1 || item.isActive === true;
              const categoryName = item.productCategory?.name || item.categoryName || '-';
              return (
                <div key={item.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {/* Image area */}
                  <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', background: '#e5e7eb' }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>No Image</div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />

                    {/* Three-dot dropdown */}
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} ref={openDropdown === item.id ? dropdownRef : null}>
                      <button onClick={() => toggleDropdown(item.id)} style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>&#8942;</button>
                      {openDropdown === item.id && (
                        <div style={{ position: 'absolute', right: 0, top: 35, background: '#fff', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 150, overflow: 'hidden', zIndex: 20 }}>
                          <div onClick={() => { navigate(`/admin/astromall/products/view/${item.id}`); setOpenDropdown(null); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={14} /> View Product
                          </div>
                          <div onClick={() => { navigate(`/admin/astromall/products/edit/${item.id}`); setOpenDropdown(null); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Pencil size={14} /> Edit Product
                          </div>
                          <div onClick={() => openDetailModal(item.id)} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={14} /> Add Detail
                          </div>
                          <div onClick={() => { setOpenDropdown(null); handleDelete(item.id); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Trash2 size={14} /> Delete
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Name + date overlay */}
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{item.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>{formatDate(item.created_at || item.createdAt)}</div>
                    </div>
                  </div>

                  {/* Info section */}
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                      <span style={{ fontWeight: 600, color: '#6b7280' }}>Amount (INR):</span> <span>{item.amount || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                      <span style={{ fontWeight: 600, color: '#6b7280' }}>Amount (USD):</span> <span>{item.usd_amount || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                      <span style={{ fontWeight: 600, color: '#6b7280' }}>Product Category:</span> <span>{categoryName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                      <span style={{ fontWeight: 600, color: '#6b7280' }}>Features:</span> <span style={{ fontSize: 12, color: '#94a3b8', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.features ? (item.features.length > 50 ? item.features.slice(0, 50) + '...' : item.features) : '-'}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                    <button onClick={() => handleDelete(item.id)} className="cust-action-btn cust-action-delete" title="Delete">
                      <Trash2 size={14} />
                    </button>
                    <div className="cust-toggle-wrap">
                      <div className={`cust-toggle ${isActive ? 'on' : ''}`} onClick={() => handleStatusToggle(item)}>
                        <div className="cust-toggle-knob" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Add Product Detail Modal */}
      {showDetailModal && (
        <div className="cust-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Product Detail</h3>
              <button onClick={() => setShowDetailModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleDetailSubmit} className="cust-modal-body">
              <div className="cust-form-group">
                <label>Question <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={detailQuestion}
                  onChange={(e) => setDetailQuestion(e.target.value)}
                  placeholder="Enter question"
                  required
                />
              </div>
              <div className="cust-form-group">
                <label>Answer <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={detailAnswer}
                  onChange={(e) => setDetailAnswer(e.target.value)}
                  placeholder="Enter answer"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">Add</button>
                <button type="button" onClick={() => setShowDetailModal(false)} className="cust-btn cust-btn-ghost cust-btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstroMallProducts;
