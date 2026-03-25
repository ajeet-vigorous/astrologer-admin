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
    </div>
  );
};

export default Dashboard;
