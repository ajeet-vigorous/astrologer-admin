import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../api/services';
import Loader from '../components/Loader';
import { Eye, Phone, MessageSquare, Wallet, ShoppingBag, FileText, Heart, Bell, Gift, IndianRupee, Clock, TrendingDown, ChevronDown, Contact, UserRound } from 'lucide-react';
import formatNumber from '../utils/formatNumber';
import '../styles/CustomerDetail.css';

const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('call');
  const [walletSubTab, setWalletSubTab] = useState('transaction');
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    customerApi.getById(id)
      .then(res => {
        const result = res.data.result;
        setData(result && result.length > 0 ? result[0] : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader text="Loading customer details..." />;
  if (!data) return <div className="cd-empty">Customer not found.</div>;

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

  const statusClass = (status) => {
    if (!status) return 'cd-badge-default';
    const s = status.toLowerCase();
    if (['completed', 'success', 'accepted'].includes(s)) return 'cd-badge-green';
    if (['cancelled', 'failed', 'rejected'].includes(s)) return 'cd-badge-red';
    if (['pending', 'waiting'].includes(s)) return 'cd-badge-yellow';
    return 'cd-badge-default';
  };

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

  const tabs = [
    { key: 'call', label: 'Calls', icon: Phone, count: data.callRequest?.totalCount || 0 },
    { key: 'chat', label: 'Chats', icon: MessageSquare, count: data.chatRequest?.totalCount || 0 },
    { key: 'wallet', label: 'Wallet', icon: Wallet, count: data.walletTransaction?.totalCount || 0 },
    { key: 'order', label: 'Orders', icon: ShoppingBag, count: data.orders?.totalCount || 0 },
    { key: 'puja', label: 'Puja', icon: Heart, count: data.pujaOrders?.totalCount || 0 },
    { key: 'report', label: 'Reports', icon: FileText, count: data.reportRequest?.totalCount || 0 },
    { key: 'following', label: 'Following', icon: Heart, count: followers.length },
    { key: 'notification', label: 'Alerts', icon: Bell, count: notifications.length },
    { key: 'gift', label: 'Gifts', icon: Gift, count: gifts.length },
  ];

  const imgSrc = (img) => img ? (img.startsWith('http') ? img : `/public/storage/images/${img}`) : fallbackSvg;

  const stats = [
    { label: 'Wallet', value: `${curr}${formatNumber(data.walletBalance || 0)}`, color: '#059669', bg: '#ecfdf5' },
    { label: 'Calls', value: data.callRequest?.totalCount || 0, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Chats', value: data.chatRequest?.totalCount || 0, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Orders', value: data.orders?.totalCount || 0, color: '#d97706', bg: '#fffbeb' },
    { label: 'Reports', value: data.reportRequest?.totalCount || 0, color: '#dc2626', bg: '#fef2f2' },
  ];

  return (
    <div className="cd-page">
      {/* Hero Profile */}
      <div className="cd-hero-wrap">
        <div className="cd-hero">
          <div className="cd-hero-left">
            <div className="cd-hero-avatar-wrap">
              {profileImg ? (
                <img src={profileImg} alt={data.name} className="cd-hero-avatar"
                  onError={e => { e.target.src = fallbackSvg; }} />
              ) : (
                <div className="cd-hero-avatar cd-hero-initial">
                  {data.name ? data.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div className="cd-hero-info">
              <h2 className="cd-hero-name">{data.name || 'Unknown'}</h2>
              <p className="cd-hero-phone">{data.countryCode} {data.contactNo}</p>
              {data.email && <p className="cd-hero-email">{data.email}</p>}
            </div>
          </div>
        </div>
        <div className="cd-hero-stats">
          {stats.map((s, i) => (
            <div key={i} className="cd-stat-chip" style={{ background: s.bg, color: s.color }}>
              <span className="cd-stat-val">{s.value}</span>
              <span className="cd-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Accordions */}
      <div className="cd-accordion-grid">
        <div className="cd-accordion">
          <button className={`cd-accordion-header ${openAccordion === 'contact' ? 'open' : ''}`} onClick={() => setOpenAccordion(openAccordion === 'contact' ? null : 'contact')}>
            <span><Contact size={16} /> Contact Information</span>
            <ChevronDown size={16} className="cd-accordion-arrow" />
          </button>
          <div className={`cd-accordion-body ${openAccordion === 'contact' ? 'open' : ''}`}>
            <div className="cd-accordion-inner">
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Address" value={data.addressLine1} />
              <InfoRow label="City" value={data.location} />
              <InfoRow label="Pincode" value={data.pincode} />
              <InfoRow label="Country" value={data.country} />
            </div>
          </div>
        </div>
        <div className="cd-accordion">
          <button className={`cd-accordion-header ${openAccordion === 'personal' ? 'open' : ''}`} onClick={() => setOpenAccordion(openAccordion === 'personal' ? null : 'personal')}>
            <span><UserRound size={16} /> Personal Information</span>
            <ChevronDown size={16} className="cd-accordion-arrow" />
          </button>
          <div className={`cd-accordion-body ${openAccordion === 'personal' ? 'open' : ''}`}>
            <div className="cd-accordion-inner">
              <InfoRow label="Gender" value={data.gender} />
              <InfoRow label="Birth Date" value={formatDate(data.birthDate)} />
              <InfoRow label="Birth Time" value={data.birthTime} />
              <InfoRow label="Birth Place" value={data.birthPlace} />
              <InfoRow label="Joined" value={formatDate(data.created_at)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cd-tabs-wrap">
        <div className="cd-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`cd-tab ${activeTab === tab.key ? 'active' : ''}`}>
                <Icon size={15} />
                <span className="cd-tab-label">{tab.label}</span>
                {tab.count > 0 && <span className="cd-tab-count">{tab.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="cd-content">

        {/* Call History */}
        {activeTab === 'call' && (
          callHistory.length > 0 ? (
            <div className="cd-grid">
              {callHistory.map((c, i) => (
                <div key={i} className="cd-item-card">
                  <div className="cd-item-top">
                    <img src={imgSrc(c.profileImage)} alt="" className="cd-item-avatar"
                      onError={e => { e.target.src = fallbackSvg; }} />
                    <div className="cd-item-meta">
                      <span className="cd-item-name">{c.astrologerName}</span>
                      <span className="cd-item-time">{formatDateTime(c.created_at)}</span>
                    </div>
                    <span className={`cd-badge ${statusClass(c.status)}`}>{c.status || '-'}</span>
                  </div>
                  <div className="cd-item-body">
                    <div className="cd-item-stat">
                      <IndianRupee size={13} /> <span>{curr}{formatNumber(c.callRate || 0)}/min</span>
                    </div>
                    <div className="cd-item-stat">
                      <Clock size={13} /> <span>{c.totalMin || 0} min</span>
                    </div>
                    <div className="cd-item-stat cd-item-stat-red">
                      <TrendingDown size={13} /> <span>-{curr}{formatNumber(c.deduction || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No call history.</p>
        )}

        {/* Chat History */}
        {activeTab === 'chat' && (
          chatHistory.length > 0 ? (
            <div className="cd-grid">
              {chatHistory.map((c, i) => (
                <div key={i} className="cd-item-card">
                  <div className="cd-item-top">
                    <img src={imgSrc(c.profileImage)} alt="" className="cd-item-avatar"
                      onError={e => { e.target.src = fallbackSvg; }} />
                    <div className="cd-item-meta">
                      <span className="cd-item-name">{c.astrologerName}</span>
                      <span className="cd-item-time">{formatDateTime(c.created_at)}</span>
                    </div>
                    <span className={`cd-badge ${statusClass(c.status)}`}>{c.status || '-'}</span>
                  </div>
                  <div className="cd-item-body">
                    <div className="cd-item-stat">
                      <IndianRupee size={13} /> <span>{curr}{formatNumber(c.chatRate || 0)}/min</span>
                    </div>
                    <div className="cd-item-stat">
                      <Clock size={13} /> <span>{c.totalMin || 0} min</span>
                    </div>
                    <div className="cd-item-stat cd-item-stat-red">
                      <TrendingDown size={13} /> <span>-{curr}{formatNumber(c.deduction || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No chat history.</p>
        )}

        {/* Wallet */}
        {activeTab === 'wallet' && (
          <div>
            <div className="cd-subtabs">
              <button onClick={() => setWalletSubTab('transaction')}
                className={`cd-pill ${walletSubTab === 'transaction' ? 'active' : ''}`}>
                Transactions ({data.walletTransaction?.totalCount || 0})
              </button>
              <button onClick={() => setWalletSubTab('payment')}
                className={`cd-pill ${walletSubTab === 'payment' ? 'active' : ''}`}>
                Payments ({data.paymentLogs?.totalCount || 0})
              </button>
            </div>

            {walletSubTab === 'transaction' && (
              wallet.length > 0 ? (
                <div className="cd-txn-list">
                  {wallet.map((w, i) => (
                    <div key={i} className="cd-txn">
                      <div className="cd-txn-info">
                        <span className="cd-txn-desc">{getWalletDesc(w)}</span>
                        <span className="cd-txn-date">{formatDateTime(w.created_at)}</span>
                      </div>
                      <span className={`cd-txn-amount ${parseFloat(w.amount) >= 0 ? 'green' : 'red'}`}>
                        {parseFloat(w.amount) >= 0 ? '+' : ''}{curr}{formatNumber(parseFloat(w.amount || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="cd-empty">No wallet transactions.</p>
            )}

            {walletSubTab === 'payment' && (
              payment.length > 0 ? (
                <div className="cd-txn-list">
                  {payment.map((p, i) => {
                    const isSuccess = p.paymentStatus === 'success';
                    const isFailed = p.paymentStatus === 'failed';
                    const statusLabel = isSuccess ? 'Success' : isFailed ? 'Failed' : 'Pending';
                    return (
                      <div key={i} className={`cd-txn cd-txn-${isSuccess ? 'success' : isFailed ? 'failed' : 'pending'}`}>
                        <div className="cd-txn-info">
                          <span className="cd-txn-desc">
                            Recharge {p.paymentMode ? `(${p.paymentMode})` : ''}
                            <span className={`cd-badge ${statusClass(statusLabel)}`}>{statusLabel}</span>
                          </span>
                          <span className="cd-txn-date">{formatDateTime(p.created_at)}</span>
                        </div>
                        <span className={`cd-txn-amount ${isSuccess ? 'green' : isFailed ? 'red' : 'yellow'}`}>
                          {isSuccess ? '+' : ''}{curr}{formatNumber(parseFloat(p.amount || 0))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="cd-empty">No payment logs.</p>
            )}
          </div>
        )}

        {/* Order Detail */}
        {activeTab === 'order' && (
          orders.length > 0 ? (
            <div className="cd-grid">
              {orders.map((o, i) => (
                <div key={i} className="cd-item-card">
                  {o.productImage && (
                    <img src={o.productImage.startsWith('http') ? o.productImage : `/public/storage/images/${o.productImage}`}
                      alt="" className="cd-item-img"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="cd-item-product">{o.productCategory} - {o.productName}</div>
                  <div className="cd-item-address">
                    {[o.flatNo, o.locality, o.city, o.state, o.orderCountry, o.orderPincode].filter(Boolean).join(', ')}
                  </div>
                  <div className="cd-item-body">
                    <div className="cd-item-stat"><span>Payable: <strong>{curr}{formatNumber(o.payableAmount || o.productAmount || 0)}</strong></span></div>
                    {o.gstPercent > 0 && <div className="cd-item-stat"><span>GST: {o.gstPercent}%</span></div>}
                    <div className="cd-item-stat"><span>Total: <strong>{curr}{formatNumber(o.totalAmount || o.productAmount || 0)}</strong></span></div>
                  </div>
                  <div className="cd-item-time">{formatDateTime(o.created_at)}</div>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No orders.</p>
        )}

        {/* Puja Orders */}
        {activeTab === 'puja' && (
          pujaOrders.length > 0 ? (
            <div className="cd-grid">
              {pujaOrders.map((p, i) => (
                <div key={i} className="cd-item-card">
                  {p.pujaImage && (
                    <img src={p.pujaImage.startsWith('http') ? p.pujaImage : `/public/storage/images/${p.pujaImage}`}
                      alt="" className="cd-item-img"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="cd-item-product" style={{ color: '#7c3aed' }}>{p.pujaName || 'Puja'}</div>
                  <div className="cd-item-body">
                    <div className="cd-item-stat"><span>Amount: <strong>{curr}{formatNumber(p.amount || 0)}</strong></span></div>
                  </div>
                  <div className="cd-item-top" style={{ marginTop: 8 }}>
                    <span className={`cd-badge ${statusClass(p.status)}`}>{p.status || '-'}</span>
                    <span className="cd-item-time">{formatDateTime(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No puja orders.</p>
        )}

        {/* Report */}
        {activeTab === 'report' && (
          reportHistory.length > 0 ? (
            <div className="cd-txn-list">
              {reportHistory.map((r, i) => (
                <div key={i} className="cd-txn">
                  <div className="cd-txn-info">
                    <span className="cd-txn-desc">{r.astrologerName}</span>
                    <span className="cd-txn-date">{r.reportTitle || '-'} &middot; {formatDateTime(r.created_at)}</span>
                  </div>
                  <span className="cd-txn-amount purple">{curr}{formatNumber(r.reportRate || 0)}</span>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No reports.</p>
        )}

        {/* Following List */}
        {activeTab === 'following' && (
          followers.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followers.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><img src={imgSrc(f.profileImage)} alt="" className="cd-tbl-avatar" onError={e => { e.target.src = fallbackSvg; }} /></td>
                      <td className="cd-tbl-name">{f.name}</td>
                      <td>{f.contactNo || '-'}</td>
                      <td>{formatDate(f.followingDate)}</td>
                      <td>
                        <button onClick={() => navigate(`/admin/astrologers/${f.id}`)} className="cd-icon-btn" title="View">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">Not following any astrologers.</p>
        )}

        {/* Notification */}
        {activeTab === 'notification' && (
          notifications.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Title</th><th>Description</th></tr></thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{n.title || '-'}</td>
                      <td>{n.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No notifications.</p>
        )}

        {/* Gift */}
        {activeTab === 'gift' && (
          gifts.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Astrologer</th><th>Gift</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {gifts.map((g, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{g.astrologerName || '-'}</td>
                      <td>{g.giftName || '-'}</td>
                      <td className="cd-tbl-red">(-) {curr}{formatNumber(g.giftAmount || g.amount || 0)}</td>
                      <td>{formatDate(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No gifts sent.</p>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="cd-irow">
    <span className="cd-irow-label">{label}</span>
    <span className="cd-irow-value">{value || '-'}</span>
  </div>
);

export default CustomerDetail;
