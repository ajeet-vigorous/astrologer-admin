import React, { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/services';

const Orders = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [loading, setLoading] = useState(false);

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [statusValue, setStatusValue] = useState('');

  // Image viewer modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewImage, setViewImage] = useState('');

  const statusOptions = ['Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, searchString: search };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await orderApi.getAll(params);
      const d = res.data.data || res.data;
      setData(d.orderRequest || []);
      setCurrencySymbol(d.currencySymbol || '');
      setPagination({
        totalPages: d.totalPages || 0,
        totalRecords: d.totalRecords || 0,
        start: d.start || 0,
        end: d.end || 0,
        page: d.page || 1
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  }, [page, search, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleFilter = () => {
    setPage(1);
    fetchData();
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${mon}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  };

  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    const s = status.toLowerCase();
    if (s === 'confirmed' || s === 'delivered') return '#10b981';
    if (s === 'pending' || s === 'cancelled') return '#ef4444';
    if (s === 'packed') return '#3b82f6';
    if (s === 'dispatched') return '#f59e0b';
    return '#6b7280';
  };

  const openStatusChange = (order, newStatus) => {
    setStatusOrder(order);
    setStatusValue(newStatus);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusOrder) return;
    try {
      await orderApi.changeStatus({
        id: statusOrder.id,
        status: statusValue,
        userId: statusOrder.userId || statusOrder.user_id
      });
      setShowStatusModal(false);
      setStatusOrder(null);
      setStatusValue('');
      fetchData();
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleInvoiceDownload = async (orderId) => {
    try {
      const res = await orderApi.downloadInvoice(orderId);
      // Open blob or URL in new tab
      if (res.data) {
        const url = typeof res.data === 'string' ? res.data : window.URL.createObjectURL(new Blob([res.data]));
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  const handlePdf = async () => {
    try {
      const params = { searchString: search };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await orderApi.printPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const handleCsv = async () => {
    try {
      const params = { searchString: search };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await orderApi.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.csv';
      link.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const openImageViewer = (img) => {
    setViewImage(img);
    setShowImageModal(true);
  };

  const totalPages = pagination?.totalPages || 0;
  const hasRecords = pagination && pagination.totalRecords > 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Orders</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasRecords && (
            <>
              <button onClick={handlePdf} style={styles.pdfBtn}>PDF</button>
              <button onClick={handleCsv} style={styles.csvBtn}>CSV</button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchBtn}>Search</button>
      </div>

      {/* Date filter */}
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.dateInput} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.dateInput} />
        </div>
        <button onClick={handleFilter} style={styles.filterBtn}>Filter</button>
        <button onClick={handleClear} style={styles.clearBtn}>Clear</button>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Order Date</th>
                <th style={styles.th}>Order Status</th>
                <th style={styles.th}>Order Address</th>
                <th style={styles.th}>Change Status</th>
                <th style={styles.th}>Invoice Download</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={styles.noData}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} style={styles.noData}>No Data Available</td></tr>
              ) : (
                data.map((order, i) => {
                  const imgSrc = getImageSrc(order.productImage || order.product?.productImage);
                  const status = order.orderStatus || order.status || '';
                  const isFinalized = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'delivered';
                  const address = order.orderAddress || order.address || {};
                  const addressStr = [address.flatNo, address.landmark, address.city, address.state, address.country ? `${address.country}-${address.pincode || ''}` : ''].filter(Boolean).join(', ');

                  return (
                    <tr key={order.id || i} style={styles.tr}>
                      <td style={styles.td}>{(pagination?.start || 0) + i}</td>
                      <td style={styles.td}>{order.userName || order.user?.name || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {imgSrc && (
                            <img
                              src={imgSrc}
                              alt=""
                              style={styles.productThumb}
                              onClick={() => openImageViewer(imgSrc)}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span>{order.productName || order.product?.name || '-'}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {currencySymbol || ''}{order.amount || order.totalAmount || '-'}
                      </td>
                      <td style={styles.td}>{formatDate(order.orderDate || order.created_at || order.createdAt)}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#fff',
                          background: getStatusColor(status)
                        }}>
                          {status || '-'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, maxWidth: 200, fontSize: 13 }}>{addressStr || '-'}</td>
                      <td style={styles.td}>
                        {!isFinalized ? (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) openStatusChange(order, e.target.value);
                            }}
                            style={styles.statusSelect}
                          >
                            <option value="">Change</option>
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 13 }}>-</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleInvoiceDownload(order.id)} style={styles.downloadBtn}>
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalRecords > 0 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
          </span>
          <div style={styles.pageButtons}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                style={{
                  ...styles.pageBtn,
                  background: pagination.page === i + 1 ? '#7c3aed' : '#fff',
                  color: pagination.page === i + 1 ? '#fff' : '#374151',
                  border: pagination.page === i + 1 ? '1px solid #7c3aed' : '1px solid #d1d5db'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && statusOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
          <div style={styles.statusModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.statusModalBody}>
              <div style={styles.statusIcon}>!</div>
              <h3 style={{ margin: '10px 0 5px', fontSize: 20 }}>Are You Sure?</h3>
              <p style={{ color: '#6b7280', margin: '5px 0 20px' }}>
                You want to change status to {statusValue}!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button onClick={handleStatusConfirm} style={styles.yesBtn}>Yes, Change it!</button>
                <button onClick={() => setShowStatusModal(false)} style={styles.cancelStatusBtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && viewImage && (
        <div style={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div style={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowImageModal(false)} style={styles.imageModalClose}>&times;</button>
            <img src={viewImage} alt="" style={styles.imageModalImg} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: '#1f2937' },
  pdfBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  csvBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  searchBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 13, fontWeight: 600, color: '#6b7280' },
  dateInput: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  filterBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, alignSelf: 'flex-end' },
  clearBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, alignSelf: 'flex-end' },

  // Table
  tableWrapper: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '12px 14px', textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: 13 },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 14px', verticalAlign: 'middle', color: '#374151' },
  noData: { textAlign: 'center', padding: 40, color: '#9ca3af' },
  productThumb: { width: 40, height: 40, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', border: '1px solid #e5e7eb' },
  statusSelect: { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#fff', cursor: 'pointer' },
  downloadBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 },

  // Pagination
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 10 },
  pageInfo: { fontSize: 14, color: '#6b7280' },
  pageButtons: { display: 'flex', gap: 6 },
  pageBtn: { padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  // Status Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  statusModalContent: { background: '#fff', borderRadius: 10, width: '90%', maxWidth: 400, overflow: 'hidden' },
  statusModalBody: { textAlign: 'center', padding: '30px 20px' },
  statusIcon: { width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 },
  yesBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelStatusBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },

  // Image Modal
  imageModalContent: { position: 'relative', maxWidth: '90%', maxHeight: '90vh' },
  imageModalClose: { position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', zIndex: 10 },
  imageModalImg: { maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }
};

export default Orders;
