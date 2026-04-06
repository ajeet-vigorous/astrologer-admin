import React, { useState, useEffect } from 'react';
import { referralApi } from '../api/services';
import { Link2 } from 'lucide-react';
import '../styles/AstrologerForm.css';

const ReferralSettings = () => {
  const [form, setForm] = useState({ id: '', amount: '', amount_usd: '', max_user_limit: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    referralApi.get().then(res => {
      const r = res.data.referral;
      if (r) {
        setForm({ id: r.id || '', amount: r.amount || '', amount_usd: r.amount_usd || '', max_user_limit: r.max_user_limit || '' });
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await referralApi.update(form);
      if (res.data.error) {
        setMessage('Validation error');
      } else {
        setMessage(res.data.success || 'Updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="af-page">
      <div className="af-header">
        <Link2 size={25} color="#7c3aed" />
        <h2 className="af-title">Referral Settings</h2>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit}>
          {message && (
            <div className="af-field af-full" >
              <div className="cust-verify-badge verified">{message}</div>
            </div>
          )}
          <div className="af-grid">
            <div className="af-field">
              <label className="af-label">Amount (INR) <span className="af-req">*</span></label>
              <input
                type="number"
                className="af-input"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount in Inr"
                required
              />
            </div>
            <div className="af-field">
              <label className="af-label">Amount (USD) <span className="af-req">*</span></label>
              <input
                type="text"
                className="af-input"
                value={form.amount_usd}
                onChange={e => setForm({ ...form, amount_usd: e.target.value })}
                placeholder="Amount in Usd"
                required
              />
            </div>
            <div className="af-field">
              <label className="af-label">Max User Limit <span className="af-req">*</span></label>
              <input
                type="number"
                className="af-input"
                value={form.max_user_limit}
                onChange={e => setForm({ ...form, max_user_limit: e.target.value })}
                placeholder="Max User Limit"
                required
              />
            </div>
          </div>
          <div className="af-footer">
            <button type="submit" className="af-btn-submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferralSettings;
