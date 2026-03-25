import React, { useState, useEffect } from 'react';
import { pujaApi } from '../api/services';

const AstrologerPuja = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [search, setSearch] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [approveStatus, setApproveStatus] = useState('');
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.searchString = search;
      const res = await pujaApi.getAstrologerList(params);
      const d = res.data || {};
      setData(d.pujalist || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) {
      console.error(err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchString);
    setPage(1);
  };

  const openApprove = (id, currentStatus) => {
    setApproveId(id);
    setApproveStatus(currentStatus);
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    try {
      await pujaApi.approveStatus({ filed_id: approveId });
      setShowApproveModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const isDatePassed = (datetime) => datetime && new Date() > new Date(datetime);

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const getPujaImages = (row) => {
    if (!row.puja_images || !Array.isArray(row.puja_images)) return [];
    return row.puja_images;
  };

  const openImageViewer = (images, startIdx) => {
    const srcs = images.map(img => getImgSrc(img)).filter(Boolean);
    if (srcs.length > 0) {
      setViewerImages(srcs);
      setViewerIndex(startIdx || 0);
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

  const getNewStatus = (s) => (s === 'Pending' || s === 'Rejected') ? 'Approved' : 'Rejected';

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div style={styles.paginationWrapper}>
        <div style={styles.showingText}>
          Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords} entries
        </div>
        <div style={styles.paginationButtons}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>Prev</button>
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}>Next</button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Astrologer Puja List</h2>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input value={searchString} onChange={(e) => setSearchString(e.target.value)}
            placeholder="Search by astrologer name..." style={styles.searchInput} />
          <button type="submit" style={styles.searchBtn}>Search</button>
          {search && (
            <button type="button" onClick={() => { setSearchString(''); setSearch(''); }}
              style={styles.clearBtn}>Clear</button>
          )}
        </form>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Astrologer', 'Puja Title', 'Puja Image', 'Puja Price', 'Puja Place', 'Puja Start', 'Duration', 'Actions'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => {
                  const images = getPujaImages(row);
                  return (
                    <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                      <td style={styles.td}><span style={{ fontWeight: 500 }}>{row.astrologerName || '--'}</span></td>
                      <td style={styles.td}>{row.puja_title || '--'}</td>
                      {/* Puja Images with carousel viewer */}
                      <td style={styles.td}>
                        {images.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <img src={getImgSrc(images[0])} alt="" style={styles.thumbImg}
                              onClick={() => openImageViewer(images, 0)}
                              onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
                            {images.length > 1 && (
                              <span style={styles.moreImages} onClick={() => openImageViewer(images, 0)}>
                                +{images.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={styles.defaultImgCircle}>
                            <img src="/build/assets/images/default.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>{row.puja_price ? `₹${row.puja_price}` : '--'}</td>
                      <td style={styles.td}>{row.puja_place || '--'}</td>
                      <td style={styles.td}>{formatDate(row.puja_start_datetime)}</td>
                      <td style={styles.td}>{row.puja_duration ? `${row.puja_duration} mins` : '--'}</td>
                      <td style={styles.td}>
                        {isDatePassed(row.puja_start_datetime) ? (
                          <span style={{ color: '#6b7280', fontSize: 12 }}>Date has been passed</span>
                        ) : (
                          <button onClick={() => openApprove(row.id, row.isAdminApproved)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                              color: (row.isAdminApproved === 'Pending' || row.isAdminApproved === 'Rejected') ? '#92400e' : '#059669'
                            }}>
                            {row.isAdminApproved || 'Pending'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </div>

      {/* Approve/Reject Modal */}
      {showApproveModal && (
        <div style={styles.overlay} onClick={() => setShowApproveModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Are You Sure?</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>You want to {getNewStatus(approveStatus)}?</p>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={handleApprove} style={styles.approveBtn}>Yes, {getNewStatus(approveStatus)} it!</button>
              <button onClick={() => setShowApproveModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer with Navigation */}
      {viewerImages.length > 0 && (
        <div style={styles.overlay} onClick={() => setViewerImages([])}>
          <div style={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewerImages([])} style={styles.closeBtn}>✕</button>
            {viewerImages.length > 1 && (
              <button onClick={() => setViewerIndex(i => (i - 1 + viewerImages.length) % viewerImages.length)}
                style={{ ...styles.navBtn, left: 10 }}>&#8249;</button>
            )}
            <img src={viewerImages[viewerIndex]} alt="" style={styles.viewerImg}
              onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
            {viewerImages.length > 1 && (
              <button onClick={() => setViewerIndex(i => (i + 1) % viewerImages.length)}
                style={{ ...styles.navBtn, right: 10 }}>&#8250;</button>
            )}
            {viewerImages.length > 1 && (
              <div style={styles.imgCounter}>{viewerIndex + 1} / {viewerImages.length}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' },
  searchRow: { display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  searchInput: { padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, width: 260, fontSize: 14 },
  searchBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  clearBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#7c3aed', color: '#fff', padding: '12px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #6d28d9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  rowEven: { background: '#f8f9fa' },
  rowOdd: { background: '#fff' },
  noData: { padding: '40px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 15 },
  thumbImg: { width: 44, height: 44, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' },
  defaultImgCircle: { width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb' },
  moreImages: { fontSize: 12, color: '#7c3aed', fontWeight: 600, cursor: 'pointer', background: '#f3f0ff', padding: '2px 8px', borderRadius: 10 },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, maxWidth: 420, width: '90%' },
  approveBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 22px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '8px 22px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  viewerContent: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 2 },
  navBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  viewerImg: { maxWidth: '85vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' },
  imgCounter: { position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 14, fontWeight: 600 }
};

export default AstrologerPuja;
