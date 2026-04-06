import React, { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/services';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import { ShoppingBag, FileText, FileSpreadsheet, Search, X, ChevronLeft, ChevronRight, Calendar, Download, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

import getImgSrc from '../utils/getImageUrl';

const Orders = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);
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
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
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
  }, [page, search, dateApplied]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (val) => {
    setSearch(val !== undefined ? val : search);
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
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
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
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
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
    if (img.startsWith('public/')) return '/' + img; return '/public/' + img;
  };

  const openImageViewer = (img) => {
    setViewImage(img);
    setShowImageModal(true);
  };

  const handleDateSubmit = () => {
    setDateApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFromDate(moment().toDate());
    setToDate(moment().toDate());
    setDateApplied(false);
    setPage(1);
  };

  const hasRecords = pagination && pagination.totalRecords > 0;

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
            <h2 className="cust-title">Orders</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          {hasRecords && (
            <>
              <button onClick={handlePdf} className="cust-btn cust-btn-danger">
                <FileText size={15} /> PDF
              </button>
              <button onClick={handleCsv} className="cust-btn cust-btn-success">
                <FileSpreadsheet size={15} /> CSV
              </button>
            </>
          )}
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
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
              className="cust-input cust-search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="cust-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">From</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={fromDate}
                onChange={date => { setFromDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-group">
            <label className="cust-filter-label">To</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={toDate}
                onChange={date => { setToDate(date); setDateApplied(false); }}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-actions">
            <button onClick={handleDateSubmit} className="cust-btn cust-btn-primary">
              <Search size={13} /> Apply
            </button>
            {(search || dateApplied) && (
              <button onClick={clearFilters} className="cust-btn cust-btn-danger">
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cust-card">
        {/* Table */}
        {loading ? <Loader text="Loading orders..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Order Date</th>
                  <th>Order Status</th>
                  <th>Order Address</th>
                  <th>Change Status</th>
                  <th>Invoice Download</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} className="cust-no-data">No Data Available</td></tr>
                ) : (
                  data.map((order, i) => {
                    const imgSrc = getImageSrc(order.productImage || order.product?.productImage);
                    const status = order.orderStatus || order.status || '';
                    const isFinalized = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'delivered';
                    const address = order.orderAddress || order.address || {};
                    const addressStr = [address.flatNo, address.landmark, address.city, address.state, address.country ? `${address.country}-${address.pincode || ''}` : ''].filter(Boolean).join(', ');

                    return (
                      <tr key={order.id || i}>
                        <td>{(pagination?.start || 0) + i}</td>
                        <td className="cust-name-cell">{order.userName || order.user?.name || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {imgSrc && (
                              <img
                                src={imgSrc}
                                alt=""
                                className="cust-avatar"
                                style={{ borderRadius: 6, cursor: 'pointer' }}
                                onClick={() => openImageViewer(imgSrc)}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span>{order.productName || order.product?.name || '-'}</span>
                          </div>
                        </td>
                        <td>{currencySymbol || ''}{order.amount || order.totalAmount || '-'}</td>
                        <td className="cust-date-cell">{formatDate(order.orderDate || order.created_at || order.createdAt)}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#fff',
                            background: getStatusColor(status),
                            display: 'inline-block'
                          }}>
                            {status || '-'}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200, fontSize: 13 }}>{addressStr || '-'}</td>
                        <td>
                          {!isFinalized ? (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) openStatusChange(order, e.target.value);
                              }}
                              className="cust-input"
                              style={{ width: 'auto', minWidth: 100 }}
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
                        <td>
                          <button onClick={() => handleInvoiceDownload(order.id)} className="cust-btn cust-btn-info" style={{ padding: '6px 14px' }}>
                            <Download size={14} /> Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusModal && statusOrder && (
        <div className="cust-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cust-delete-content">
              <div className="cust-delete-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>Are You Sure?</h3>
              <p>You want to change status to {statusValue}!</p>
              <div className="cust-delete-actions">
                <button onClick={() => setShowStatusModal(false)} className="cust-btn cust-btn-ghost">Cancel</button>
                <button onClick={handleStatusConfirm} className="cust-btn cust-btn-primary">Yes, Change it!</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && viewImage && (
        <div className="cust-overlay" onClick={() => setShowImageModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90%', maxHeight: '90vh' }}>
            <button onClick={() => setShowImageModal(false)} style={{ position: 'absolute', top: -15, right: -15, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', zIndex: 10 }}>
              <X size={18} />
            </button>
            <img src={viewImage} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
