import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';

const AstrologerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [totalOrderValue, setTotalOrderValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await astrologerApi.getDetail(id);
        const result = res.data.result;
        const d = result && result.length > 0 ? result[0] : null;
        setData(d);
        if (d) setTotalOrderValue(d.totalOrder || 0);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading astrologer details...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Astrologer not found.</div>;

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

  const totalChatMinutes = data.chatMin || 0;
  const totalCallMinutes = data.callMin || 0;

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
    let hr = dt.getHours();
    const min = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hr >= 12 ? 'pm' : 'am';
    hr = hr % 12 || 12;
    return `${formatDate(d)} ${hr}:${min} ${ampm}`;
  };

  const renderSkills = (skills) => {
    if (!skills) return '-';
    if (Array.isArray(skills)) return skills.map(s => s.name || s).join(', ') || '-';
    return skills;
  };

  const renderLanguages = (langs) => {
    if (!langs) return '-';
    if (Array.isArray(langs)) return langs.map(l => l.languageName || l).join(', ') || '-';
    return langs;
  };

  const renderCategories = (cats) => {
    if (!cats) return '-';
    if (Array.isArray(cats)) return cats.map(c => c.name || c).join(', ') || '-';
    return cats;
  };

  const handleSaveTotalOrder = async () => {
    setSaving(true);
    try {
      await astrologerApi.editTotalOrder({ id, totalOrder: totalOrderValue });
      setData(prev => ({ ...prev, totalOrder: totalOrderValue }));
      setShowOrderModal(false);
    } catch (e) {
      console.error(e);
      alert('Failed to update total order.');
    }
    setSaving(false);
  };

  const tabs = [
    { key: 'basic', label: 'Basic Detail' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'chat', label: 'Chat History' },
    { key: 'call', label: 'Call History' },
    { key: 'report', label: 'Report' },
    { key: 'puja', label: 'Puja Orders' },
    { key: 'followers', label: 'Followers List' },
    { key: 'notification', label: 'Notification List' },
    { key: 'gift', label: 'Gift List' },
    { key: 'bank', label: 'Bank Details' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin/astrologers')} style={backBtn}>&larr; Back</button>
        <h2 style={{ margin: 0 }}>Astrologer Detail</h2>
      </div>

      {/* Profile Header Section */}
      <div style={{ ...sectionStyle, display: 'flex', gap: 25, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          {profileImg ? (
            <img src={profileImg} alt={data.name}
              style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }}
              onError={e => { e.target.src = fallbackSvg; }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#999' }}>
              {data.name ? data.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <h3 style={{ margin: '0 0 5px' }}>{data.name}</h3>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 3 }}>Contact: {data.contactNo || '-'}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 3 }}>Email: {data.email || '-'}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 3 }}>WhatsApp: {data.whatsappNo || data.whatsAppNo || '-'}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 3 }}>Aadhar No: {data.aadharNo || data.aadharNumber || '-'}</div>
          <div style={{ fontSize: 13, color: '#666' }}>Pan No: {data.panNo || data.panNumber || '-'}</div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
        {/* Total Order */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 6 }}>Total Order</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{data.totalOrder || 0}</div>
          <button onClick={() => { setTotalOrderValue(data.totalOrder || 0); setShowOrderModal(true); }}
            style={{ marginTop: 8, background: '#7c3aed', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
            Edit
          </button>
        </div>
        {/* Total Followers */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 6 }}>Total Followers</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{data.totalFollower || 0}</div>
        </div>
        {/* Total Chat Minutes */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 6 }}>Total Chat Minutes</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{totalChatMinutes}</div>
        </div>
        {/* Total Call Minutes */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 6 }}>Total Call Minutes</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{totalCallMinutes}</div>
        </div>
      </div>

      {/* 10 Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', overflowX: 'auto', background: '#fff', borderRadius: '10px 10px 0 0' }}>
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

        {/* 1. Basic Detail Tab */}
        {activeTab === 'basic' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Personal Information</h4>
            <InfoRow label="Skills" value={renderSkills(data.allSkill)} />
            <InfoRow label="Gender" value={data.gender} />
            <InfoRow label="Date of Birth" value={formatDate(data.birthDate || data.dateOfBirth)} />
            <InfoRow label="Category" value={renderCategories(data.astrologerCategoryId)} />
            <InfoRow label="Primary Skill" value={renderSkills(data.primarySkill)} />
            <InfoRow label="All Skills" value={renderSkills(data.allSkill)} />
            <InfoRow label="Languages" value={renderLanguages(data.languageKnown)} />

            <h4 style={{ marginTop: 20, marginBottom: 15 }}>Charges</h4>
            <InfoRow label="Call Rate" value={data.charge ? '\u20B9' + data.charge + '/min' : '-'} />
            <InfoRow label="Video Call Rate" value={data.videoCallRate ? '\u20B9' + data.videoCallRate + '/min' : '-'} />
            <InfoRow label="Report Rate" value={data.reportRate ? '\u20B9' + data.reportRate : '-'} />

            <h4 style={{ marginTop: 20, marginBottom: 15 }}>Professional Information</h4>
            <InfoRow label="Experience (Years)" value={data.experienceInYears} />
            <InfoRow label="Daily Contribution Hours" value={data.dailyContribution} />
            <InfoRow label="App Reference" value={data.appReference || data.hearAboutAstroguru} />

            <h4 style={{ marginTop: 20, marginBottom: 15 }}>Login Bio</h4>
            <div style={{ padding: '10px 0', fontSize: 13, color: '#333', lineHeight: 1.6 }}>
              {data.loginBio || '-'}
            </div>

            {/* Availability Schedule */}
            <h4 style={{ marginTop: 20, marginBottom: 15 }}>Availability Schedule</h4>
            {availability.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>Day</th>
                    <th style={thStyle}>From Time</th>
                    <th style={thStyle}>To Time</th>
                  </tr>
                </thead>
                <tbody>
                  {availability.map((a, i) => (
                    a.time && a.time.length > 0 ? a.time.map((t, j) => (
                      <tr key={`${i}-${j}`}>
                        {j === 0 && <td style={{ ...tdStyle, fontWeight: 500 }} rowSpan={a.time.length}>{a.day || '-'}</td>}
                        <td style={tdStyle}>{t.fromTime || '-'}</td>
                        <td style={tdStyle}>{t.toTime || '-'}</td>
                      </tr>
                    )) : (
                      <tr key={i}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{a.day || '-'}</td>
                        <td style={tdStyle}>-</td>
                        <td style={tdStyle}>-</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No availability data.</p>}

            {/* Other Info */}
            <h4 style={{ marginTop: 20, marginBottom: 15 }}>Other Information</h4>
            <InfoRow label="Why Onboard" value={data.whyOnBoard} />
            <InfoRow label="Interview Time" value={data.interviewTime} />
            <InfoRow label="Current City" value={data.currentCity} />
            <InfoRow label="Main Source of Business" value={data.mainSourceOfBusiness} />
            <InfoRow label="Highest Qualification" value={data.highestQualification} />
            <InfoRow label="College / Institute" value={data.college} />
            <InfoRow label="Degree" value={data.degree} />
            <InfoRow label="Expected Earnings (Min)" value={data.expectedEarningsMin || data.minimumEarning} />
            <InfoRow label="Expected Earnings (Max)" value={data.expectedEarningsMax || data.maximumEarning} />
            <InfoRow label="Good Quality" value={data.goodQuality} />
            <InfoRow label="Biggest Challenge" value={data.biggestChallenge} />
            <InfoRow label="Foreign Countries Count" value={data.foreignCountriesCount || data.longTermForeignCountries} />
            <InfoRow label="Currently Working" value={data.currentlyWorking != null ? (data.currentlyWorking ? 'Yes' : 'No') : '-'} />
          </div>
        )}

        {/* 2. Wallet Tab */}
        {activeTab === 'wallet' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Wallet Transactions ({wallet.length})</h4>
            {wallet.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wallet.map((w, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f9fa', borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{w.astrologerName || w.name || '-'}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        {w.transactionType || '-'} {w.totalMin ? `| ${w.totalMin} min` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{formatDateTime(w.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: parseFloat(w.amount) >= 0 ? '#059669' : '#dc2626' }}>
                      {parseFloat(w.amount) >= 0 ? '+' : ''}{'\u20B9'}{w.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={emptyText}>No wallet transactions.</p>}
          </div>
        )}

        {/* 3. Chat History Tab */}
        {activeTab === 'chat' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Chat History ({chatHistory.length})</h4>
            {chatHistory.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Customer Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Duration (min)</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {chatHistory.map((c, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{c.customerName || c.name || '-'}</td>
                      <td style={tdStyle}>{c.contactNo || c.customerContactNo || '-'}</td>
                      <td style={tdStyle}>{c.totalMin || 0}</td>
                      <td style={tdStyle}>{'\u20B9'}{c.chatRate || c.charge || 0}/min</td>
                      <td style={tdStyle}>{formatDateTime(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No chat history.</p>}
          </div>
        )}

        {/* 4. Call History Tab */}
        {activeTab === 'call' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Call History ({callHistory.length})</h4>
            {callHistory.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Customer Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Duration (min)</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((c, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{c.customerName || c.name || '-'}</td>
                      <td style={tdStyle}>{c.contactNo || c.customerContactNo || '-'}</td>
                      <td style={tdStyle}>{c.totalMin || 0}</td>
                      <td style={tdStyle}>{'\u20B9'}{c.callRate || c.charge || 0}/min</td>
                      <td style={tdStyle}>{formatDateTime(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No call history.</p>}
          </div>
        )}

        {/* 5. Report Tab */}
        {activeTab === 'report' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Reports ({reportHistory.length})</h4>
            {reportHistory.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Report Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{r.customerName || r.userName || '-'}</td>
                      <td style={tdStyle}>{r.contactNo || '-'}</td>
                      <td style={tdStyle}>{r.reportType || r.reportTitle || '-'}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: statusBg(r.status), color: statusColor(r.status) }}>
                          {r.status || '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDateTime(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No report requests.</p>}
          </div>
        )}

        {/* 6. Puja Orders Tab */}
        {activeTab === 'puja' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Puja Orders ({pujaOrders.length})</h4>
            {pujaOrders.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Puja Name</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pujaOrders.map((p, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{p.pujaName || '-'}</td>
                      <td style={tdStyle}>{'\u20B9'}{p.amount || 0}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: statusBg(p.status), color: statusColor(p.status) }}>
                          {p.status || '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No puja orders.</p>}
          </div>
        )}

        {/* 7. Followers List Tab */}
        {activeTab === 'followers' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Followers List ({followers.length})</h4>
            {followers.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Profile</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Followed On</th>
                  </tr>
                </thead>
                <tbody>
                  {followers.map((f, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>
                        <img
                          src={f.profileImage ? (f.profileImage.startsWith('http') ? f.profileImage : `/public/storage/images/${f.profileImage}`) : fallbackSvg}
                          alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                          onError={e => { e.target.src = fallbackSvg; }} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{f.userName || f.name || '-'}</td>
                      <td style={tdStyle}>{f.contactNo || '-'}</td>
                      <td style={tdStyle}>{formatDateTime(f.created_at || f.followingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No followers.</p>}
          </div>
        )}

        {/* 8. Notification List Tab */}
        {activeTab === 'notification' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Notification List ({notifications.length})</h4>
            {notifications.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{n.title || '-'}</td>
                      <td style={tdStyle}>{n.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No notifications.</p>}
          </div>
        )}

        {/* 9. Gift List Tab */}
        {activeTab === 'gift' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Gift List ({gifts.length})</h4>
            {gifts.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Gift Name</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>From User</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map((g, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {g.giftImage && (
                            <img src={g.giftImage.startsWith('http') ? g.giftImage : `/public/storage/images/${g.giftImage}`}
                              alt={g.giftName} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; }} />
                          )}
                          <span style={{ fontWeight: 500 }}>{g.giftName || '-'}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{'\u20B9'}{g.giftAmount || g.amount || 0}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{g.userName || g.customerName || '-'}</td>
                      <td style={tdStyle}>{g.contactNo || '-'}</td>
                      <td style={tdStyle}>{formatDateTime(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={emptyText}>No gifts received.</p>}
          </div>
        )}

        {/* 10. Bank Details Tab */}
        {activeTab === 'bank' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Bank Details</h4>
            <InfoRow label="Account Holder" value={bankDetails.accountHolder || bankDetails.accountHolderName} />
            <InfoRow label="Account Number" value={bankDetails.accountNumber} />
            <InfoRow label="IFSC Code" value={bankDetails.ifscCode || bankDetails.ifsc} />
            <InfoRow label="Bank Name" value={bankDetails.bankName} />
            <InfoRow label="Branch Name" value={bankDetails.branchName || bankDetails.branch} />
          </div>
        )}
      </div>

      {/* Edit Total Order Modal */}
      {showOrderModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Edit Total Order</h3>
              <button onClick={() => setShowOrderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Total Order</label>
              <input
                type="number"
                value={totalOrderValue}
                onChange={e => setTotalOrderValue(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                placeholder="Enter total order count"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowOrderModal(false)}
                style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleSaveTotalOrder} disabled={saving}
                style={{ padding: '8px 20px', border: 'none', borderRadius: 6, background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared styles
const sectionStyle = { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 20 };
const statCardStyle = { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '10px 15px', textAlign: 'left', fontSize: 12, fontWeight: 600, borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '10px 15px', borderBottom: '1px solid #f0f0f0', fontSize: 13 };
const backBtn = { background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const emptyText = { color: '#999', textAlign: 'center', padding: 30 };
const fallbackSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb" rx="50"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%23999">?</text></svg>';

const modalOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBox = {
  background: '#fff', borderRadius: 10, padding: 25, width: 400, maxWidth: '90%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
};

const statusColor = (status) => {
  if (!status) return '#666';
  const s = status.toLowerCase();
  if (['completed', 'success', 'accepted', 'approved', 'active'].includes(s)) return '#065f46';
  if (['cancelled', 'failed', 'rejected'].includes(s)) return '#991b1b';
  if (['pending', 'waiting', 'processing'].includes(s)) return '#92400e';
  return '#666';
};

const statusBg = (status) => {
  if (!status) return '#f3f4f6';
  const s = status.toLowerCase();
  if (['completed', 'success', 'accepted', 'approved', 'active'].includes(s)) return '#d1fae5';
  if (['cancelled', 'failed', 'rejected'].includes(s)) return '#fee2e2';
  if (['pending', 'waiting', 'processing'].includes(s)) return '#fef3c7';
  return '#f3f4f6';
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
    <span style={{ width: 200, fontWeight: 600, color: '#555', fontSize: 12 }}>{label}</span>
    <span style={{ flex: 1, color: '#333', fontSize: 13 }}>{value || '-'}</span>
  </div>
);

export default AstrologerDetail;
