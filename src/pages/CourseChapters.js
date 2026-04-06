import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { courseApi } from '../api/services';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const CourseChapters = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getChapters({ page });
      const d = res.data || {};
      setData(d.chapters || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleStatusToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await courseApi.chapterStatus({ status_id: id });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await courseApi.deleteChapter({ del_id: id });
        Swal.fire({ title: 'Deleted!', text: 'Chapter has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };


  const getChapterImages = (row) => {
    if (!row.chapter_images || !Array.isArray(row.chapter_images)) return [];
    return row.chapter_images;
  };

  const truncate = (text, len = 50) => {
    if (!text) return '--';
    return text.length > len ? text.substring(0, len) + '...' : text;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      let s = Math.max(2, page - 1);
      let e = Math.min(totalPages - 1, page + 1);
      for (let i = s; i <= e; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <GraduationCap size={20} className="cust-topbar-icon" />
          <h2 className="cust-title">Course Chapters</h2>
          <span className="cust-count">({totalRecords} total)</span>
        </div>
        <div className="cust-topbar-right">
          <button className="cust-btn cust-btn-primary" onClick={() => navigate('/admin/course-chapter/add')}>
            <Plus size={15} /> Add Chapter
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
                <th>Chapter Name</th>
                <th>Course</th>
                <th>Images</th>
                <th>YouTube</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="cust-no-data">
                    <Loader size={22} className="spinning-loader" /> Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="cust-no-data">No Data Available</td></tr>
              ) : (
                data.map((row, index) => {
                  const images = getChapterImages(row);
                  return (
                    <tr key={row.id || index}>
                      <td>{(page - 1) * 15 + index + 1}</td>
                      <td className="cust-name-cell">{row.chapter_name || '--'}</td>
                      <td>{row.course_name || '--'}</td>
                      <td>
                        {images.length > 0 ? (
                          <div className="cust-actions">
                            {images.slice(0, 3).map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={getImgSrc(img)}
                                alt=""
                                className="cust-avatar"
                                onClick={() => setViewerImg(getImgSrc(img))}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ))}
                            {images.length > 3 && (
                              <span className="cust-verify-badge verified">+{images.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="cust-date-cell">No Images</span>
                        )}
                      </td>
                      <td>
                        {row.youtube_link ? (
                          <a href={row.youtube_link} target="_blank" rel="noreferrer" className="cust-verify-badge verified">View Link</a>
                        ) : <span className="cust-date-cell">--</span>}
                      </td>
                      <td className="cust-date-cell" title={row.chapter_description}>{truncate(row.chapter_description)}</td>
                      <td>
                        <div
                          className={`cust-toggle ${row.isActive ? 'on' : ''}`}
                          onClick={() => handleStatusToggle(row.id)}
                        >
                          <div className="cust-toggle-knob"></div>
                        </div>
                      </td>
                      <td>
                        <div className="cust-actions">
                          <button className="cust-action-btn cust-action-view" onClick={() => navigate(`/admin/course-chapter/edit/${row.id}`)} title="View">
                            <Eye size={15} />
                          </button>
                          <button className="cust-action-btn cust-action-edit" onClick={() => navigate(`/admin/course-chapter/edit/${row.id}`)} title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button className="cust-action-btn cust-action-delete" onClick={() => handleDelete(row.id)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination */}
        <div className="cust-pagination">
          <div className="cust-page-info">
            Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
          </div>
          <div className="cust-page-btns">
            <button className="cust-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={15} />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="cust-page-dots">...</span>
              ) : (
                <button key={p} className={`cust-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )
            )}
            <button className="cust-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button className="cust-modal-close" onClick={() => setViewerImg(null)} style={{ position: 'absolute', top: -12, right: -12, background: '#fff', borderRadius: '50%', width: 32, height: 32, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <X size={16} />
            </button>
            <img src={viewerImg} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseChapters;
