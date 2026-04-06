import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileBoostApi } from '../api/services';
import Loader from '../components/Loader';
import { Zap, Plus, Trash2 } from 'lucide-react';
import '../styles/AstrologerForm.css';

const ProfileBoostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState({ profile_boost: '', profile_boost_benefits: [] });

  useEffect(() => {
    if (isEdit) {
      profileBoostApi.edit(id).then(res => {
        const pb = res.data.profileBoost;
        setForm({ profile_boost: pb.profile_boost || '', profile_boost_benefits: Array.isArray(pb.profile_boost_benefits) ? pb.profile_boost_benefits : [] });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) { await profileBoostApi.update(id, form); }
      else { await profileBoostApi.store(form); }
      navigate('/admin/profile-boost-list');
    } catch (err) { console.error(err); }
  };

  const addBenefit = () => setForm(prev => ({ ...prev, profile_boost_benefits: [...prev.profile_boost_benefits, ''] }));
  const removeBenefit = (i) => setForm(prev => ({ ...prev, profile_boost_benefits: prev.profile_boost_benefits.filter((_, idx) => idx !== i) }));
  const updateBenefit = (i, val) => setForm(prev => { const b = [...prev.profile_boost_benefits]; b[i] = val; return { ...prev, profile_boost_benefits: b }; });

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="af-page">
      <div className="af-header">
        <Zap size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit' : 'Add'} Profile Boost</h2>
      </div>

      <div className="af-card" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            <div className="af-field">
              <label className="af-label">Monthly Boost Limit <span className="af-req">*</span></label>
              <input className="af-input" type="number" value={form.profile_boost} onChange={e => setForm({ ...form, profile_boost: e.target.value })} placeholder="e.g. 10" required />
              <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>How many times an astrologer can boost per month</span>
            </div>
            <div className="af-field">
              <label className="af-label">Boost Price</label>
              <p style={{ margin: '8px 0', color: '#7c3aed', fontWeight: 600, fontSize: 13 }}>Managed in General Settings</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 className="af-section-title" style={{ margin: 0, gridColumn: 'unset' }}>Boost Benefits</h4>
              <button type="button" onClick={addBenefit} className="af-slot-add"><Plus size={13} /> Add Benefit</button>
            </div>
            <div className="af-grid">
              {form.profile_boost_benefits.map((benefit, i) => (
                <div key={i} className="af-day-card" style={{ position: 'relative' }}>
                  <div style={{ padding: 14 }}>
                    <textarea className="af-textarea" value={benefit} onChange={e => updateBenefit(i, e.target.value)} placeholder="Enter benefit description" style={{ minHeight: 70 }} />
                  </div>
                  <button type="button" onClick={() => removeBenefit(i)} className="af-slot-remove" style={{ position: 'absolute', top: 8, right: 8, marginTop: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="af-footer">
            <button type="button" onClick={() => navigate('/admin/profile-boost-list')} className="af-btn-cancel">Cancel</button>
            <button type="submit" className="af-btn-submit">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileBoostForm;
