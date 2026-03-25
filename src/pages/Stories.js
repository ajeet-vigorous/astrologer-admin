import React, { useState, useEffect } from 'react';
import { storyApi } from '../api/services';

const Stories = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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

  const handleDelete = async () => {
    try { await storyApi.delete({ del_id: deleteId }); setShowDeleteModal(false); fetchData(); } catch (err) { console.error(err); }
  };

  const getImgSrc = (img) => {
    if (!img) return '/build/assets/images/person.png';
    if (img.startsWith('http')) return img;
    return '/' + img;
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
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries</div>
        <div style={styles.paginationButtons}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>Prev</button>
          {pages.map(p => (<button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}>Next</button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Stories</h2>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Profile', 'Name', 'Media Type', 'Media', 'Views', 'Created At', 'Action'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    <td style={styles.td}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
                        onClick={() => setViewerImg(getImgSrc(row.profileImage))}>
                        <img src={getImgSrc(row.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/build/assets/images/person.png'; }} />
                      </div>
                    </td>
                    <td style={styles.td}><span style={{ fontWeight: 500 }}>{row.name || '--'}</span></td>
                    <td style={styles.td}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: row.mediaType === 'video' ? '#e0e7ff' : '#d1fae5', color: row.mediaType === 'video' ? '#3730a3' : '#065f46', textTransform: 'capitalize' }}>
                        {row.mediaType || '--'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {row.mediaType === 'image' ? (
                        <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => setViewerImg('/' + row.media)}>
                          <img src={'/' + row.media} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      ) : row.mediaType === 'video' ? (
                        <video width="140" height="60" controls style={{ borderRadius: 6 }}>
                          <source src={'/' + row.media} type="video/mp4" />
                        </video>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>--</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{row.StoryViewCount || 0}</span>
                    </td>
                    <td style={styles.td}>{formatDate(row.created_at)}</td>
                    <td style={styles.td}>
                      <button onClick={() => { setDeleteId(row.id); setShowDeleteModal(true); }} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {showDeleteModal && (
        <div style={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Are you sure?</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>Do you really want to delete these records? This process cannot be undone.</p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...styles.addBtn, background: '#6b7280' }}>Cancel</button>
              <button onClick={handleDelete} style={{ ...styles.addBtn, background: '#ef4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {viewerImg && (
        <div style={styles.overlay} onClick={() => setViewerImg(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewerImg(null)} style={styles.closeBtn}>✕</button>
            <img src={viewerImg} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500, fontSize: 13 },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#7c3aed', color: '#fff', padding: '12px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #6d28d9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  rowEven: { background: '#f8f9fa' },
  rowOdd: { background: '#fff' },
  noData: { padding: '40px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 15 },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 400, width: '90%' },
  closeBtn: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
};

export default Stories;
