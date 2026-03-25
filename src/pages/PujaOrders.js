import React, { useState, useEffect } from 'react';
import { pujaApi } from '../api/services';

const PujaOrders = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [currency, setCurrency] = useState('₹');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewerImg, setViewerImg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await pujaApi.getOrders(params);
      const d = res.data || {};
      setData(d.pujaOrderlist || []);
      setAstrologers(d.astrologers || []);
      setCurrency(d.currency?.value || '₹');
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

  useEffect(() => { fetchData(); }, [page, fromDate, toDate]);

  const handleAssign = async (orderId, astrologerId) => {
    try {
      await pujaApi.updateOrder({ puja_order_id: orderId, astrologer_id: astrologerId });
      alert('Astrologer assigned successfully!');
    } catch (err) { console.error(err); }
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

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const getPujaImages = (row) => {
    if (!row.puja_images || !Array.isArray(row.puja_images)) return [];
    return row.puja_images;
  };

  const getAddress = (row) => {
    return [row.address_flatno, row.address_locality, row.address_landmark, row.address_city, row.address_state, row.address_country, row.address_pincode].filter(Boolean).join(', ') || '--';
  };

  const handleFilter = () => { setPage(1); fetchData(); };
  const handleClear = () => { setFromDate(''); setToDate(''); setPage(1); };

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
          <h2 style={styles.title}>Puja Order List</h2>
        </div>

        {/* Date Filters */}
        <div style={styles.filterRow}>
          <label style={styles.filterLabel}>From:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.dateInput} />
          <label style={styles.filterLabel}>To:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.dateInput} />
          <button onClick={handleFilter} style={styles.filterBtn}>Filter</button>
          <button onClick={handleClear} style={styles.clearBtn}>Clear</button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Astrologer', 'User', 'Contact', 'Address', 'Puja', 'Puja Images', 'Package', 'Price', 'Date', 'Status'].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={11} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * 15 + index + 1}</td>
                    {/* Astrologer dropdown */}
                    <td style={styles.td}>
                      <select value={row.astrologer_id || ''} onChange={(e) => handleAssign(row.id, e.target.value)}
                        style={styles.selectDropdown}>
                        <option value="" disabled>--Select--</option>
                        {astrologers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </td>
                    {/* User with profile image */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={styles.profileCircle}>
                          {row.userProfile ? (
                            <img src={getImgSrc(row.userProfile)} alt="" style={styles.profileImg}
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div style={{ ...styles.profileFallback, display: row.userProfile ? 'none' : 'flex' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </div>
                        </div>
                        <span>{row.userName || '--'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{row.contactNo || '--'}</td>
                    <td style={{ ...styles.td, maxWidth: 200, whiteSpace: 'normal' }}>{getAddress(row)}</td>
                    <td style={styles.td}>{row.puja_name || row.puja_name_from_puja || '--'}</td>
                    {/* Puja Images */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {getPujaImages(row).length > 0 ? (
                          getPujaImages(row).slice(0, 3).map((img, imgIdx) => (
                            <img key={imgIdx} src={getImgSrc(img)} alt="" style={styles.thumbImg}
                              onClick={() => setViewerImg(getImgSrc(img))}
                              onError={(e) => { e.target.style.display = 'none'; }} />
                          ))
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 12 }}>No Images</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>{row.package_name || '--'}</td>
                    <td style={styles.td}>{currency} {row.order_total_price ? Number(row.order_total_price).toFixed(2) : '0.00'}</td>
                    <td style={styles.td}>{formatDate(row.created_at)}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: row.puja_order_status === 'Completed' ? '#d1fae5' : row.puja_order_status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                        color: row.puja_order_status === 'Completed' ? '#065f46' : row.puja_order_status === 'Cancelled' ? '#991b1b' : '#92400e'
                      }}>
                        {row.puja_order_status || '--'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </div>

      {/* Image Viewer Modal */}
      {viewerImg && (
        <div style={styles.overlay} onClick={() => setViewerImg(null)}>
          <div style={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewerImg(null)} style={styles.closeBtn}>✕</button>
            <img src={viewerImg} alt="" style={styles.viewerImg} />
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
  filterRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' },
  filterLabel: { fontWeight: 600, fontSize: 14, color: '#374151' },
  dateInput: { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  filterBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  clearBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#7c3aed', color: '#fff', padding: '12px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #6d28d9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  rowEven: { background: '#f8f9fa' },
  rowOdd: { background: '#fff' },
  noData: { padding: '40px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 15 },
  selectDropdown: { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, width: 150 },
  profileCircle: { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' },
  profileImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' },
  thumbImg: { width: 40, height: 40, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' },
  paginationWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 },
  showingText: { fontSize: 13, color: '#6b7280' },
  paginationButtons: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  viewerContent: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh' },
  closeBtn: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  viewerImg: { maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }
};

export default PujaOrders;
