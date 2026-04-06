import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';
import Loader from '../components/Loader';
import { Sparkles, User, Wrench, Landmark, FileText, Clock, Plus, Trash2 } from 'lucide-react';
import '../styles/AstrologerForm.css';

const AstrologerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [mainSourceBusiness, setMainSourceBusiness] = useState([]);
  const [highestQualifications, setHighestQualifications] = useState([]);

  const [form, setForm] = useState({
    name: '', email: '', countryCode: '+91', contactNo: '', country: 'India',
    whatsappNo: '', aadharNo: '', pancardNo: '', profileImage: '',
    gender: 'Male', birthDate: '',
    astrologerCategoryId: [], primarySkill: [], allSkill: [], languageKnown: [],
    charge: '', videoCallRate: '', reportRate: '',
    charge_usd: '', videoCallRate_usd: '', reportRate_usd: '',
    accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '',
    bankBranch: '', accountType: 'Savings', upi: '',
    experienceInYears: '', dailyContribution: '', hearAboutAstroguru: '',
    isWorkingOnAnotherPlatform: '', whyOnBoard: '', interviewSuitableTime: '',
    currentCity: '', mainSourceOfBusiness: '', highestQualification: '',
    degree: '', college: '', learnAstrology: '',
    minimumEarning: '', maximumEarning: '', loginBio: '',
    NoofforeignCountriesTravel: '', currentlyworkingfulltimejob: '',
    goodQuality: '', biggestChallenge: '', whatwillDo: '',
    nameofplateform: '', monthlyEarning: '', referedPerson: '',
    instaProfileLink: '', linkedInProfileLink: '', facebookProfileLink: '',
    websiteProfileLink: '', youtubeChannelLink: '', isAnyBodyRefer: '',
    astrologerAvailability: [
      { day: 'Sunday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Monday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Tuesday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Wednesday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Thursday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Friday', time: [{ fromTime: '', toTime: '' }] },
      { day: 'Saturday', time: [{ fromTime: '', toTime: '' }] },
    ]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await astrologerApi.getEdit(isEdit ? id : 0);
        const d = res.data;
        setCategories(d.astrologerCategory || []);
        setSkills(d.skills || []);
        setLanguages(d.language || []);
        setMainSourceBusiness(d.mainSourceBusiness || []);
        setHighestQualifications(d.highestQualification || []);

        if (isEdit && d.astrologer) {
          const a = d.astrologer;
          const toArr = (v) => v ? String(v).split(',').map(Number).filter(n => !isNaN(n)) : [];
          setForm(prev => ({
            ...prev, id: a.id,
            name: a.name || '', email: a.email || '', countryCode: a.countryCode || '+91',
            contactNo: a.contactNo || '', country: a.country || 'India',
            whatsappNo: a.whatsappNo || '', aadharNo: a.aadharNo || '', pancardNo: a.pancardNo || '',
            profileImage: a.profileImage || '', gender: a.gender || 'Male',
            birthDate: a.birthDate ? a.birthDate.split('T')[0] : '',
            astrologerCategoryId: toArr(a.astrologerCategoryId), primarySkill: toArr(a.primarySkill),
            allSkill: toArr(a.allSkill), languageKnown: toArr(a.languageKnown),
            charge: a.charge || '', videoCallRate: a.videoCallRate || '', reportRate: a.reportRate || '',
            charge_usd: a.charge_usd || '', videoCallRate_usd: a.videoCallRate_usd || '', reportRate_usd: a.reportRate_usd || '',
            accountHolderName: a.accountHolderName || '', accountNumber: a.accountNumber || '',
            ifscCode: a.ifscCode || '', bankName: a.bankName || '', bankBranch: a.bankBranch || '',
            accountType: a.accountType || 'Savings', upi: a.upi || '',
            experienceInYears: a.experienceInYears || '', dailyContribution: a.dailyContribution || '',
            hearAboutAstroguru: a.hearAboutAstroguru || '', isWorkingOnAnotherPlatform: a.isWorkingOnAnotherPlatform || '',
            whyOnBoard: a.whyOnBoard || '', interviewSuitableTime: a.interviewSuitableTime || '',
            currentCity: a.currentCity || '', mainSourceOfBusiness: a.mainSourceOfBusiness || '',
            highestQualification: a.highestQualification || '', degree: a.degree || '', college: a.college || '',
            learnAstrology: a.learnAstrology || '', minimumEarning: a.minimumEarning || '',
            maximumEarning: a.maximumEarning || '', loginBio: a.loginBio || '',
            NoofforeignCountriesTravel: a.NoofforeignCountriesTravel || '',
            currentlyworkingfulltimejob: a.currentlyworkingfulltimejob || '',
            goodQuality: a.goodQuality || '', biggestChallenge: a.biggestChallenge || '',
            whatwillDo: a.whatwillDo || '', nameofplateform: a.nameofplateform || '',
            monthlyEarning: a.monthlyEarning || '', referedPerson: a.referedPerson || '',
            instaProfileLink: a.instaProfileLink || '', linkedInProfileLink: a.linkedInProfileLink || '',
            facebookProfileLink: a.facebookProfileLink || '', websiteProfileLink: a.websiteProfileLink || '',
            youtubeChannelLink: a.youtubeChannelLink || '', isAnyBodyRefer: a.isAnyBodyRefer || '',
            astrologerAvailability: a.astrologerAvailability?.length > 0 ? a.astrologerAvailability : prev.astrologerAvailability
          }));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [id, isEdit]);

  const h = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: null })); };
  const handleMulti = (field, val) => { const n = Number(val); setForm(prev => ({ ...prev, [field]: prev[field].includes(n) ? prev[field].filter(v => v !== n) : [...prev[field], n] })); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => h('profileImage', reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvail = (di, ti, field, value) => {
    setForm(prev => {
      const avail = [...prev.astrologerAvailability];
      const day = { ...avail[di] }; const times = [...day.time];
      times[ti] = { ...times[ti], [field]: value }; day.time = times; avail[di] = day;
      return { ...prev, astrologerAvailability: avail };
    });
  };
  const addSlot = (di) => { setForm(prev => { const a = [...prev.astrologerAvailability]; a[di] = { ...a[di], time: [...a[di].time, { fromTime: '', toTime: '' }] }; return { ...prev, astrologerAvailability: a }; }); };
  const removeSlot = (di, ti) => { setForm(prev => { const a = [...prev.astrologerAvailability]; if (a[di].time.length <= 1) return prev; a[di] = { ...a[di], time: a[di].time.filter((_, i) => i !== ti) }; return { ...prev, astrologerAvailability: a }; }); };

  const handleSubmit = async () => {
    setSaving(true); setErrors({});
    try {
      const res = isEdit ? await astrologerApi.edit({ ...form }) : await astrologerApi.add({ ...form });
      if (res.data.error && typeof res.data.error === 'object' && !Array.isArray(res.data.error)) { setErrors(res.data.error); setSaving(false); return; }
      alert(isEdit ? 'Astrologer updated!' : 'Astrologer added!');
      navigate('/admin/astrologers');
    } catch (e) { alert('Error: ' + (e.response?.data?.message || e.message)); }
    setSaving(false);
  };

  if (loading) return <Loader text="Loading form..." />;

  const err = (f) => errors[f] ? <div className="af-error">{Array.isArray(errors[f]) ? errors[f][0] : errors[f]}</div> : null;
  const profilePreview = form.profileImage ? (form.profileImage.includes('data:') ? form.profileImage : (form.profileImage.startsWith('http') ? form.profileImage : `/public/${form.profileImage}`)) : null;

  const tabs = [
    { key: 'personal', label: 'Personal', icon: User },
    { key: 'skill', label: 'Skills & Rates', icon: Wrench },
    { key: 'bank', label: 'Bank', icon: Landmark },
    { key: 'other', label: 'Other Details', icon: FileText },
    { key: 'availability', label: 'Availability', icon: Clock },
  ];

  return (
    <div className="af-page">
      <div className="af-header">
        <Sparkles size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit Astrologer' : 'Add Astrologer'}</h2>
      </div>

      <div className="af-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`af-tab ${activeTab === tab.key ? 'active' : ''}`}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="af-card">
        {/* Personal */}
        {activeTab === 'personal' && (
          <div className="af-grid">
            <Field label="Name" req><input className="af-input" value={form.name} onChange={e => h('name', e.target.value)} placeholder="Enter name" />{err('name')}</Field>
            <Field label="Email" req><input className="af-input" type="email" value={form.email} onChange={e => h('email', e.target.value)} placeholder="Enter email" />{err('email')}</Field>
            <Field label="Country Code"><input className="af-input" value={form.countryCode} onChange={e => h('countryCode', e.target.value)} placeholder="+91" /></Field>
            <Field label="Contact Number" req><input className="af-input" value={form.contactNo} onChange={e => h('contactNo', e.target.value)} placeholder="Contact number" />{err('contactNo')}</Field>
            <Field label="Country"><input className="af-input" value={form.country} onChange={e => h('country', e.target.value)} /></Field>
            <Field label="WhatsApp" req><input className="af-input" value={form.whatsappNo} onChange={e => h('whatsappNo', e.target.value)} placeholder="WhatsApp number" />{err('whatsappNo')}</Field>
            <Field label="Aadhar No" req><input className="af-input" value={form.aadharNo} onChange={e => h('aadharNo', e.target.value)} />{err('aadharNo')}</Field>
            <Field label="PAN Card" req><input className="af-input" value={form.pancardNo} onChange={e => h('pancardNo', e.target.value)} />{err('pancardNo')}</Field>
            <div className="af-field af-full">
              <label className="af-label">Profile Image</label>
              <div className="af-img-upload">
                {profilePreview && <img src={profilePreview} alt="Profile" className="af-img-preview" onError={e => { e.target.style.display = 'none'; }} />}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: 13 }} />
              </div>
            </div>
          </div>
        )}

        {/* Skills & Rates */}
        {activeTab === 'skill' && (
          <div className="af-grid">
            <Field label="Gender" req>
              <select className="af-select" value={form.gender} onChange={e => h('gender', e.target.value)}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>{err('gender')}
            </Field>
            <Field label="Birth Date" req><input className="af-input" type="date" value={form.birthDate} onChange={e => h('birthDate', e.target.value)} />{err('birthDate')}</Field>
            <MultiField label="Category" req items={categories} nameKey="name" selected={form.astrologerCategoryId} onChange={v => handleMulti('astrologerCategoryId', v)} error={err('astrologerCategoryId')} />
            <MultiField label="Primary Skills" req items={skills} nameKey="name" selected={form.primarySkill} onChange={v => handleMulti('primarySkill', v)} error={err('primarySkill')} />
            <MultiField label="All Skills" req items={skills} nameKey="name" selected={form.allSkill} onChange={v => handleMulti('allSkill', v)} error={err('allSkill')} />
            <MultiField label="Languages" req items={languages} nameKey="languageName" selected={form.languageKnown} onChange={v => handleMulti('languageKnown', v)} error={err('languageKnown')} />
            <h4 className="af-section-title">Charges (INR)</h4>
            <Field label="Call Rate (INR/min)" req><input className="af-input" type="number" value={form.charge} onChange={e => h('charge', e.target.value)} placeholder="0" />{err('charge')}</Field>
            <Field label="Video Call (INR/min)"><input className="af-input" type="number" value={form.videoCallRate} onChange={e => h('videoCallRate', e.target.value)} placeholder="0" /></Field>
            <Field label="Report Rate (INR)"><input className="af-input" type="number" value={form.reportRate} onChange={e => h('reportRate', e.target.value)} placeholder="0" /></Field>
            <h4 className="af-section-title">Charges (USD)</h4>
            <Field label="Call Rate (USD/min)"><input className="af-input" type="number" value={form.charge_usd} onChange={e => h('charge_usd', e.target.value)} placeholder="0" /></Field>
            <Field label="Video Call (USD/min)"><input className="af-input" type="number" value={form.videoCallRate_usd} onChange={e => h('videoCallRate_usd', e.target.value)} placeholder="0" /></Field>
            <Field label="Report Rate (USD)"><input className="af-input" type="number" value={form.reportRate_usd} onChange={e => h('reportRate_usd', e.target.value)} placeholder="0" /></Field>
          </div>
        )}

        {/* Bank */}
        {activeTab === 'bank' && (
          <div className="af-grid">
            <Field label="Account Holder"><input className="af-input" value={form.accountHolderName} onChange={e => h('accountHolderName', e.target.value)} /></Field>
            <Field label="Account Number" req><input className="af-input" value={form.accountNumber} onChange={e => h('accountNumber', e.target.value)} />{err('accountNumber')}</Field>
            <Field label="IFSC Code" req><input className="af-input" value={form.ifscCode} onChange={e => h('ifscCode', e.target.value)} />{err('ifscCode')}</Field>
            <Field label="Bank Name" req><input className="af-input" value={form.bankName} onChange={e => h('bankName', e.target.value)} />{err('bankName')}</Field>
            <Field label="Branch" req><input className="af-input" value={form.bankBranch} onChange={e => h('bankBranch', e.target.value)} />{err('bankBranch')}</Field>
            <Field label="Account Type">
              <select className="af-select" value={form.accountType} onChange={e => h('accountType', e.target.value)}>
                <option value="Savings">Savings</option><option value="Current">Current</option>
              </select>
            </Field>
            <Field label="UPI ID"><input className="af-input" value={form.upi} onChange={e => h('upi', e.target.value)} /></Field>
          </div>
        )}

        {/* Other */}
        {activeTab === 'other' && (
          <div className="af-grid">
            <Field label="Experience (Years)"><input className="af-input" type="number" value={form.experienceInYears} onChange={e => h('experienceInYears', e.target.value)} /></Field>
            <Field label="Daily Hours" req><input className="af-input" value={form.dailyContribution} onChange={e => h('dailyContribution', e.target.value)} />{err('dailyContribution')}</Field>
            <Field label="Current City"><input className="af-input" value={form.currentCity} onChange={e => h('currentCity', e.target.value)} /></Field>
            <Field label="Interview Time" req><input className="af-input" value={form.interviewSuitableTime} onChange={e => h('interviewSuitableTime', e.target.value)} />{err('interviewSuitableTime')}</Field>
            <Field label="Source of Business" req>
              {mainSourceBusiness.length > 0 ? (
                <select className="af-select" value={form.mainSourceOfBusiness} onChange={e => h('mainSourceOfBusiness', e.target.value)}>
                  <option value="">-- Select --</option>
                  {mainSourceBusiness.map(m => <option key={m.id} value={m.name || m.id}>{m.name}</option>)}
                </select>
              ) : <input className="af-input" value={form.mainSourceOfBusiness} onChange={e => h('mainSourceOfBusiness', e.target.value)} />}
              {err('mainSourceOfBusiness')}
            </Field>
            <Field label="Highest Qualification" req>
              {highestQualifications.length > 0 ? (
                <select className="af-select" value={form.highestQualification} onChange={e => h('highestQualification', e.target.value)}>
                  <option value="">-- Select --</option>
                  {highestQualifications.map(q => <option key={q.id} value={q.name || q.id}>{q.name}</option>)}
                </select>
              ) : <input className="af-input" value={form.highestQualification} onChange={e => h('highestQualification', e.target.value)} />}
              {err('highestQualification')}
            </Field>
            <Field label="Degree"><input className="af-input" value={form.degree} onChange={e => h('degree', e.target.value)} /></Field>
            <Field label="College"><input className="af-input" value={form.college} onChange={e => h('college', e.target.value)} /></Field>
            <Field label="Learn Astrology"><input className="af-input" value={form.learnAstrology} onChange={e => h('learnAstrology', e.target.value)} /></Field>
            <Field label="Hear About Us"><input className="af-input" value={form.hearAboutAstroguru} onChange={e => h('hearAboutAstroguru', e.target.value)} /></Field>
            <Field label="Another Platform"><input className="af-input" value={form.isWorkingOnAnotherPlatform} onChange={e => h('isWorkingOnAnotherPlatform', e.target.value)} placeholder="Yes/No" /></Field>
            <Field label="Platform Name"><input className="af-input" value={form.nameofplateform} onChange={e => h('nameofplateform', e.target.value)} /></Field>
            <Field label="Monthly Earning"><input className="af-input" type="number" value={form.monthlyEarning} onChange={e => h('monthlyEarning', e.target.value)} /></Field>
            <Field label="Min Earning" req><input className="af-input" type="number" value={form.minimumEarning} onChange={e => h('minimumEarning', e.target.value)} />{err('minimumEarning')}</Field>
            <Field label="Max Earning" req><input className="af-input" type="number" value={form.maximumEarning} onChange={e => h('maximumEarning', e.target.value)} />{err('maximumEarning')}</Field>
            <Field label="Foreign Countries" req><input className="af-input" value={form.NoofforeignCountriesTravel} onChange={e => h('NoofforeignCountriesTravel', e.target.value)} />{err('NoofforeignCountriesTravel')}</Field>
            <Field label="Full Time Job" req><input className="af-input" value={form.currentlyworkingfulltimejob} onChange={e => h('currentlyworkingfulltimejob', e.target.value)} placeholder="Yes/No" />{err('currentlyworkingfulltimejob')}</Field>
            <div className="af-field af-full"><label className="af-label">Why Onboard <span className="af-req">*</span></label><textarea className="af-textarea" value={form.whyOnBoard} onChange={e => h('whyOnBoard', e.target.value)} />{err('whyOnBoard')}</div>
            <div className="af-field af-full"><label className="af-label">Good Quality <span className="af-req">*</span></label><textarea className="af-textarea" value={form.goodQuality} onChange={e => h('goodQuality', e.target.value)} />{err('goodQuality')}</div>
            <div className="af-field af-full"><label className="af-label">Biggest Challenge <span className="af-req">*</span></label><textarea className="af-textarea" value={form.biggestChallenge} onChange={e => h('biggestChallenge', e.target.value)} />{err('biggestChallenge')}</div>
            <div className="af-field af-full"><label className="af-label">What Will You Do <span className="af-req">*</span></label><textarea className="af-textarea" value={form.whatwillDo} onChange={e => h('whatwillDo', e.target.value)} />{err('whatwillDo')}</div>
            <div className="af-field af-full"><label className="af-label">Login Bio</label><textarea className="af-textarea" value={form.loginBio} onChange={e => h('loginBio', e.target.value)} style={{ minHeight: 90 }} /></div>
            <h4 className="af-section-title">Referral & Social</h4>
            <Field label="Anybody Refer"><input className="af-input" value={form.isAnyBodyRefer} onChange={e => h('isAnyBodyRefer', e.target.value)} /></Field>
            <Field label="Referred Person"><input className="af-input" value={form.referedPerson} onChange={e => h('referedPerson', e.target.value)} /></Field>
            <Field label="Instagram"><input className="af-input" value={form.instaProfileLink} onChange={e => h('instaProfileLink', e.target.value)} /></Field>
            <Field label="LinkedIn"><input className="af-input" value={form.linkedInProfileLink} onChange={e => h('linkedInProfileLink', e.target.value)} /></Field>
            <Field label="Facebook"><input className="af-input" value={form.facebookProfileLink} onChange={e => h('facebookProfileLink', e.target.value)} /></Field>
            <Field label="Website"><input className="af-input" value={form.websiteProfileLink} onChange={e => h('websiteProfileLink', e.target.value)} /></Field>
            <Field label="YouTube"><input className="af-input" value={form.youtubeChannelLink} onChange={e => h('youtubeChannelLink', e.target.value)} /></Field>
          </div>
        )}

        {/* Availability */}
        {activeTab === 'availability' && (
          <div className="af-avail-grid">
            {form.astrologerAvailability.map((day, di) => (
              <div key={di} className="af-day-card">
                <div className="af-day-header">
                  <div className="af-day-left">
                    <span className="af-day-badge">{day.day.slice(0, 3)}</span>
                    <span className="af-day-name">{day.day}</span>
                  </div>
                  <span className="af-slot-count">{day.time.filter(t => t.fromTime && t.toTime).length} slot{day.time.filter(t => t.fromTime && t.toTime).length !== 1 ? 's' : ''}</span>
                </div>
                <div className="af-slots">
                  {day.time.map((slot, ti) => (
                    <div key={ti} className="af-slot-item">
                      <div className="af-slot-inputs">
                        <div className="af-slot-field">
                          <label>From</label>
                          <input type="time" value={slot.fromTime || ''} onChange={e => handleAvail(di, ti, 'fromTime', e.target.value)} />
                        </div>
                        <span className="af-slot-arrow">→</span>
                        <div className="af-slot-field">
                          <label>To</label>
                          <input type="time" value={slot.toTime || ''} onChange={e => handleAvail(di, ti, 'toTime', e.target.value)} />
                        </div>
                      </div>
                      {day.time.length > 1 && (
                        <button onClick={() => removeSlot(di, ti)} className="af-slot-remove" title="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => addSlot(di)} className="af-slot-add"><Plus size={13} /> Add Slot</button>
              </div>
            ))}
          </div>
        )}

        <div className="af-footer">
          <button onClick={() => navigate('/admin/astrologers')} className="af-btn-cancel">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="af-btn-submit">
            {saving ? 'Saving...' : (isEdit ? 'Update Astrologer' : 'Add Astrologer')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, req, children }) => (
  <div className="af-field">
    <label className="af-label">{label} {req && <span className="af-req">*</span>}</label>
    {children}
  </div>
);

const MultiField = ({ label, req, items, nameKey, selected, onChange, error }) => (
  <div className="af-field af-full">
    <label className="af-label">{label} {req && <span className="af-req">*</span>}</label>
    <div className="af-multi-box">
      {items.map(item => (
        <label key={item.id} className="af-check-label">
          <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onChange(item.id)} />
          {item[nameKey] || item.name}
        </label>
      ))}
    </div>
    {error}
  </div>
);

export default AstrologerForm;
