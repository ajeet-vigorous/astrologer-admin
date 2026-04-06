import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { Eye, Phone, MessageSquare, Wallet, FileText, Heart, Bell, Gift, Star, Landmark, Percent, ChevronDown, Contact, UserRound, Sparkles, Clock, IndianRupee, Pencil, X } from 'lucide-react';
import formatNumber from '../utils/formatNumber';
import '../styles/CustomerDetail.css';

const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e5e7eb" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%23999">?</text></svg>';

const AstrologerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [totalOrderValue, setTotalOrderValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [commForm, setCommForm] = useState({ chatCommission: '', callCommission: '', videoCallCommission: '', reportCommission: '', giftCommission: '', pujaCommission: '' });
  const [commSaving, setCommSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await astrologerApi.getDetail(id);
        const result = res.data.result;
        const d = result && result.length > 0 ? result[0] : null;
        setData(d);
        if (d) {
          setTotalOrderValue(d.totalOrder || 0);
          setCommForm({
            chatCommission: d.chatCommission ?? '', callCommission: d.callCommission ?? '',
            videoCallCommission: d.videoCallCommission ?? '', reportCommission: d.reportCommission ?? '',
            giftCommission: d.giftCommission ?? '', pujaCommission: d.pujaCommission ?? '',
          });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader text="Loading astrologer details..." />;
  if (!data) return <div className="cd-empty">Astrologer not found.</div>;

  const chatHistory = data.chatHistory || [];
  const callHistory = data.callHistory || [];
  const wallet = data.wallet || [];
  const reportHistory = data.report || [];
  const pujaOrders = data.pujaOrders || [];
  const followers = data.follower || [];
  const notifications = data.notification || [];
  const gifts = data.gifts || [];
  const availability = data.astrologerAvailability || [];
  const bankDetails = data.bankDetails || {};
  const review = data.review || [];

  const profileImg = data.profileImage
    ? (data.profileImage.startsWith('http') ? data.profileImage : `/public/storage/images/${data.profileImage}`)
    : null;

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

  const renderList = (val) => {
    if (!val) return '-';
    if (Array.isArray(val)) return val.map(v => v.name || v.languageName || v).join(', ') || '-';
    return val;
  };

  const statusClass = (status) => {
    if (!status) return 'cd-badge-default';
    const s = status.toLowerCase();
    if (['completed', 'success', 'accepted', 'approved', 'active'].includes(s)) return 'cd-badge-green';
    if (['cancelled', 'failed', 'rejected'].includes(s)) return 'cd-badge-red';
    if (['pending', 'waiting', 'processing'].includes(s)) return 'cd-badge-yellow';
    return 'cd-badge-default';
  };

  const handleSaveTotalOrder = async () => {
    setSaving(true);
    try {
      await astrologerApi.editTotalOrder({ id, totalOrder: totalOrderValue });
      setData(prev => ({ ...prev, totalOrder: totalOrderValue }));
      setShowOrderModal(false);
    } catch (e) { alert('Failed to update total order.'); }
    setSaving(false);
  };

  const imgSrc = (img) => img ? (img.startsWith('http') ? img : `/public/storage/images/${img}`) : fallbackSvg;

  const stats = [
    { label: 'Orders', value: data.totalOrder || 0, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Followers', value: data.totalFollower || 0, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Chat Min', value: formatNumber(data.chatMin || 0), color: '#2563eb', bg: '#eff6ff' },
    { label: 'Call Min', value: formatNumber(data.callMin || 0), color: '#059669', bg: '#ecfdf5' },
    { label: 'Reviews', value: review.length, color: '#d97706', bg: '#fffbeb' },
  ];

  const tabs = [
    { key: 'basic', label: 'Details', icon: UserRound },
    { key: 'wallet', label: 'Wallet', icon: Wallet, count: wallet.length },
    { key: 'chat', label: 'Chats', icon: MessageSquare, count: chatHistory.length },
    { key: 'call', label: 'Calls', icon: Phone, count: callHistory.length },
    { key: 'report', label: 'Reports', icon: FileText, count: reportHistory.length },
    { key: 'puja', label: 'Puja', icon: Heart, count: pujaOrders.length },
    { key: 'followers', label: 'Followers', icon: Heart, count: followers.length },
    { key: 'notification', label: 'Alerts', icon: Bell, count: notifications.length },
    { key: 'gift', label: 'Gifts', icon: Gift, count: gifts.length },
    { key: 'reviews', label: 'Reviews', icon: Star, count: review.length },
    { key: 'commission', label: 'Commission', icon: Percent },
    { key: 'bank', label: 'Bank', icon: Landmark },
  ];

  return (
    <div className="cd-page ad-page">
      {/* Hero */}
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
              <p className="cd-hero-phone">{data.contactNo}</p>
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
            <span><Contact size={16} /> Contact & Identity</span>
            <ChevronDown size={16} className="cd-accordion-arrow" />
          </button>
          <div className={`cd-accordion-body ${openAccordion === 'contact' ? 'open' : ''}`}>
            <div className="cd-accordion-inner">
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="WhatsApp" value={data.whatsappNo || data.whatsAppNo} />
              <InfoRow label="Aadhar No" value={data.aadharNo || data.aadharNumber} />
              <InfoRow label="Pan No" value={data.panNo || data.panNumber} />
              <InfoRow label="Current City" value={data.currentCity} />
            </div>
          </div>
        </div>
        <div className="cd-accordion">
          <button className={`cd-accordion-header ${openAccordion === 'charges' ? 'open' : ''}`} onClick={() => setOpenAccordion(openAccordion === 'charges' ? null : 'charges')}>
            <span><IndianRupee size={16} /> Charges & Rates</span>
            <ChevronDown size={16} className="cd-accordion-arrow" />
          </button>
          <div className={`cd-accordion-body ${openAccordion === 'charges' ? 'open' : ''}`}>
            <div className="cd-accordion-inner">
              <InfoRow label="Call Rate" value={data.charge ? `₹${data.charge}/min` : '-'} />
              <InfoRow label="Video Call Rate" value={data.videoCallRate ? `₹${data.videoCallRate}/min` : '-'} />
              <InfoRow label="Report Rate" value={data.reportRate ? `₹${data.reportRate}` : '-'} />
              <InfoRow label="Experience" value={data.experienceInYears ? `${data.experienceInYears} years` : '-'} />
              <InfoRow label="Daily Hours" value={data.dailyContribution} />
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

        {/* Basic Detail */}
        {activeTab === 'basic' && (
          <div>
            <div className="ad-section">
              <h4 className="ad-section-title">Personal Information</h4>
              <InfoRow label="Gender" value={data.gender} />
              <InfoRow label="Date of Birth" value={formatDate(data.birthDate || data.dateOfBirth)} />
              <InfoRow label="Category" value={renderList(data.astrologerCategoryId)} />
              <InfoRow label="Primary Skill" value={renderList(data.primarySkill)} />
              <InfoRow label="All Skills" value={renderList(data.allSkill)} />
              <InfoRow label="Languages" value={renderList(data.languageKnown)} />
            </div>

            <div className="ad-section">
              <h4 className="ad-section-title">Professional</h4>
              <InfoRow label="App Reference" value={data.appReference || data.hearAboutAstroguru} />
              <InfoRow label="Why Onboard" value={data.whyOnBoard} />
              <InfoRow label="Highest Qualification" value={data.highestQualification} />
              <InfoRow label="College" value={data.college} />
              <InfoRow label="Degree" value={data.degree} />
              <InfoRow label="Good Quality" value={data.goodQuality} />
            </div>

            <div className="ad-section">
              <h4 className="ad-section-title">Login Bio</h4>
              <p className="ad-bio">{data.loginBio || '-'}</p>
            </div>

            {/* Total Order Edit */}
            <div className="ad-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="ad-section-title" style={{ margin: 0 }}>Total Order: {data.totalOrder || 0}</h4>
                <button onClick={() => { setTotalOrderValue(data.totalOrder || 0); setShowOrderModal(true); }} className="ad-edit-btn">
                  <Pencil size={13} /> Edit
                </button>
              </div>
            </div>

            {/* Availability */}
            {availability.length > 0 && (
              <div className="ad-section">
                <h4 className="ad-section-title">Availability Schedule</h4>
                <div className="cd-table-wrap">
                  <table className="cd-table">
                    <thead><tr><th>Day</th><th>From</th><th>To</th></tr></thead>
                    <tbody>
                      {availability.map((a, i) =>
                        a.time && a.time.length > 0 ? a.time.map((t, j) => (
                          <tr key={`${i}-${j}`}>
                            {j === 0 && <td rowSpan={a.time.length} className="cd-tbl-name">{a.day || '-'}</td>}
                            <td>{t.fromTime || '-'}</td>
                            <td>{t.toTime || '-'}</td>
                          </tr>
                        )) : (
                          <tr key={i}><td className="cd-tbl-name">{a.day || '-'}</td><td>-</td><td>-</td></tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wallet */}
        {activeTab === 'wallet' && (
          wallet.length > 0 ? (
            <div className="cd-txn-list">
              {wallet.map((w, i) => (
                <div key={i} className="cd-txn">
                  <div className="cd-txn-info">
                    <span className="cd-txn-desc">{w.astrologerName || w.name || w.transactionType || '-'}</span>
                    <span className="cd-txn-date">{w.transactionType || '-'} {w.totalMin ? `| ${w.totalMin} min` : ''} &middot; {formatDateTime(w.created_at)}</span>
                  </div>
                  <span className={`cd-txn-amount ${parseFloat(w.amount) >= 0 ? 'green' : 'red'}`}>
                    {parseFloat(w.amount) >= 0 ? '+' : ''}₹{formatNumber(parseFloat(w.amount || 0))}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="cd-empty">No wallet transactions.</p>
        )}

        {/* Chat History */}
        {activeTab === 'chat' && (
          chatHistory.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Customer</th><th>Contact</th><th>Duration</th><th>Rate</th><th>Date</th></tr></thead>
                <tbody>
                  {chatHistory.map((c, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{c.customerName || c.name || '-'}</td>
                      <td>{c.contactNo || c.customerContactNo || '-'}</td>
                      <td>{c.totalMin || 0} min</td>
                      <td>₹{c.chatRate || c.charge || 0}/min</td>
                      <td>{formatDateTime(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No chat history.</p>
        )}

        {/* Call History */}
        {activeTab === 'call' && (
          callHistory.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Customer</th><th>Contact</th><th>Duration</th><th>Rate</th><th>Date</th></tr></thead>
                <tbody>
                  {callHistory.map((c, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{c.customerName || c.name || '-'}</td>
                      <td>{c.contactNo || c.customerContactNo || '-'}</td>
                      <td>{c.totalMin || 0} min</td>
                      <td>₹{c.callRate || c.charge || 0}/min</td>
                      <td>{formatDateTime(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No call history.</p>
        )}

        {/* Report */}
        {activeTab === 'report' && (
          reportHistory.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Customer</th><th>Contact</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {reportHistory.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{r.customerName || r.userName || '-'}</td>
                      <td>{r.contactNo || '-'}</td>
                      <td>{r.reportType || r.reportTitle || '-'}</td>
                      <td><span className={`cd-badge ${statusClass(r.status)}`}>{r.status || '-'}</span></td>
                      <td>{formatDateTime(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No reports.</p>
        )}

        {/* Puja Orders */}
        {activeTab === 'puja' && (
          pujaOrders.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Puja</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {pujaOrders.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{p.pujaName || '-'}</td>
                      <td>₹{formatNumber(p.amount || 0)}</td>
                      <td><span className={`cd-badge ${statusClass(p.status)}`}>{p.status || '-'}</span></td>
                      <td>{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No puja orders.</p>
        )}

        {/* Followers */}
        {activeTab === 'followers' && (
          followers.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Profile</th><th>Name</th><th>Contact</th><th>Date</th></tr></thead>
                <tbody>
                  {followers.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><img src={imgSrc(f.profileImage)} alt="" className="cd-tbl-avatar" onError={e => { e.target.src = fallbackSvg; }} /></td>
                      <td className="cd-tbl-name">{f.userName || f.name || '-'}</td>
                      <td>{f.contactNo || '-'}</td>
                      <td>{formatDateTime(f.created_at || f.followingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No followers.</p>
        )}

        {/* Notifications */}
        {activeTab === 'notification' && (
          notifications.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table"><thead><tr><th>#</th><th>Title</th><th>Description</th></tr></thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr key={i}><td>{i + 1}</td><td className="cd-tbl-name">{n.title || '-'}</td><td>{n.description || '-'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No notifications.</p>
        )}

        {/* Gifts */}
        {activeTab === 'gift' && (
          gifts.length > 0 ? (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead><tr><th>#</th><th>Gift</th><th>Amount</th><th>From</th><th>Contact</th><th>Date</th></tr></thead>
                <tbody>
                  {gifts.map((g, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="cd-tbl-name">{g.giftName || '-'}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>₹{formatNumber(g.giftAmount || g.amount || 0)}</td>
                      <td>{g.userName || g.customerName || '-'}</td>
                      <td>{g.contactNo || '-'}</td>
                      <td>{formatDateTime(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="cd-empty">No gifts received.</p>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div>
            {review.length > 0 && (
              <div className="ad-review-summary">
                <span className="ad-review-star">★</span>
                <span className="ad-review-avg">{(review.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / review.length).toFixed(1)}</span>
                <span className="ad-review-count">/ 5 ({review.length} reviews)</span>
              </div>
            )}
            {review.length === 0 ? <p className="cd-empty">No reviews yet.</p> : (
              <div className="ad-review-list">
                {review.map((r, i) => (
                  <div key={r.id || i} className="ad-review-card">
                    <div className="ad-review-avatar">{(r.user_name || r.userName || 'U')[0].toUpperCase()}</div>
                    <div className="ad-review-body">
                      <div className="ad-review-top">
                        <span className="ad-review-name">{r.user_name || r.userName || 'Customer'}</span>
                        <span className="cd-item-time">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                      </div>
                      <div className="ad-review-stars">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ color: n <= (parseFloat(r.rating) || 0) ? '#f59e0b' : '#d1d5db' }}>★</span>
                        ))}
                        <span className="ad-review-rating">{parseFloat(r.rating || 0).toFixed(1)}</span>
                      </div>
                      <p className="ad-review-text">{r.review || '-'}</p>
                      {r.reply && (
                        <div className="ad-review-reply">
                          <strong>Astrologer Reply:</strong>
                          <p>{r.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commission */}
        {activeTab === 'commission' && (
          <div>
            <div className="ad-comm-header">
              <div>
                <h4 className="ad-section-title" style={{ margin: 0 }}>Custom Commission</h4>
                <p className="ad-comm-note">Empty = Global default. Set custom value to override.</p>
              </div>
              <button onClick={async () => {
                setCommSaving(true);
                try { await astrologerApi.updateCommission({ astrologerId: id, ...commForm }); alert('Commission updated!'); }
                catch(e) { alert('Failed to update'); }
                setCommSaving(false);
              }} disabled={commSaving} className="ad-save-btn">
                {commSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="ad-comm-grid">
              {[
                { key: 'chatCommission', label: 'Chat (%)' },
                { key: 'callCommission', label: 'Call (%)' },
                { key: 'videoCallCommission', label: 'Video Call (%)' },
                { key: 'reportCommission', label: 'Report (%)' },
                { key: 'giftCommission', label: 'Gift (%)' },
                { key: 'pujaCommission', label: 'Puja (%)' },
              ].map(f => (
                <div key={f.key} className="ad-comm-field">
                  <label>{f.label}</label>
                  <input type="number" min="0" max="100" value={commForm[f.key]} onChange={e => setCommForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder="Default" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank Details */}
        {activeTab === 'bank' && (
          <div>
            <h4 className="ad-section-title">Bank Details</h4>
            <InfoRow label="Account Holder" value={bankDetails.accountHolder || bankDetails.accountHolderName} />
            <InfoRow label="Account Number" value={bankDetails.accountNumber} />
            <InfoRow label="IFSC Code" value={bankDetails.ifscCode || bankDetails.ifsc} />
            <InfoRow label="Bank Name" value={bankDetails.bankName} />
            <InfoRow label="Branch" value={bankDetails.branchName || bankDetails.branch} />
          </div>
        )}
      </div>

      {/* Edit Total Order Modal */}
      {showOrderModal && (
        <div className="cust-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="cust-modal cust-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Total Order</h3>
              <button onClick={() => setShowOrderModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-form-group">
                <label>Total Order</label>
                <input type="number" value={totalOrderValue} onChange={e => setTotalOrderValue(e.target.value)} placeholder="Enter total order" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowOrderModal(false)} className="cust-btn cust-btn-ghost">Cancel</button>
                <button onClick={handleSaveTotalOrder} disabled={saving} className="cust-btn cust-btn-primary">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="cd-irow">
    <span className="cd-irow-label">{label}</span>
    <span className="cd-irow-value">{value || '-'}</span>
  </div>
);

export default AstrologerDetail;
