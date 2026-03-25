import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astrologerApi } from '../api/services';

const AstrologerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [mainSourceBusiness, setMainSourceBusiness] = useState([]);
  const [highestQualifications, setHighestQualifications] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [countryTravel, setCountryTravel] = useState([]);

  // Form data
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
        if (isEdit) {
          const res = await astrologerApi.getEdit(id);
          const d = res.data;
          setCategories(d.astrologerCategory || []);
          setSkills(d.skills || []);
          setLanguages(d.language || []);
          setMainSourceBusiness(d.mainSourceBusiness || []);
          setHighestQualifications(d.highestQualification || []);
          setQualifications(d.qualifications || []);
          setJobs(d.jobs || []);
          setCountryTravel(d.countryTravel || []);

          const a = d.astrologer;
          if (a) {
            const catIds = a.astrologerCategoryId ? String(a.astrologerCategoryId).split(',').map(Number).filter(n => !isNaN(n)) : [];
            const priIds = a.primarySkill ? String(a.primarySkill).split(',').map(Number).filter(n => !isNaN(n)) : [];
            const allIds = a.allSkill ? String(a.allSkill).split(',').map(Number).filter(n => !isNaN(n)) : [];
            const langIds = a.languageKnown ? String(a.languageKnown).split(',').map(Number).filter(n => !isNaN(n)) : [];

            setForm(prev => ({
              ...prev,
              id: a.id,
              name: a.name || '', email: a.email || '',
              countryCode: a.countryCode || '+91', contactNo: a.contactNo || '',
              country: a.country || 'India',
              whatsappNo: a.whatsappNo || '', aadharNo: a.aadharNo || '', pancardNo: a.pancardNo || '',
              profileImage: a.profileImage || '',
              gender: a.gender || 'Male', birthDate: a.birthDate ? a.birthDate.split('T')[0] : '',
              astrologerCategoryId: catIds, primarySkill: priIds, allSkill: allIds, languageKnown: langIds,
              charge: a.charge || '', videoCallRate: a.videoCallRate || '', reportRate: a.reportRate || '',
              charge_usd: a.charge_usd || '', videoCallRate_usd: a.videoCallRate_usd || '', reportRate_usd: a.reportRate_usd || '',
              accountHolderName: a.accountHolderName || '', accountNumber: a.accountNumber || '',
              ifscCode: a.ifscCode || '', bankName: a.bankName || '',
              bankBranch: a.bankBranch || '', accountType: a.accountType || 'Savings', upi: a.upi || '',
              experienceInYears: a.experienceInYears || '', dailyContribution: a.dailyContribution || '',
              hearAboutAstroguru: a.hearAboutAstroguru || '',
              isWorkingOnAnotherPlatform: a.isWorkingOnAnotherPlatform || '',
              whyOnBoard: a.whyOnBoard || '', interviewSuitableTime: a.interviewSuitableTime || '',
              currentCity: a.currentCity || '', mainSourceOfBusiness: a.mainSourceOfBusiness || '',
              highestQualification: a.highestQualification || '',
              degree: a.degree || '', college: a.college || '', learnAstrology: a.learnAstrology || '',
              minimumEarning: a.minimumEarning || '', maximumEarning: a.maximumEarning || '',
              loginBio: a.loginBio || '',
              NoofforeignCountriesTravel: a.NoofforeignCountriesTravel || '',
              currentlyworkingfulltimejob: a.currentlyworkingfulltimejob || '',
              goodQuality: a.goodQuality || '', biggestChallenge: a.biggestChallenge || '',
              whatwillDo: a.whatwillDo || '',
              nameofplateform: a.nameofplateform || '', monthlyEarning: a.monthlyEarning || '',
              referedPerson: a.referedPerson || '',
              instaProfileLink: a.instaProfileLink || '', linkedInProfileLink: a.linkedInProfileLink || '',
              facebookProfileLink: a.facebookProfileLink || '', websiteProfileLink: a.websiteProfileLink || '',
              youtubeChannelLink: a.youtubeChannelLink || '', isAnyBodyRefer: a.isAnyBodyRefer || '',
              astrologerAvailability: a.astrologerAvailability && a.astrologerAvailability.length > 0
                ? a.astrologerAvailability
                : prev.astrologerAvailability
            }));
          }
        } else {
          // For add, fetch dropdown options from edit endpoint with id=0 or load separately
          try {
            const res = await astrologerApi.getEdit(0);
            const d = res.data;
            setCategories(d.astrologerCategory || []);
            setSkills(d.skills || []);
            setLanguages(d.language || []);
            setMainSourceBusiness(d.mainSourceBusiness || []);
            setHighestQualifications(d.highestQualification || []);
            setQualifications(d.qualifications || []);
            setJobs(d.jobs || []);
            setCountryTravel(d.countryTravel || []);
          } catch (e) {
            // Fallback: load categories and skills separately if edit/0 fails
            console.error('Could not load form data:', e);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleMultiSelect = (field, val) => {
    const numVal = Number(val);
    setForm(prev => {
      const arr = prev[field] || [];
      if (arr.includes(numVal)) {
        return { ...prev, [field]: arr.filter(v => v !== numVal) };
      }
      return { ...prev, [field]: [...arr, numVal] };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('profileImage', reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvailabilityChange = (dayIndex, timeIndex, field, value) => {
    setForm(prev => {
      const avail = [...prev.astrologerAvailability];
      const day = { ...avail[dayIndex] };
      const times = [...day.time];
      times[timeIndex] = { ...times[timeIndex], [field]: value };
      day.time = times;
      avail[dayIndex] = day;
      return { ...prev, astrologerAvailability: avail };
    });
  };

  const addTimeSlot = (dayIndex) => {
    setForm(prev => {
      const avail = [...prev.astrologerAvailability];
      const day = { ...avail[dayIndex] };
      day.time = [...day.time, { fromTime: '', toTime: '' }];
      avail[dayIndex] = day;
      return { ...prev, astrologerAvailability: avail };
    });
  };

  const removeTimeSlot = (dayIndex, timeIndex) => {
    setForm(prev => {
      const avail = [...prev.astrologerAvailability];
      const day = { ...avail[dayIndex] };
      if (day.time.length <= 1) return prev;
      day.time = day.time.filter((_, i) => i !== timeIndex);
      avail[dayIndex] = day;
      return { ...prev, astrologerAvailability: avail };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrors({});
    try {
      const payload = { ...form };
      let res;
      if (isEdit) {
        res = await astrologerApi.edit(payload);
      } else {
        res = await astrologerApi.add(payload);
      }

      if (res.data.error && typeof res.data.error === 'object' && !Array.isArray(res.data.error)) {
        setErrors(res.data.error);
        setSaving(false);
        return;
      }

      alert(isEdit ? 'Astrologer updated successfully!' : 'Astrologer added successfully!');
      navigate('/admin/astrologers');
    } catch (e) {
      console.error(e);
      alert('Error: ' + (e.response?.data?.message || e.message));
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  const tabs = [
    { key: 'personal', label: 'Personal Detail' },
    { key: 'skill', label: 'Skill Detail' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'other', label: 'Other Details' },
    { key: 'availability', label: 'Availability' },
  ];

  const renderError = (field) => {
    if (!errors[field]) return null;
    const msg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
    return <div style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{msg}</div>;
  };

  const profilePreview = form.profileImage
    ? (form.profileImage.includes('data:') ? form.profileImage : (form.profileImage.startsWith('http') ? form.profileImage : `/public/${form.profileImage}`))
    : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin/astrologers')} style={backBtn}>&larr; Back</button>
        <h2 style={{ margin: 0 }}>{isEdit ? 'Edit Astrologer' : 'Add Astrologer'}</h2>
      </div>

      {/* Tabs */}
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

      <div style={sectionStyle}>
        {/* Tab 1: Personal Detail */}
        {activeTab === 'personal' && (
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Enter name" />
              {renderError('name')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="Enter email" />
              {renderError('email')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Country Code</label>
              <input style={inputStyle} value={form.countryCode} onChange={e => handleChange('countryCode', e.target.value)} placeholder="+91" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Number *</label>
              <input style={inputStyle} value={form.contactNo} onChange={e => handleChange('contactNo', e.target.value)} placeholder="Enter contact number" />
              {renderError('contactNo')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} value={form.country} onChange={e => handleChange('country', e.target.value)} placeholder="India" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>WhatsApp Number *</label>
              <input style={inputStyle} value={form.whatsappNo} onChange={e => handleChange('whatsappNo', e.target.value)} placeholder="Enter WhatsApp number" />
              {renderError('whatsappNo')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Aadhar Number *</label>
              <input style={inputStyle} value={form.aadharNo} onChange={e => handleChange('aadharNo', e.target.value)} placeholder="Enter Aadhar number" />
              {renderError('aadharNo')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>PAN Card Number *</label>
              <input style={inputStyle} value={form.pancardNo} onChange={e => handleChange('pancardNo', e.target.value)} placeholder="Enter PAN card number" />
              {renderError('pancardNo')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Profile Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                {profilePreview && (
                  <img src={profilePreview} alt="Profile"
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: 13 }} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Skill Detail */}
        {activeTab === 'skill' && (
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Gender *</label>
              <select style={inputStyle} value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {renderError('gender')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Birth Date *</label>
              <input style={inputStyle} type="date" value={form.birthDate} onChange={e => handleChange('birthDate', e.target.value)} />
              {renderError('birthDate')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Astrologer Category *</label>
              <div style={multiSelectBox}>
                {categories.map(c => (
                  <label key={c.id} style={checkLabel}>
                    <input type="checkbox" checked={form.astrologerCategoryId.includes(c.id)}
                      onChange={() => handleMultiSelect('astrologerCategoryId', c.id)} />
                    <span style={{ marginLeft: 5 }}>{c.name}</span>
                  </label>
                ))}
              </div>
              {renderError('astrologerCategoryId')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Primary Skills *</label>
              <div style={multiSelectBox}>
                {skills.map(s => (
                  <label key={s.id} style={checkLabel}>
                    <input type="checkbox" checked={form.primarySkill.includes(s.id)}
                      onChange={() => handleMultiSelect('primarySkill', s.id)} />
                    <span style={{ marginLeft: 5 }}>{s.name}</span>
                  </label>
                ))}
              </div>
              {renderError('primarySkill')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>All Skills *</label>
              <div style={multiSelectBox}>
                {skills.map(s => (
                  <label key={s.id} style={checkLabel}>
                    <input type="checkbox" checked={form.allSkill.includes(s.id)}
                      onChange={() => handleMultiSelect('allSkill', s.id)} />
                    <span style={{ marginLeft: 5 }}>{s.name}</span>
                  </label>
                ))}
              </div>
              {renderError('allSkill')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Languages Known *</label>
              <div style={multiSelectBox}>
                {languages.map(l => (
                  <label key={l.id} style={checkLabel}>
                    <input type="checkbox" checked={form.languageKnown.includes(l.id)}
                      onChange={() => handleMultiSelect('languageKnown', l.id)} />
                    <span style={{ marginLeft: 5 }}>{l.languageName || l.name}</span>
                  </label>
                ))}
              </div>
              {renderError('languageKnown')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Charge (INR/min) *</label>
              <input style={inputStyle} type="number" value={form.charge} onChange={e => handleChange('charge', e.target.value)} placeholder="0" />
              {renderError('charge')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Video Call Rate (INR/min)</label>
              <input style={inputStyle} type="number" value={form.videoCallRate} onChange={e => handleChange('videoCallRate', e.target.value)} placeholder="0" />
              {renderError('videoCallRate')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Report Rate (INR)</label>
              <input style={inputStyle} type="number" value={form.reportRate} onChange={e => handleChange('reportRate', e.target.value)} placeholder="0" />
              {renderError('reportRate')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Charge (USD/min)</label>
              <input style={inputStyle} type="number" value={form.charge_usd} onChange={e => handleChange('charge_usd', e.target.value)} placeholder="0" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Video Call Rate (USD/min)</label>
              <input style={inputStyle} type="number" value={form.videoCallRate_usd} onChange={e => handleChange('videoCallRate_usd', e.target.value)} placeholder="0" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Report Rate (USD)</label>
              <input style={inputStyle} type="number" value={form.reportRate_usd} onChange={e => handleChange('reportRate_usd', e.target.value)} placeholder="0" />
            </div>
          </div>
        )}

        {/* Tab 3: Bank Details */}
        {activeTab === 'bank' && (
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Account Holder Name</label>
              <input style={inputStyle} value={form.accountHolderName} onChange={e => handleChange('accountHolderName', e.target.value)} placeholder="Account holder name" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Account Number *</label>
              <input style={inputStyle} value={form.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} placeholder="Account number" />
              {renderError('accountNumber')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>IFSC Code *</label>
              <input style={inputStyle} value={form.ifscCode} onChange={e => handleChange('ifscCode', e.target.value)} placeholder="IFSC code" />
              {renderError('ifscCode')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Bank Name *</label>
              <input style={inputStyle} value={form.bankName} onChange={e => handleChange('bankName', e.target.value)} placeholder="Bank name" />
              {renderError('bankName')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Branch Name *</label>
              <input style={inputStyle} value={form.bankBranch} onChange={e => handleChange('bankBranch', e.target.value)} placeholder="Branch name" />
              {renderError('bankBranch')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Account Type</label>
              <select style={inputStyle} value={form.accountType} onChange={e => handleChange('accountType', e.target.value)}>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>UPI ID</label>
              <input style={inputStyle} value={form.upi} onChange={e => handleChange('upi', e.target.value)} placeholder="UPI ID" />
            </div>
          </div>
        )}

        {/* Tab 4: Other Details */}
        {activeTab === 'other' && (
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Experience (Years)</label>
              <input style={inputStyle} type="number" value={form.experienceInYears} onChange={e => handleChange('experienceInYears', e.target.value)} placeholder="Years" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Daily Contribution (Hrs) *</label>
              <input style={inputStyle} value={form.dailyContribution} onChange={e => handleChange('dailyContribution', e.target.value)} placeholder="Hours per day" />
              {renderError('dailyContribution')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current City</label>
              <input style={inputStyle} value={form.currentCity} onChange={e => handleChange('currentCity', e.target.value)} placeholder="City" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Interview Suitable Time *</label>
              <input style={inputStyle} value={form.interviewSuitableTime} onChange={e => handleChange('interviewSuitableTime', e.target.value)} placeholder="Suitable time" />
              {renderError('interviewSuitableTime')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Main Source of Business *</label>
              {mainSourceBusiness.length > 0 ? (
                <select style={inputStyle} value={form.mainSourceOfBusiness} onChange={e => handleChange('mainSourceOfBusiness', e.target.value)}>
                  <option value="">-- Select --</option>
                  {mainSourceBusiness.map(m => <option key={m.id} value={m.name || m.id}>{m.name}</option>)}
                </select>
              ) : (
                <input style={inputStyle} value={form.mainSourceOfBusiness} onChange={e => handleChange('mainSourceOfBusiness', e.target.value)} placeholder="Main source" />
              )}
              {renderError('mainSourceOfBusiness')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Highest Qualification *</label>
              {highestQualifications.length > 0 ? (
                <select style={inputStyle} value={form.highestQualification} onChange={e => handleChange('highestQualification', e.target.value)}>
                  <option value="">-- Select --</option>
                  {highestQualifications.map(h => <option key={h.id} value={h.name || h.id}>{h.name}</option>)}
                </select>
              ) : (
                <input style={inputStyle} value={form.highestQualification} onChange={e => handleChange('highestQualification', e.target.value)} placeholder="Qualification" />
              )}
              {renderError('highestQualification')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Degree / Diploma</label>
              <input style={inputStyle} value={form.degree} onChange={e => handleChange('degree', e.target.value)} placeholder="Degree" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>College / Institute</label>
              <input style={inputStyle} value={form.college} onChange={e => handleChange('college', e.target.value)} placeholder="College" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>How Did You Learn Astrology</label>
              <input style={inputStyle} value={form.learnAstrology} onChange={e => handleChange('learnAstrology', e.target.value)} placeholder="Self / Guru / Course" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Hear About AstroGuru</label>
              <input style={inputStyle} value={form.hearAboutAstroguru} onChange={e => handleChange('hearAboutAstroguru', e.target.value)} placeholder="Source" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Working On Another Platform</label>
              <input style={inputStyle} value={form.isWorkingOnAnotherPlatform} onChange={e => handleChange('isWorkingOnAnotherPlatform', e.target.value)} placeholder="Yes/No" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Platform Name</label>
              <input style={inputStyle} value={form.nameofplateform} onChange={e => handleChange('nameofplateform', e.target.value)} placeholder="Platform name" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Monthly Earning From Platform</label>
              <input style={inputStyle} type="number" value={form.monthlyEarning} onChange={e => handleChange('monthlyEarning', e.target.value)} placeholder="Amount" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Minimum Earning *</label>
              <input style={inputStyle} type="number" value={form.minimumEarning} onChange={e => handleChange('minimumEarning', e.target.value)} placeholder="Min earning" />
              {renderError('minimumEarning')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Maximum Earning *</label>
              <input style={inputStyle} type="number" value={form.maximumEarning} onChange={e => handleChange('maximumEarning', e.target.value)} placeholder="Max earning" />
              {renderError('maximumEarning')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>No. of Foreign Countries Travel *</label>
              <input style={inputStyle} value={form.NoofforeignCountriesTravel} onChange={e => handleChange('NoofforeignCountriesTravel', e.target.value)} placeholder="Number" />
              {renderError('NoofforeignCountriesTravel')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Currently Working Full Time Job *</label>
              <input style={inputStyle} value={form.currentlyworkingfulltimejob} onChange={e => handleChange('currentlyworkingfulltimejob', e.target.value)} placeholder="Yes/No" />
              {renderError('currentlyworkingfulltimejob')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Why Onboard *</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.whyOnBoard} onChange={e => handleChange('whyOnBoard', e.target.value)} placeholder="Why do you want to join?" />
              {renderError('whyOnBoard')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Good Quality *</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.goodQuality} onChange={e => handleChange('goodQuality', e.target.value)} placeholder="Your best quality" />
              {renderError('goodQuality')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Biggest Challenge *</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.biggestChallenge} onChange={e => handleChange('biggestChallenge', e.target.value)} placeholder="Biggest challenge" />
              {renderError('biggestChallenge')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>What Will You Do *</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.whatwillDo} onChange={e => handleChange('whatwillDo', e.target.value)} placeholder="What will you do to grow?" />
              {renderError('whatwillDo')}
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Login Bio</label>
              <textarea style={{ ...inputStyle, minHeight: 80 }} value={form.loginBio} onChange={e => handleChange('loginBio', e.target.value)} placeholder="Bio for profile" />
              {renderError('loginBio')}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Is Anybody Refer</label>
              <input style={inputStyle} value={form.isAnyBodyRefer} onChange={e => handleChange('isAnyBodyRefer', e.target.value)} placeholder="Yes/No" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Referred Person</label>
              <input style={inputStyle} value={form.referedPerson} onChange={e => handleChange('referedPerson', e.target.value)} placeholder="Name" />
            </div>
            <h4 style={{ gridColumn: '1 / -1', margin: '15px 0 5px' }}>Social Links</h4>
            <div style={fieldStyle}>
              <label style={labelStyle}>Instagram</label>
              <input style={inputStyle} value={form.instaProfileLink} onChange={e => handleChange('instaProfileLink', e.target.value)} placeholder="Instagram URL" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>LinkedIn</label>
              <input style={inputStyle} value={form.linkedInProfileLink} onChange={e => handleChange('linkedInProfileLink', e.target.value)} placeholder="LinkedIn URL" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Facebook</label>
              <input style={inputStyle} value={form.facebookProfileLink} onChange={e => handleChange('facebookProfileLink', e.target.value)} placeholder="Facebook URL" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={form.websiteProfileLink} onChange={e => handleChange('websiteProfileLink', e.target.value)} placeholder="Website URL" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>YouTube</label>
              <input style={inputStyle} value={form.youtubeChannelLink} onChange={e => handleChange('youtubeChannelLink', e.target.value)} placeholder="YouTube URL" />
            </div>
          </div>
        )}

        {/* Tab 5: Availability */}
        {activeTab === 'availability' && (
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 15 }}>Weekly Availability Schedule</h4>
            {form.astrologerAvailability.map((day, di) => (
              <div key={di} style={{ marginBottom: 15, padding: 15, background: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: '#333' }}>{day.day}</div>
                {day.time.map((slot, ti) => (
                  <div key={ti} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#888' }}>From</label>
                      <input type="time" style={{ ...inputStyle, width: 140 }}
                        value={slot.fromTime || ''}
                        onChange={e => handleAvailabilityChange(di, ti, 'fromTime', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#888' }}>To</label>
                      <input type="time" style={{ ...inputStyle, width: 140 }}
                        value={slot.toTime || ''}
                        onChange={e => handleAvailabilityChange(di, ti, 'toTime', e.target.value)} />
                    </div>
                    {day.time.length > 1 && (
                      <button onClick={() => removeTimeSlot(di, ti)}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginTop: 14 }}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addTimeSlot(di)}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                  + Add Time Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 15, borderTop: '1px solid #e5e7eb' }}>
          <button onClick={() => navigate('/admin/astrologers')}
            style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '10px 24px', border: 'none', borderRadius: 6, background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : (isEdit ? 'Update Astrologer' : 'Add Astrologer')}
          </button>
        </div>
      </div>
    </div>
  );
};

const sectionStyle = { background: '#fff', borderRadius: '0 0 10px 10px', padding: 25, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 };
const fieldStyle = { display: 'flex', flexDirection: 'column' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', width: '100%' };
const backBtn = { background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const multiSelectBox = { display: 'flex', flexWrap: 'wrap', gap: 8, padding: 10, border: '1px solid #d1d5db', borderRadius: 6, maxHeight: 150, overflowY: 'auto', background: '#fafafa' };
const checkLabel = { display: 'flex', alignItems: 'center', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' };

export default AstrologerForm;
