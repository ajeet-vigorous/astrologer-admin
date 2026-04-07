import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  LayoutDashboard, Phone, MessageSquare, Bot, FileText, IndianRupee, Users,
  Sparkles, ShoppingBag, BookOpen, PhoneCall, Heart, GraduationCap,
  ShieldCheck, ShieldX, Eye, Calendar, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { astrologerApi } from '../api/services';
import Loader from '../components/Loader';
import formatNumber from '../utils/formatNumber';
import '../styles/Dashboard.css';
import '../styles/Customers.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const STAT_ICONS = [Phone, MessageSquare, Bot, FileText, IndianRupee, Users, Sparkles, ShoppingBag, BookOpen, PhoneCall, Heart, GraduationCap];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchReport = (fd, td) => {
    const params = {};
    if (fd) params.from_date = fd;
    if (td) params.to_date = td;
    dashboardApi.getBusinessReport(params).then(res => setReport(res.data?.data || null)).catch(() => {});
  };

  useEffect(() => { fetchReport(); }, []);

  useEffect(() => {
    dashboardApi.get()
      .then(res => {
        const d = res.data;
        const dashboard = d.result && d.result.length > 0 ? d.result[0] : d;
        setData({
          ...dashboard,
          labels: d.labels,
          chartData: d.data,
          callData: d.callData,
          chatData: d.chatData,
          reportData: d.reportData
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="db-loader-wrap"><Loader text="Loading dashboard..." /></div>;
  if (!data) return <div className="db-error-wrap">Failed to load dashboard data.</div>;

  const professionTitle = data.professionTitle || 'Astrologer';

  const stats = [
    { title: 'Call Request', value: data.totalCallRequest || 0, color: '#7c3aed' },
    { title: 'Chat Request', value: data.totalChatRequest || 0, color: '#2563eb' },
    { title: 'AI Chat Request', value: data.totalaiChatRequest || 0, color: '#8b5cf6' },
    { title: 'Report Request', value: data.totalReportRequest || 0, color: '#059669' },
    { title: 'Total Earning', value: data.totalEarning || 0, color: '#d97706', isCurrency: true },
    { title: 'Total Customer', value: data.totalCustomer || 0, color: '#dc2626' },
    { title: `Total ${professionTitle}`, value: data.totalAstrologer || 0, color: '#0891b2' },
    { title: 'Total Orders', value: data.totalOrders || 0, color: '#7c3aed' },
    { title: 'Total Stories', value: data.totalStories || 0, color: '#ec4899' },
    { title: 'Total Exotel Calls', value: data.totalExotelReport || 0, color: '#f59e0b' },
    { title: 'Total Puja Orders', value: data.totalPujaOrders || 0, color: '#10b981' },
    { title: 'Total Course Orders', value: data.totalCourseOrders || 0, color: '#6366f1' },
  ];

  const handleVerify = async (astrologerId) => {
    const result = await Swal.fire({
      title: 'Verify Astrologer?',
      text: 'Are you sure you want to change verification status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Verify',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    try {
      await dashboardApi.verifyAstrologer({ filed_id: astrologerId });
      Swal.fire({ title: 'Success!', text: 'Verification status updated.', icon: 'success', timer: 1500, showConfirmButton: false });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      Swal.fire({ title: 'Error', text: 'Failed to update verification status', icon: 'error' });
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleModal) return;
    try {
      await astrologerApi.editTotalOrder({ astrologerId: scheduleModal.id, interviewDate: scheduleDate, interviewStatus: 'Scheduled' });
      Swal.fire({ title: 'Scheduled!', text: 'Interview scheduled & email sent.', icon: 'success', timer: 1500, showConfirmButton: false });
      setScheduleModal(null); setScheduleDate('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { Swal.fire({ title: 'Error', text: 'Failed to schedule', icon: 'error' }); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await astrologerApi.editTotalOrder({ astrologerId: rejectModal.id, interviewStatus: 'Rejected', rejectionReason: rejectReason });
      Swal.fire({ title: 'Rejected', icon: 'info', timer: 1500, showConfirmButton: false });
      setRejectModal(null); setRejectReason('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { Swal.fire({ title: 'Error', text: 'Failed to reject', icon: 'error' }); }
  };

  // Chart.js config - Monthly Earning Report (Line Chart) - EXACT Laravel match
  const earningChartData = {
    labels: data.labels || [],
    datasets: [{
      label: 'Monthly Earning',
      data: data.chartData || [],
      borderColor: '#1e40af',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1e40af',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  const earningChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '\u20B9' + v } }
    }
  };

  // Monthly Request Report (Bar Chart) - EXACT Laravel match (call, chat, report)
  const requestChartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Call Requests',
        data: data.callData || [],
        backgroundColor: 'rgba(124, 58, 237, 0.7)',
        borderColor: '#7c3aed',
        borderWidth: 1
      },
      {
        label: 'Chat Requests',
        data: data.chatData || [],
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563eb',
        borderWidth: 1
      },
      {
        label: 'Report Requests',
        data: data.reportData || [],
        backgroundColor: 'rgba(5, 150, 105, 0.7)',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  };

  const requestChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="db-topbar">
        <LayoutDashboard size={20} className="db-topbar-icon" />
        <h2 className="db-title">Dashboard</h2>
      </div>

      {/* 12 Stat Cards */}
      <div className="db-stats-grid">
        {stats.map((s, i) => {
          const IconComp = STAT_ICONS[i];
          return (
            <div key={i} className="db-stat-card" style={{ borderLeftColor: s.color }}>
              <div className="db-stat-icon" style={{ background: hexToRgba(s.color, 0.1) }}>
                <IconComp size={20} color={s.color} />
              </div>
              <div className="db-stat-info">
                <h4 className="db-stat-title">{s.title}</h4>
                <p className="db-stat-value" style={{ color: s.color }}>
                  {s.isCurrency ? `\u20B9${formatNumber(s.value)}` : formatNumber(s.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="db-charts-row">
        <div className="db-chart-card">
          <h3 className="db-chart-title">Monthly Earning Report</h3>
          <div className="db-chart-wrap">
            <Line data={earningChartData} options={earningChartOptions} />
          </div>
        </div>
        <div className="db-chart-card">
          <h3 className="db-chart-title">Monthly Request Report</h3>
          <div className="db-chart-wrap">
            <Bar data={requestChartData} options={requestChartOptions} />
          </div>
        </div>
      </div>

      {/* Top Astrologers Table */}
      {data.topAstrologer && data.topAstrologer.length > 0 && (
        <div className="db-section">
          <h3 className="db-section-title">Top {professionTitle}s</h3>
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Total Requests</th>
                  <th>Languages</th>
                </tr>
              </thead>
              <tbody>
                {data.topAstrologer.map((a, i) => (
                  <tr key={a.id || i}>
                    <td>{i + 1}</td>
                    <td>
                      <img
                        className="cust-avatar"
                        src={a.profileImage ? (a.profileImage.startsWith('http') ? a.profileImage : `/public/storage/images/${a.profileImage}`) : '/default-avatar.png'}
                        alt={a.name}
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ddd"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>'; }}
                      />
                    </td>
                    <td className="cust-name-cell">{a.name}</td>
                    <td>{a.contactNo || '-'}</td>
                    <td>
                      <span className="cust-req-badge purple">Calls: {a.totalCallRequest || 0}</span>
                      <span className="cust-req-badge blue">Chats: {a.totalChatRequest || 0}</span>
                    </td>
                    <td>{a.languageKnown || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Astrologers Table */}
      {data.unverifiedAstrologer && data.unverifiedAstrologer.length > 0 && (
        <div className="db-section">
          <h3 className="db-section-title">
            Pending {professionTitle}s
            <span className="db-badge-count">{data.unverifiedAstrologer.length}</span>
          </h3>
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Skills</th>
                  <th>Languages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.unverifiedAstrologer.map((a, i) => (
                  <tr key={a.id || i}>
                    <td>{i + 1}</td>
                    <td>
                      <img className="cust-avatar"
                        src={a.profileImage ? (a.profileImage.startsWith('http') ? a.profileImage : `/public/storage/images/${a.profileImage}`) : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>'}
                        alt={a.name} onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>'; }} />
                    </td>
                    <td className="cust-name-cell">{a.name}</td>
                    <td>{a.contactNo || '-'}</td>
                    <td className="cust-date-cell">{a.allSkill || '-'}</td>
                    <td className="cust-date-cell">{a.languageKnown || '-'}</td>
                    <td>
                      <div className="cust-actions">
                        <button className="cust-action-btn cust-action-view" title="View" onClick={() => window.location.href = `/admin/astrologers/${a.id}`}>
                          <Eye size={15} />
                        </button>
                        {a.interviewStatus === 'Scheduled' ? (
                          <button className="cust-action-btn cust-action-edit" title="Approve" onClick={() => handleVerify(a.id)}>
                            <ShieldCheck size={15} />
                          </button>
                        ) : (
                          <button className="cust-action-btn cust-action-recharge" title="Schedule Interview" onClick={() => { setScheduleModal(a); setScheduleDate(''); }}>
                            <Calendar size={15} />
                          </button>
                        )}
                        <button className="cust-action-btn cust-action-delete" title="Reject" onClick={() => { setRejectModal(a); setRejectReason(''); }}>
                          <ShieldX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interview Schedule Modal */}
      {scheduleModal && (
        <div className="cust-overlay" onClick={() => setScheduleModal(null)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Schedule Interview - {scheduleModal.name}</h3>
              <button onClick={() => setScheduleModal(null)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Interview Date & Time *</label>
                <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required />
              </div>
              <button onClick={handleSchedule} disabled={!scheduleDate} className="cust-btn cust-btn-primary cust-btn-full">
                <Calendar size={14} /> Schedule & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="cust-overlay" onClick={() => setRejectModal(null)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Reject - {rejectModal.name}</h3>
              <button onClick={() => setRejectModal(null)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Rejection Reason</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Enter reason (optional)" />
              </div>
              <button onClick={handleReject} className="cust-btn cust-btn-danger cust-btn-full">
                <ShieldX size={14} /> Reject Astrologer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Report */}
      {report && (
        <div className="db-report-wrap">
          <div className="db-report-header">
            <div className="db-report-header-row">
              <h3 className="db-report-title">Business Report</h3>
              <div className="db-report-filters">
                <input type="date" className="db-report-date-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <span className="db-report-date-sep">to</span>
                <input type="date" className="db-report-date-input" value={toDate} onChange={e => setToDate(e.target.value)} />
                <button className="db-report-btn-apply" onClick={() => fetchReport(fromDate, toDate)}>Apply</button>
                <button className="db-report-btn-reset" onClick={() => { setFromDate(''); setToDate(''); fetchReport(); }}>Reset</button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="db-summary-grid">
              <div className="db-summary-card">
                <div className="db-summary-label">TOTAL RECHARGE</div>
                <div className="db-summary-value">{'\u20B9'}{formatNumber(report.income?.totalRecharge || 0)}</div>
              </div>
              <div className="db-summary-card">
                <div className="db-summary-label">TOTAL REVENUE</div>
                <div className="db-summary-value green">{'\u20B9'}{formatNumber(report.revenue?.totalRevenue || 0)}</div>
              </div>
              <div className="db-summary-card">
                <div className="db-summary-label">ADMIN EARNING</div>
                <div className="db-summary-value yellow">{'\u20B9'}{formatNumber(report.adminEarning?.totalAdminEarning || 0)}</div>
              </div>
              <div className="db-summary-card">
                <div className="db-summary-label">ASTROLOGER PAID</div>
                <div className="db-summary-value purple">{'\u20B9'}{formatNumber(report.expenses?.astrologerPaid || 0)}</div>
              </div>
            </div>
          </div>

          {/* Money Flow Cards */}
          <div className="db-money-grid">
            {/* Income */}
            <div className="db-money-card income">
              <h4 className="db-money-title income">INCOME (Paisa Aaya)</h4>
              <div className="db-money-rows">
                <div className="db-money-row">
                  <span className="db-money-row-label">Chat Revenue ({report.revenue?.chat?.count})</span>
                  <span className="db-money-row-value income">{'\u20B9'}{formatNumber(report.revenue?.chat?.total || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">Call Revenue ({report.revenue?.call?.count})</span>
                  <span className="db-money-row-value income">{'\u20B9'}{formatNumber(report.revenue?.call?.total || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">AI Chat ({report.revenue?.aiChat?.count})</span>
                  <span className="db-money-row-value income">{'\u20B9'}{formatNumber(report.revenue?.aiChat?.total || 0)}</span>
                </div>
                <div className="db-money-total income">
                  <span className="db-money-total-label income">Total Revenue</span>
                  <span className="db-money-total-value income">{'\u20B9'}{formatNumber(report.revenue?.totalRevenue || 0)}</span>
                </div>
              </div>
            </div>

            {/* Admin Commission */}
            <div className="db-money-card commission">
              <h4 className="db-money-title commission">ADMIN COMMISSION</h4>
              <div className="db-money-rows">
                <div className="db-money-row">
                  <span className="db-money-row-label">Chat Commission (30%)</span>
                  <span className="db-money-row-value commission">{'\u20B9'}{formatNumber(report.adminEarning?.chatCommission || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">Call Commission (30%)</span>
                  <span className="db-money-row-value commission">{'\u20B9'}{formatNumber(report.adminEarning?.callCommission || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">AI Chat (100%)</span>
                  <span className="db-money-row-value commission">{'\u20B9'}{formatNumber(report.adminEarning?.aiChatRevenue || 0)}</span>
                </div>
                <div className="db-money-total commission">
                  <span className="db-money-total-label commission">Total Admin Earning</span>
                  <span className="db-money-total-value commission">{'\u20B9'}{formatNumber(report.adminEarning?.totalAdminEarning || 0)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="db-money-card expenses">
              <h4 className="db-money-title expenses">EXPENSES (Paisa Gaya)</h4>
              <div className="db-money-rows">
                <div className="db-money-row">
                  <span className="db-money-row-label">Astrologer Paid</span>
                  <span className="db-money-row-value expenses">{'\u20B9'}{formatNumber(report.expenses?.astrologerPaid || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">Withdrawals Released</span>
                  <span className="db-money-row-value expenses">{'\u20B9'}{formatNumber(report.expenses?.withdrawReleased || 0)}</span>
                </div>
                <div className="db-money-row">
                  <span className="db-money-row-label">Withdrawals Pending</span>
                  <span className="db-money-row-value warning">{'\u20B9'}{formatNumber(report.expenses?.withdrawPending || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="db-section">
            <h3 className="db-section-title">Recent Transactions</h3>
            <div className="cust-table-wrap">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Astrologer</th>
                    <th>Total</th>
                    <th>Admin</th>
                    <th>Astrologer</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.recentTransactions || []).map((t, i) => (
                    <tr key={i}>
                      <td>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</td>
                      <td>
                        <span className={`cust-req-badge ${t.type === 'Chat' ? 'blue' : 'purple'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td>{t.userName || '-'}</td>
                      <td>{t.astrologerName || '-'}</td>
                      <td className="db-txn-amount">{'\u20B9'}{formatNumber(parseFloat(t.amount || 0))}</td>
                      <td style={{color:'#d97706',fontWeight:600}}>{'\u20B9'}{formatNumber(parseFloat(t.adminEarning || 0))}</td>
                      <td style={{color:'#059669',fontWeight:600}}>{'\u20B9'}{formatNumber(parseFloat(t.astrologerEarning || 0))}</td>
                    </tr>
                  ))}
                  {(!report.recentTransactions || report.recentTransactions.length === 0) && (
                    <tr><td colSpan={7} className="db-no-data">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
