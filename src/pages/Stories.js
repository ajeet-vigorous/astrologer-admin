import React, { useState, useEffect } from 'react';
import { storyApi } from '../api/services';
import Loader from '../components/Loader';
import { BookOpen, Trash2, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const Stories = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await storyApi.getAll({ page });
      const d = res.data || {};
      setData(d.story || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete these records? This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await storyApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };


  const formatDate = (d) => {
    if (!d) return '--';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    let hh = dt.getHours();
    const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12 || 12;
    return `${dd}-${mm}-${yyyy} ${String(hh).padStart(2, '0')}:${min} ${ampm}`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      const pages = new Set([1, totalPages]);
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.add(i);
      }
      const sorted = [...pages].sort((a, b) => a - b);
      const result = [];
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
          result.push('...');
        }
        result.push(sorted[i]);
      }
      return result;
    };

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">
          Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
        </span>
        <div className="cust-page-btns">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cust-page-btn"
          >
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="cust-page-dots">...</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`cust-page-btn ${p === page ? 'active' : ''}`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cust-page-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <BookOpen size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Stories</h2>
            <div className="cust-count">{totalRecords} total stories</div>
          </div>
        </div>
        <div className="cust-topbar-right" />
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading stories..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Media Type</th>
                  <th>Media</th>
                  <th>Views</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="cust-no-data">No Data Available</td></tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{(page - 1) * 15 + index + 1}</td>
                      <td>
                        <img
                          src={getImgSrc(row.profileImage)}
                          alt=""
                          className="cust-avatar"
                          onClick={() => setViewerImg(getImgSrc(row.profileImage))}
                          onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
                        />
                      </td>
                      <td className="cust-name-cell">{row.name || '--'}</td>
                      <td>
                        <span className={`cust-req-badge ${row.mediaType === 'video' ? 'purple' : 'blue'}`}>
                          {row.mediaType || '--'}
                        </span>
                      </td>
                      <td>
                        {row.mediaType === 'image' ? (
                          <img
                            src={'/' + row.media}
                            alt=""
                            className="cust-img-preview"
                            onClick={() => setViewerImg('/' + row.media)}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : row.mediaType === 'video' ? (
                          <video width="140" height="60" controls className="cust-img-preview">
                            <source src={'/' + row.media} type="video/mp4" />
                          </video>
                        ) : (
                          <span className="cust-date-cell">--</span>
                        )}
                      </td>
                      <td>
                        <span className="cust-req-badge blue">{row.StoryViewCount || 0}</span>
                      </td>
                      <td className="cust-date-cell">{formatDate(row.created_at)}</td>
                      <td>
                        <div className="cust-actions">
                          <button
                            onClick={() => {
                              if (row.mediaType === 'image' && row.media) {
                                setViewerImg('/' + row.media);
                              } else if (row.profileImage) {
                                setViewerImg(getImgSrc(row.profileImage));
                              }
                            }}
                            className="cust-action-btn cust-action-view"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="cust-action-btn cust-action-delete"
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
        )}
        {renderPagination()}
      </div>

      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Image Preview</h3>
              <button className="cust-modal-close" onClick={() => setViewerImg(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cust-modal-body">
              <img
                src={viewerImg}
                alt="Preview"
                onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
