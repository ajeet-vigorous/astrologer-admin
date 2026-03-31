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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Failed to load dashboard data.</div>;

  const professionTitle = data.professionTitle || 'Astrologer';

  // All 12 stat cards - EXACT match of Laravel blade.php
  const stats = [
    { title: 'Call Request', value: data.totalCallRequest || 0, color: '#7c3aed', icon: 'phone' },
    { title: 'Chat Request', value: data.totalChatRequest || 0, color: '#2563eb', icon: 'chat' },
    { title: 'AI Chat Request', value: data.totalaiChatRequest || 0, color: '#8b5cf6', icon: 'smart_toy' },
    { title: 'Report Request', value: data.totalReportRequest || 0, color: '#059669', icon: 'description' },
    { title: 'Total Earning', value: '\u20B9' + (data.totalEarning || 0), color: '#d97706', icon: 'payments' },
    { title: 'Total Customer', value: data.totalCustomer || 0, color: '#dc2626', icon: 'people' },
    { title: `Total ${professionTitle}`, value: data.totalAstrologer || 0, color: '#0891b2', icon: 'stars' },
    { title: 'Total Orders', value: data.totalOrders || 0, color: '#7c3aed', icon: 'shopping_cart' },
    { title: 'Total Stories', value: data.totalStories || 0, color: '#ec4899', icon: 'auto_stories' },
    { title: 'Total Exotel Calls', value: data.totalExotelReport || 0, color: '#f59e0b', icon: 'call' },
    { title: 'Total Puja Orders', value: data.totalPujaOrders || 0, color: '#10b981', icon: 'temple_hindu' },
    { title: 'Total Course Orders', value: data.totalCourseOrders || 0, color: '#6366f1', icon: 'school' },
  ];

  const handleVerify = async (astrologerId) => {
    if (!window.confirm('Are you sure you want to change verification status?')) return;
    try {
      await dashboardApi.verifyAstrologer({ filed_id: astrologerId });
      window.location.reload();
    } catch (e) {
      alert('Failed to update verification status');
    }
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

  const cardStyle = {
    background: '#fff', padding: 20, borderRadius: 10,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'
  };

  const tableContainerStyle = {
    background: '#fff', borderRadius: 10, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 20
  };

  const thStyle = { padding: '10px 15px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderBottom: '2px solid #e5e7eb' };
  const tdStyle = { padding: '10px 15px', borderBottom: '1px solid #f0f0f0' };

  return (
    <div>
      <h2 style={{ marginBottom: 25 }}>Dashboard</h2>

      {/* 12 Stat Cards - EXACT Laravel blade match */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 15, marginBottom: 30 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${s.color}` }}>
            <h4 style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 0 }}>{s.title}</h4>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row - 2 charts side by side like Laravel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        {/* Monthly Earning Report - Line Chart */}
        <div style={tableContainerStyle}>
          <h3 style={{ marginBottom: 15, marginTop: 0, fontSize: 16 }}>Monthly Earning Report</h3>
          <div style={{ height: 300 }}>
            <Line data={earningChartData} options={earningChartOptions} />
          </div>
        </div>

        {/* Monthly Request Report - Bar Chart */}
        <div style={tableContainerStyle}>
          <h3 style={{ marginBottom: 15, marginTop: 0, fontSize: 16 }}>Monthly Request Report</h3>
          <div style={{ height: 300 }}>
            <Bar data={requestChartData} options={requestChartOptions} />
          </div>
        </div>
      </div>

      {/* Top 10 Verified Astrologers - EXACT Laravel blade match */}
      {data.topAstrologer && data.topAstrologer.length > 0 && (
        <div style={tableContainerStyle}>
          <h3 style={{ marginBottom: 15, marginTop: 0, fontSize: 16 }}>Top {professionTitle}s</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Profile</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Total Requests</th>
                  <th style={thStyle}>Languages</th>
                </tr>
              </thead>
              <tbody>
                {data.topAstrologer.map((a, i) => (
                  <tr key={a.id || i}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <img
                        src={a.profileImage ? (a.profileImage.startsWith('http') ? a.profileImage : `/public/storage/images/${a.profileImage}`) : '/default-avatar.png'}
                        alt={a.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ddd"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>'; }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{a.name}</td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>{a.contactNo || '-'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontSize: 12, marginRight: 4 }}>
                        Calls: {a.totalCallRequest || 0}
                      </span>
                      <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#059669', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        Chats: {a.totalChatRequest || 0}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: '#666' }}>{a.languageKnown || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unverified Astrologers - EXACT Laravel blade match with Verify/View buttons */}
      {data.unverifiedAstrologer && data.unverifiedAstrologer.length > 0 && (
        <div style={tableContainerStyle}>
          <h3 style={{ marginBottom: 15, marginTop: 0, fontSize: 16 }}>
            Unverified {professionTitle}s
            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 12, fontSize: 13, marginLeft: 10 }}>
              {data.unverifiedAstrologer.length}
            </span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Profile</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Skills</th>
                  <th style={thStyle}>Languages</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.unverifiedAstrologer.map((a, i) => (
                  <tr key={a.id || i}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <img
                        src={a.profileImage ? (a.profileImage.startsWith('http') ? a.profileImage : `/public/storage/images/${a.profileImage}`) : '/default-avatar.png'}
                        alt={a.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23ddd"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>'; }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{a.name}</td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>{a.contactNo || '-'}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: '#666' }}>{a.allSkill || '-'}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: '#666' }}>{a.languageKnown || '-'}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleVerify(a.id)}
                        style={{
                          background: '#059669', color: '#fff', border: 'none',
                          padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 5
                        }}
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => window.location.href = `/astrologers/${a.id}`}
                        style={{
                          background: '#2563eb', color: '#fff', border: 'none',
                          padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ========== BUSINESS REPORT ========== */}
      {report && (
        <div style={{ marginTop: 30 }}>
          <div style={{ ...tableContainerStyle, background: 'linear-gradient(135deg, #1a0533, #2d1b69)', color: '#fff', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Business Report</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 13 }} />
                <span>to</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', fontSize: 13 }} />
                <button onClick={() => fetchReport(fromDate, toDate)} style={{ padding: '6px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Apply</button>
                <button onClick={() => { setFromDate(''); setToDate(''); fetchReport(); }} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Reset</button>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#c4b5d8', marginBottom: 6 }}>TOTAL RECHARGE</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{'\u20B9'}{report.income?.totalRecharge?.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#c4b5d8', marginBottom: 6 }}>TOTAL REVENUE</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>{'\u20B9'}{report.revenue?.totalRevenue?.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#c4b5d8', marginBottom: 6 }}>ADMIN EARNING</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{'\u20B9'}{report.adminEarning?.totalAdminEarning?.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#c4b5d8', marginBottom: 6 }}>ASTROLOGER PAID</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa' }}>{'\u20B9'}{report.expenses?.astrologerPaid?.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Money Flow */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
            {/* Income */}
            <div style={{ ...tableContainerStyle, borderTop: '4px solid #10b981' }}>
              <h4 style={{ margin: '0 0 16px', color: '#059669', fontSize: 15 }}>INCOME (Paisa Aaya)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Chat Revenue ({report.revenue?.chat?.count})</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{'\u20B9'}{report.revenue?.chat?.total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Call Revenue ({report.revenue?.call?.count})</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{'\u20B9'}{report.revenue?.call?.total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>AI Chat ({report.revenue?.aiChat?.count})</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{'\u20B9'}{report.revenue?.aiChat?.total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', background: '#f0fdf4', borderRadius: 8, paddingLeft: 10, paddingRight: 10, marginTop: 6 }}>
                  <span style={{ fontWeight: 700, color: '#059669' }}>Total Revenue</span>
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: 16 }}>{'\u20B9'}{report.revenue?.totalRevenue?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Admin Commission */}
            <div style={{ ...tableContainerStyle, borderTop: '4px solid #f59e0b' }}>
              <h4 style={{ margin: '0 0 16px', color: '#d97706', fontSize: 15 }}>ADMIN COMMISSION</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Chat Commission (30%)</span>
                  <span style={{ fontWeight: 600, color: '#d97706' }}>{'\u20B9'}{report.adminEarning?.chatCommission?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Call Commission (30%)</span>
                  <span style={{ fontWeight: 600, color: '#d97706' }}>{'\u20B9'}{report.adminEarning?.callCommission?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>AI Chat (100%)</span>
                  <span style={{ fontWeight: 600, color: '#d97706' }}>{'\u20B9'}{report.adminEarning?.aiChatRevenue?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', background: '#fffbeb', borderRadius: 8, paddingLeft: 10, paddingRight: 10, marginTop: 6 }}>
                  <span style={{ fontWeight: 700, color: '#d97706' }}>Total Admin Earning</span>
                  <span style={{ fontWeight: 700, color: '#d97706', fontSize: 16 }}>{'\u20B9'}{report.adminEarning?.totalAdminEarning?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div style={{ ...tableContainerStyle, borderTop: '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 16px', color: '#dc2626', fontSize: 15 }}>EXPENSES (Paisa Gaya)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Astrologer Paid</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{'\u20B9'}{report.expenses?.astrologerPaid?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Withdrawals Released</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{'\u20B9'}{report.expenses?.withdrawReleased?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Withdrawals Pending</span>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>{'\u20B9'}{report.expenses?.withdrawPending?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ ...tableContainerStyle, marginTop: 16 }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 15 }}>Recent Transactions</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Astrologer</th>
                  <th style={thStyle}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(report.recentTransactions || []).map((t, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: t.type === 'Chat' ? '#eff6ff' : t.type === 'Call' ? '#f0fdf4' : '#fef3c7',
                        color: t.type === 'Chat' ? '#2563eb' : t.type === 'Call' ? '#059669' : '#d97706'
                      }}>{t.type}</span>
                    </td>
                    <td style={tdStyle}>{t.userName || '-'}</td>
                    <td style={tdStyle}>{t.astrologerName || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#059669' }}>{'\u20B9'}{parseFloat(t.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {(!report.recentTransactions || report.recentTransactions.length === 0) && (
                  <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: 20 }}>No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
