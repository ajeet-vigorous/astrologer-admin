import React, { useState, useEffect, useCallback } from 'react';
import { aiAstrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { MessageSquare, FileText, FileSpreadsheet, Search, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const AiChatHistory = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [dateApplied, setDateApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await aiAstrologerApi.getChatHistory(params);
      const d = res.data.data || res.data.chatHistory || res.data.result || [];
      setData(Array.isArray(d) ? d : []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching AI chat history:', err);
    }
    setLoading(false);
  }, [page, search, dateApplied]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportCsv = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await aiAstrologerApi.exportChatCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ai-chat-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handlePrintPdf = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (dateApplied && fromDate) params.from_date = moment(fromDate).format('YYYY-MM-DD');
      if (dateApplied && toDate) params.to_date = moment(toDate).format('YYYY-MM-DD');
      const res = await aiAstrologerApi.printChatPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const win = window.open(url);
      if (win) win.print();
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  const formatChatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--';
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    if (isNaN(totalSeconds)) return '--';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

  const startIndex = pagination ? pagination.start : ((page - 1) * 15 + 1);

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
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === (pagination.page || page) ? 'active' : ''}`}>
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
      {/* Page Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <MessageSquare size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">AI Chat History</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={handlePrintPdf} className="cust-btn cust-btn-danger">
            <FileText size={15} /> PDF
          </button>
          <button onClick={handleExportCsv} className="cust-btn cust-btn-success">
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-group cust-filter-search-group">
          <label className="cust-filter-label">Search</label>
          <div className="cust-filter-search">
            <Search size={14} className="cust-search-icon" />
            <input
              type="text"
              placeholder="Search by user name, contact, astrologer name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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
        {loading ? <Loader text="Loading chat history..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Astrologer Name</th>
                  <th>Chat Rate</th>
                  <th>Chat Time</th>
                  <th>Total Min</th>
                  <th>Deduction</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7} className="cust-no-data">No chat history found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row._id || row.id || i}>
                    <td>{startIndex + i}</td>
                    <td>
                      <div className="cust-name-cell">
                        <div>{row.user_name || row.user?.name || '--'}</div>
                        <small style={{ color: '#6b7280' }}>{row.user_contact || row.user?.contact || row.user?.phone || ''}</small>
                      </div>
                    </td>
                    <td>{row.astrologer_name || row.astrologer?.name || '--'}</td>
                    <td>{row.chat_rate != null ? row.chat_rate : '--'}</td>
                    <td>{formatChatTime(row.chat_time || row.chat_duration)}</td>
                    <td>{row.total_min != null ? row.total_min : (row.totalMinutes || '--')}</td>
                    <td>{row.deduction != null ? row.deduction : '--'}</td>
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

export default AiChatHistory;
