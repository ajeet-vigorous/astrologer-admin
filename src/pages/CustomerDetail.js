import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../api/services';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('call');
  const [walletSubTab, setWalletSubTab] = useState('transaction');

  useEffect(() => {
    customerApi.getById(id)
      .then(res => {
        const result = res.data.result;
        setData(result && result.length > 0 ? result[0] : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading customer details...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Customer not found.</div>;

  const curr = data.currencySymbol || '\u20B9';
  const callHistory = data.callRequest?.callHistory || [];
  const chatHistory = data.chatRequest?.chatHistory || [];
  const reportHistory = data.reportRequest?.reportHistory || [];
  const wallet = data.walletTransaction?.wallet || [];
  const payment = data.paymentLogs?.payment || [];
  const orders = data.orders?.order || [];
  const pujaOrders = data.pujaOrders?.orders || [];
  const gifts = data.sendGifts?.gifts || [];
  const followers = data.follower || [];
  const notifications = data.notification || [];

  const profileImg = data.profile ? (data.profile.startsWith('http') ? data.profile : `/public/${data.profile}`) : null;

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
  };
  const formatDateTime = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    let hr = dt.getHours(); const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am'; hr = hr % 12 || 12;
    return `${formatDate(d)} ${hr}:${min} ${ampm}`;
  };

  // Laravel tabs: Call History, Wallet(2 sub-tabs), Chat History, Order Detail, Report, Following, Notification, Gift
  const tabs = [
    { key: 'call', label: 'Call History' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'chat', label: 'Chat History' },
    { key: 'order', label: 'Order Detail' },
    { key: 'puja', label: 'Puja Orders' },
    { key: 'report', label: 'Report' },
    { key: 'following', label: 'Following List' },
    { key: 'notification', label: 'Notification List' },
    { key: 'gift', label: 'Gift List' },
  ];

  // Status color helper
  const statusColor = (status) => {
    if (!status) return '#666';
    const s = status.toLowerCase();
    if (['completed', 'success', 'accepted'].includes(s)) return '#059669';
    if (['cancelled', 'failed', 'rejected'].includes(s)) return '#dc2626';
    if (['pending', 'waiting'].includes(s)) return '#d97706';
    return '#666';
  };

  // Wallet transaction type description (exact Laravel logic)
  const getWalletDesc = (w) => {
    const type = (w.transactionType || '').toLowerCase();
    if (type === 'gift') return `Gift to ${w.astrologerName || 'Astrologer'}`;
    if (type === 'cashback') return 'Cashback';
    if (type === 'referral') return 'Referral Bonus';
    if (type === 'pujaorder') return 'Puja Order';
    if (type === 'report') return `Report - ${w.astrologerName || ''}`;
    if (type === 'call' || type === 'chat') return `${type.charAt(0).toUpperCase() + type.slice(1)} with ${w.astrologerName || 'Astrologer'} (${w.totalMin || 0} min)`;
    if (type === 'recharge') return 'Wallet Recharge';
    return w.transactionType || '-';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin/customers')} style={backBtn}>&larr; Back</button>
        <h2 style={{ margin: 0 }}>Customer Detail</h2>
      </div>

      {/* Profile Header - exact Laravel */}
      <div style={{ ...sectionStyle, display: 'flex', gap: 25, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          {profileImg ? (
            <img src={profileImg} alt={data.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }}
              onError={e => { e.target.src = fallbackSvg; }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#999' }}>
              {data.name ? data.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <h3 style={{ margin: '10px 0 2px' }}>{data.name}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{data.countryCode} {data.contactNo}</p>
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <h4 style={{ margin: '0 0 10px', color: '#555' }}>Contact Details</h4>
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Address" value={data.addressLine1} />
          <InfoRow label="City" value={data.location} />
          <InfoRow label="Pincode" value={data.pincode} />
          <h4 style={{ margin: '15px 0 10px', color: '#555' }}>Details</h4>
          <InfoRow label="Birth Date" value={formatDate(data.birthDate)} />
          <InfoRow label="Birth Time" value={data.birthTime} />
          <InfoRow label="Birth Place" value={data.birthPlace} />
          <InfoRow label="Gender" value={data.gender} />
          <InfoRow label="Wallet Balance" value={`${curr}${data.walletBalance || 0}`} />
        </div>
      </div>

      {/* Tabs - exact Laravel 8 tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', overflowX: 'auto', background: '#fff', borderRadius: '10px 10px 0 0', marginTop: 20 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: activeTab === tab.key ? '#fff' : '#f8f9fa',
              color: activeTab === tab.key ? '#7c3aed' : '#666',
              borderBottom: activeTab === tab.key ? '3px solid #7c3aed' : '3px solid transparent',
              whiteSpace: 'nowrap'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ ...sectionStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}>

        {/* Call History - Card Grid (exact Laravel blade) */}
        {activeTab === 'call' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Call History ({data.callRequest?.totalCount || 0})</h4>
            {callHistory.length > 0 ? (
              <div style={gridStyle}>
                {callHistory.map((c, i) => (
                  <div key={i} style={cardStyle}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <img src={c.profileImage ? (c.profileImage.startsWith('http') ? c.profileImage : `/public/storage/images/${c.profileImage}`) : fallbackSvg}
                        alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = fallbackSvg; }} />
                      <div>
                        <strong style={{ fontSize: 13 }}>{c.astrologerName}</strong>
                        <div style={{ fontSize: 11, color: '#999' }}>{formatDateTime(c.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Contact: {c.astroContactNo || '-'}</div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Call Rate: <strong>{curr}{c.callRate || 0}/min</strong></div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Deduction: <span style={{ color: '#dc2626' }}>-{curr}{c.deduction || 0}</span></div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Duration: <strong>{c.totalMin || 0} min</strong></div>
                    <div style={{ fontSize: 12 }}>Status: <span style={{ color: statusColor(c.status), fontWeight: 600 }}>{c.status || '-'}</span></div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No call history.</p>}
          </div>
        )}

        {/* Wallet - 2 Sub-tabs (exact Laravel) */}
        {activeTab === 'wallet' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <button onClick={() => setWalletSubTab('transaction')}
                style={{ padding: '6px 16px', border: '1px solid #ddd', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500, background: walletSubTab === 'transaction' ? '#7c3aed' : '#fff', color: walletSubTab === 'transaction' ? '#fff' : '#666' }}>
                Wallet Transaction ({data.walletTransaction?.totalCount || 0})
              </button>
              <button onClick={() => setWalletSubTab('payment')}
                style={{ padding: '6px 16px', border: '1px solid #ddd', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500, background: walletSubTab === 'payment' ? '#7c3aed' : '#fff', color: walletSubTab === 'payment' ? '#fff' : '#666' }}>
                Payment Logs ({data.paymentLogs?.totalCount || 0})
              </button>
            </div>

            {walletSubTab === 'transaction' && (
              wallet.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {wallet.map((w, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f9fa', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{getWalletDesc(w)}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{formatDateTime(w.created_at)}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: parseFloat(w.amount) >= 0 ? '#059669' : '#dc2626' }}>
                        {parseFloat(w.amount) >= 0 ? '+' : ''}{curr}{w.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={emptyText}>No wallet transactions.</p>
            )}

            {walletSubTab === 'payment' && (
              payment.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {payment.map((p, i) => {
                    const isSuccess = p.paymentStatus === 'success';
                    const isFailed = p.paymentStatus === 'failed';
                    const bgColor = isSuccess ? '#f0fdf4' : isFailed ? '#fef2f2' : '#fffbeb';
                    const textColor = isSuccess ? '#059669' : isFailed ? '#dc2626' : '#d97706';
                    const statusLabel = isSuccess ? 'Success' : isFailed ? 'Failed' : 'Pending';
                    return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: bgColor, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Recharge {p.paymentMode ? `(${p.paymentMode})` : ''} <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: textColor + '18', color: textColor, fontWeight: 600 }}>{statusLabel}</span></div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{formatDateTime(p.created_at)}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>{isSuccess ? '+' : ''}{curr}{p.amount}</div>
                    </div>
                    );
                  })}
                </div>
              ) : <p style={emptyText}>No payment logs.</p>
            )}
          </div>
        )}

        {/* Chat History - Card Grid (exact Laravel blade) */}
        {activeTab === 'chat' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Chat History ({data.chatRequest?.totalCount || 0})</h4>
            {chatHistory.length > 0 ? (
              <div style={gridStyle}>
                {chatHistory.map((c, i) => (
                  <div key={i} style={cardStyle}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <img src={c.profileImage ? (c.profileImage.startsWith('http') ? c.profileImage : `/public/storage/images/${c.profileImage}`) : fallbackSvg}
                        alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => { e.target.src = fallbackSvg; }} />
                      <div>
                        <strong style={{ fontSize: 13 }}>{c.astrologerName}</strong>
                        <div style={{ fontSize: 11, color: '#999' }}>{formatDateTime(c.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Contact: {c.astroContactNo || '-'}</div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Rate: <strong>{curr}{c.chatRate || 0}/min</strong></div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Deduction: <span style={{ color: '#dc2626' }}>-{curr}{c.deduction || 0}</span></div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Duration: <strong>{c.totalMin || 0} min</strong></div>
                    <div style={{ fontSize: 12 }}>Status: <span style={{ color: statusColor(c.status), fontWeight: 600 }}>{c.status || '-'}</span></div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No chat history.</p>}
          </div>
        )}

        {/* Order Detail - Card Grid (exact Laravel blade) */}
        {activeTab === 'order' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Order Detail ({data.orders?.totalCount || 0})</h4>
            {orders.length > 0 ? (
              <div style={gridStyle}>
                {orders.map((o, i) => (
                  <div key={i} style={cardStyle}>
                    {o.productImage && (
                      <img src={o.productImage.startsWith('http') ? o.productImage : `/public/storage/images/${o.productImage}`}
                        alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', marginBottom: 6 }}>{o.productCategory} - {o.productName}</div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                      {[o.flatNo, o.locality, o.city, o.state, o.orderCountry, o.orderPincode].filter(Boolean).join(', ')}
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Payable: <strong>{curr}{o.payableAmount || o.productAmount || 0}</strong></div>
                    {o.gstPercent > 0 && <div style={{ fontSize: 12, marginBottom: 4 }}>GST: {o.gstPercent}%</div>}
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Total: <strong>{curr}{o.totalAmount || o.productAmount || 0}</strong></div>
                    <div style={{ fontSize: 11, color: '#999' }}>{formatDateTime(o.created_at)}</div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No orders.</p>}
          </div>
        )}

        {/* Puja Orders */}
        {activeTab === 'puja' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Puja Orders ({data.pujaOrders?.totalCount || 0})</h4>
            {pujaOrders.length > 0 ? (
              <div style={gridStyle}>
                {pujaOrders.map((p, i) => (
                  <div key={i} style={cardStyle}>
                    {p.pujaImage && (
                      <img src={p.pujaImage.startsWith('http') ? p.pujaImage : `/public/storage/images/${p.pujaImage}`}
                        alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>{p.pujaName || 'Puja'}</div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Amount: <strong>{curr}{p.amount || 0}</strong></div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Status: <span style={{ color: statusColor(p.status), fontWeight: 600 }}>{p.status || '-'}</span></div>
                    <div style={{ fontSize: 11, color: '#999' }}>{formatDateTime(p.created_at)}</div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No puja orders.</p>}
          </div>
        )}

        {/* Report - List (exact Laravel) */}
        {activeTab === 'report' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Reports ({data.reportRequest?.totalCount || 0})</h4>
            {reportHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reportHistory.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f9fa', borderRadius: 8 }}>
                    <div>
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: 13 }}>{r.astrologerName}</span>
                      <span style={{ color: '#999', fontSize: 11, marginLeft: 10 }}>{formatDateTime(r.created_at)}</span>
                      <div style={{ fontSize: 12, color: '#333', marginTop: 4 }}>{r.reportTitle || '-'}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>{curr}{r.reportRate || 0}</div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No reports.</p>}
          </div>
        )}

        {/* Following List - Table with profile (exact Laravel) */}
        {activeTab === 'following' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Following List ({followers.length})</h4>
            {followers.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Profile</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Contact No</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followers.map((f, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>
                        <img src={f.profileImage ? (f.profileImage.startsWith('http') ? f.profileImage : `/public/storage/images/${f.profileImage}`) : fallbackSvg}
                          alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                          onError={e => { e.target.src = fallbackSvg; }} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{f.name}</td>
                      <td style={tdStyle}>{f.contactNo || '-'}</td>
                      <td style={tdStyle}>{formatDate(f.followingDate)}</td>
                      <td style={tdStyle}>
                        <button onClick={() => navigate(`/admin/astrologers/${f.id}`)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>Not following any astrologers.</p>}
          </div>
        )}

        {/* Notification List - Table (exact Laravel) */}
        {activeTab === 'notification' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Notification List ({notifications.length})</h4>
            {notifications.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Title</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 500 }}>{n.title || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{n.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No notifications.</p>}
          </div>
        )}

        {/* Gift List - Table with amount (exact Laravel) */}
        {activeTab === 'gift' && (
          <div>
            <h4 style={{ marginBottom: 15, marginTop: 0 }}>Gift List ({gifts.length})</h4>
            {gifts.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Astrologer Name</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Gift Name</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Amount</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map((g, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{g.astrologerName || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{g.giftName || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>(-) {curr}{g.giftAmount || g.amount || 0}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatDate(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No gifts sent.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// Shared styles
const sectionStyle = { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 20 };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 15 };
const cardStyle = { background: '#f8f9fa', borderRadius: 10, padding: 15, border: '1px solid #e5e7eb' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '10px 15px', textAlign: 'left', fontSize: 12, fontWeight: 600, borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '10px 15px', borderBottom: '1px solid #f0f0f0', fontSize: 13 };
const backBtn = { background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const emptyText = { color: '#999', textAlign: 'center', padding: 30 };
const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
    <span style={{ width: 140, fontWeight: 600, color: '#555', fontSize: 12 }}>{label}</span>
    <span style={{ flex: 1, color: '#333', fontSize: 13 }}>{value || '-'}</span>
  </div>
);

export default CustomerDetail;
