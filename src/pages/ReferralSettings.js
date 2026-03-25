import React, { useState, useEffect } from 'react';
import { referralApi } from '../api/services';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Edit Referral</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {message && <div style={{ padding: '10px 16px', background: '#dcfce7', color: '#166534', borderRadius: 6, marginBottom: 16 }}>{message}</div>}
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Amount (INR) <span style={{ color: 'red' }}>*</span></label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount in Inr" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Amount (USD) <span style={{ color: 'red' }}>*</span></label>
              <input type="text" value={form.amount_usd} onChange={e => setForm({ ...form, amount_usd: e.target.value })}
                placeholder="Amount in Usd" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Max User Limit <span style={{ color: 'red' }}>*</span></label>
              <input type="number" value={form.max_user_limit} onChange={e => setForm({ ...form, max_user_limit: e.target.value })}
                placeholder="Max User Limit" required style={styles.input} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button type="submit" style={styles.submitBtn}>Update</button>
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
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  col: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 500, marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  submitBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default ReferralSettings;
