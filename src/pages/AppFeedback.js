import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { appFeedbackApi } from '../api/services';

const AppFeedback = () => {
  const [activeTab, setActiveTab] = useState('feedback');

  // Feedback state
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactPagination, setContactPagination] = useState(null);
  const [contactPage, setContactPage] = useState(1);
  const [contactSearch, setContactSearch] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await appFeedbackApi.getAll({ page, search });
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching app feedback:', err);
    }
    setLoading(false);
  };

  const fetchContacts = async () => {
    setContactLoading(true);
    try {
      const res = await appFeedbackApi.getContacts({ page: contactPage, search: contactSearch });
      setContacts(res.data.data || []);
      setContactPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
    setContactLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchData();
    }
  }, [page, search, activeTab]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [contactPage, contactSearch, activeTab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= r ? '#f59e0b' : '#d1d5db', fontSize: '16px' }}>&#9733;</span>
      );
    }
    return <span>{stars}</span>;
  };

  const feedbackColumns = [
    { header: '#', render: (row, i) => ((page - 1) * 10) + i + 1 },
    {
      header: 'Profile',
      render: (row) => (
        <img
          src={row.userImage || row.user?.image || row.user?.profileImage || 'https://via.placeholder.com/50'}
          alt="User"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50'; }}
          style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
        />
      )
    },
    {
      header: 'User',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.userName || row.user?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{row.userContactNumber || row.user?.contactNumber || row.user?.phone || ''}</div>
        </div>
      )
    },
    {
      header: 'App',
      render: (row) => {
        const appType = row.appType || row.app || row.type || '';
        if (appType === 'partner' || appType === 'astrologer' || appType === 'Partner App') {
          return <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Partner App</span>;
        }
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Customer App</span>;
      }
    },
    { header: 'Rating', render: (row) => renderStars(row.rating) },
    {
      header: 'Feedback',
      render: (row) => row.feedback ? (row.feedback.length > 60 ? row.feedback.substring(0, 60) + '...' : row.feedback) : '-'
    },
    {
      header: 'Feedback Date',
      render: (row) => formatDate(row.createdAt)
    }
  ];

  const contactColumns = [
    { header: '#', render: (row, i) => ((contactPage - 1) * 10) + i + 1 },
    { header: 'Name', render: (row) => row.name || '-' },
    { header: 'Email', render: (row) => row.email || '-' },
    { header: 'Phone', render: (row) => row.phone || row.contactNumber || '-' },
    {
      header: 'Message',
      render: (row) => row.message ? (row.message.length > 80 ? row.message.substring(0, 80) + '...' : row.message) : '-'
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.createdAt)
    }
  ];

  const tabStyle = (isActive) => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: isActive ? '3px solid #7c3aed' : '3px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: isActive ? 700 : 400,
    color: isActive ? '#7c3aed' : '#6b7280',
    fontSize: '15px'
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px', paddingLeft: '8px' }}>
        <button style={tabStyle(activeTab === 'feedback')} onClick={() => { setActiveTab('feedback'); setPage(1); }}>
          App Feedback
        </button>
        <button style={tabStyle(activeTab === 'contacts')} onClick={() => { setActiveTab('contacts'); setContactPage(1); }}>
          Contact List
        </button>
      </div>

      {activeTab === 'feedback' && (
        <DataTable
          title="App Feedback"
          columns={feedbackColumns}
          data={data}
          pagination={pagination}
          onPageChange={setPage}
          onSearch={setSearch}
          searchValue={search}
        />
      )}

      {activeTab === 'contacts' && (
        <DataTable
          title="Contact List"
          columns={contactColumns}
          data={contacts}
          pagination={contactPagination}
          onPageChange={setContactPage}
          onSearch={setContactSearch}
          searchValue={contactSearch}
        />
      )}
    </div>
  );
};

export default AppFeedback;
