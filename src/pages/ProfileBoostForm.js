import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileBoostApi } from '../api/services';

const ProfileBoostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    profile_boost: '',
    profile_boost_benefits: []
  });

  useEffect(() => {
    if (isEdit) {
      profileBoostApi.edit(id).then(res => {
        const pb = res.data.profileBoost;
        setForm({
          profile_boost: pb.profile_boost || '',
          profile_boost_benefits: Array.isArray(pb.profile_boost_benefits) ? pb.profile_boost_benefits : []
        });
      }).catch(console.error);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await profileBoostApi.update(id, form);
      } else {
        await profileBoostApi.store(form);
      }
      navigate('/admin/profile-boost-list');
    } catch (err) { console.error(err); }
  };

  const addBenefit = () => {
    setForm(prev => ({ ...prev, profile_boost_benefits: [...prev.profile_boost_benefits, ''] }));
  };

  const removeBenefit = (index) => {
    setForm(prev => ({ ...prev, profile_boost_benefits: prev.profile_boost_benefits.filter((_, i) => i !== index) }));
  };

  const updateBenefit = (index, value) => {
    setForm(prev => {
      const benefits = [...prev.profile_boost_benefits];
      benefits[index] = value;
      return { ...prev, profile_boost_benefits: benefits };
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Profile Boost Settings</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Monthly Boost Limit (per astrologer)</label>
              <input type="number" value={form.profile_boost} onChange={e => setForm({ ...form, profile_boost: e.target.value })}
                placeholder="e.g. 10" style={styles.input} required />
              <span style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>How many times an astrologer can boost per month</span>
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Boost Price</label>
              <p style={{ margin: '8px 0', color: '#7c3aed', fontWeight: 600 }}>Managed in General Settings → "Profile Boost Price"</p>
            </div>
          </div>

          <div style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 16, marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px' }}>Profile Boost Benefits (shown to astrologers)</h3>
            <button type="button" onClick={addBenefit} style={{ ...styles.addBtn, marginBottom: 12 }}>+ Add Benefit</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {form.profile_boost_benefits.map((benefit, i) => (
                <div key={i} style={{ position: 'relative', border: '1px solid #d1d5db', padding: 16, borderRadius: 8 }}>
                  <textarea value={benefit} onChange={e => updateBenefit(i, e.target.value)}
                    placeholder="Enter benefit description" style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} />
                  <button type="button" onClick={() => removeBenefit(i)}
                    style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 14, lineHeight: '20px', textAlign: 'center' }}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" style={styles.addBtn}>Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: 20 },
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  header: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 },
  col: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default ProfileBoostForm;
