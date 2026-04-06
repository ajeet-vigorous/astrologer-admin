import React, { useState, useEffect, useCallback } from 'react';
import { appDesignApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { Palette, ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../styles/Customers.css';

const AppDesign = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appDesignApi.getAll({ page });
      setData(res.data.appdesign || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async (id) => {
    const result = await Swal.fire({
      title: 'Are You Sure?',
      text: 'You want to change status!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change it!'
    });
    if (result.isConfirmed) {
      try {
        await appDesignApi.status({ status_id: id });
        Swal.fire({ title: 'Updated!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to change status', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const current = page;
    let pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('dots-start');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('dots-end');
      pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn">
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === current ? 'active' : ''}`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn">
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
          <Palette size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">App Design</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
      </div>

      {/* Card + Table */}
      <div className="cust-card">
        {loading ? <Loader text="Loading app designs..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Images</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="cust-no-data">No app designs found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td>
                      <div className="cust-actions">
                        {(Array.isArray(row.image) ? row.image.slice(0, 3) : []).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.startsWith('http') ? img : '/' + img}
                            alt=""
                            className="cust-avatar"
                            onClick={() => setImageModal({ open: true, src: img.startsWith('http') ? img : '/' + img })}
                            onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="cust-name-cell">{row.title || '--'}</td>
                    <td>
                      <span className={`cust-verify-badge ${row.is_active ? 'verified' : 'unverified'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleStatus(row.id)} className="cust-btn cust-btn-primary">
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Image Preview Modal */}
      {imageModal.open && (
        <div className="cust-overlay" onClick={() => setImageModal({ open: false, src: '' })}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Image Preview</h3>
              <button onClick={() => setImageModal({ open: false, src: '' })} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <img src={imageModal.src} alt="Full View" className="cust-img-preview" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDesign;
