import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pujaApi } from '../api/services';
import Loader from '../components/Loader';
import { HandHeart, Eye, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const PujaList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pujaApi.getList({ page });
      setData(res.data.pujalist || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async (id) => {
    try {
      await pujaApi.status({ status_id: id });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this puja? This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await pujaApi.delete({ del_id: row.id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const getImgSrc = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return '/build/assets/images/default.jpg';
    const img = images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('public/')) return '/' + img; return '/public/' + img;
  };

  const isDatePassed = (datetime) => {
    if (!datetime) return false;
    return new Date() > new Date(datetime);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-start');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('dots-end');
      pages.push(total);
    }

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={idx} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page >= total} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <HandHeart size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Puja List</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => navigate('/admin/puja/add')} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Puja
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading puja list..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Sub Title</th>
                  <th>Puja Place</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="cust-no-data">No pujas found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td>
                      <img
                        src={getImgSrc(row.puja_images)}
                        alt={row.puja_title}
                        className="cust-avatar"
                        onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }}
                      />
                    </td>
                    <td className="cust-name-cell">{row.puja_title || '--'}</td>
                    <td>{row.puja_subtitle || '--'}</td>
                    <td>{row.puja_place || '--'}</td>
                    <td>
                      <span
                        onClick={() => handleStatus(row.id)}
                        className={`cust-verify-badge ${row.puja_status ? 'verified' : 'unverified'}`}
                      >
                        {row.puja_status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => navigate(`/admin/puja/view/${row.id}`)} className="cust-action-btn cust-action-view" title="View"><Eye size={15} /></button>
                        <button onClick={() => navigate(`/admin/puja/edit/${row.id}`)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(row)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                    <td>
                      {isDatePassed(row.puja_start_datetime) && (
                        <span className="cust-verify-badge unverified">(Date has been passed)</span>
                      )}
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

export default PujaList;
