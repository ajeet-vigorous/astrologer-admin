import React, { useState, useEffect } from 'react';
import { horoscopeApi } from '../api/services';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { Star, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Customers.css';

const WeeklyHoroscope = () => {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [filterDate, setFilterDate] = useState(today);
  const [inputDate, setInputDate] = useState(moment().toDate());
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await horoscopeApi.getWeeklyList({ page, filterDate });
      const d = res.data?.data || res.data || {};
      setData(d.weeklyHoroscope || d.dailyHoroscope || d.recordList || d.list || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) {
      console.error('Error fetching weekly horoscopes:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, filterDate]);

  const handleApply = () => {
    setPage(1);
    setFilterDate(moment(inputDate).format('YYYY-MM-DD'));
  };

  const getFirst5Words = (text) => {
    if (!text) return '-';
    const words = text.split(/\s+/);
    return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : text;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) items.push(i); }
    else {
      items.push(1);
      if (page > 3) items.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
      if (page < totalPages - 2) items.push('...');
      items.push(totalPages);
    }
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {items.map((p, i) => p === '...' ? <span key={`d${i}`} className="cust-page-dots">...</span> : (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Star size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Weekly Horoscope</h2>
            <div className="cust-count">{totalRecords} total</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={async () => { try { const r = await horoscopeApi.generateWeekly(); toast.success(r.data?.message || 'Weekly horoscope generated!'); fetchData(); } catch(e) { toast.error('Generation failed'); } }} className="cust-btn cust-btn-success">
            <Star size={15} /> Generate Weekly
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cust-filterbar">
        <div className="cust-filter-date-row">
          <div className="cust-filter-group">
            <label className="cust-filter-label">Date</label>
            <div className="cust-datepicker-wrap">
              <Calendar size={14} className="cust-datepicker-icon" />
              <DatePicker
                selected={inputDate}
                onChange={date => setInputDate(date)}
                dateFormat="dd MMM yyyy"
                className="cust-input cust-datepicker-input"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="cust-filter-actions">
            <button onClick={handleApply} className="cust-btn cust-btn-primary">
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading weekly horoscopes..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  {['#', 'Zodiac', 'Lucky Color', 'Lucky Color Code', 'Lucky Number', 'Total Score', 'Physique', 'Status', 'Finances', 'Relationship', 'Career', 'Travel', 'Family', 'Friends', 'Health', 'Response', 'Date'].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="cust-no-data">No Data Available</td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{(page - 1) * 15 + index + 1}</td>
                      <td>{row.zodiac || '-'}</td>
                      <td>{row.lucky_color || '-'}</td>
                      <td>
                        {row.lucky_color_code ? (
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.3)', backgroundColor: row.lucky_color_code }}>
                            {row.lucky_color_code}
                          </span>
                        ) : '-'}
                      </td>
                      <td>{row.lucky_number ?? '-'}</td>
                      <td>{row.total_score ?? '-'}</td>
                      <td>{row.physique ?? '-'}</td>
                      <td>{row.status ?? '-'}</td>
                      <td>{row.finances ?? '-'}</td>
                      <td>{row.relationship ?? '-'}</td>
                      <td>{row.career ?? '-'}</td>
                      <td>{row.travel ?? '-'}</td>
                      <td>{row.family ?? '-'}</td>
                      <td>{row.friends ?? '-'}</td>
                      <td>{row.health ?? '-'}</td>
                      <td>{getFirst5Words(row.bot_response)}</td>
                      <td>{formatDate(row.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>
    </div>
  );
};

export default WeeklyHoroscope;
