import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiAstrologerApi } from '../api/services';

const MasterAiBotForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    profile_image: '',
    chat_charge_inr: '',
    chat_charge_usd: '',
    system_instruction: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEdit) {
      const loadData = async () => {
        try {
          const res = await aiAstrologerApi.getMasterBotEdit(id);
          const item = res.data.masterBot || res.data.data || {};
          setForm({
            name: item.name || '',
            profile_image: '',
            chat_charge_inr: item.chat_charge_inr || '',
            chat_charge_usd: item.chat_charge_usd || '',
            system_instruction: item.system_instruction || ''
          });
          if (item.profile_image) {
            setImagePreview(item.profile_image.startsWith('http') ? item.profile_image : '/' + item.profile_image);
          }
        } catch (err) {
          console.error('Error loading master bot data:', err);
        }
      };
      loadData();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(f => ({ ...f, profile_image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await aiAstrologerApi.updateMasterBot(id, form);
      } else {
        await aiAstrologerApi.storeMasterBot(form);
      }
      navigate('/admin/master-ai-bot');
    } catch (err) {
      console.error('Error saving master bot:', err);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{isEdit ? 'Edit' : 'Create'} Master Bot</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter bot name"
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginBottom: 10 }}
            />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #d1d5db' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Chat Charge INR</label>
              <input
                type="number"
                name="chat_charge_inr"
                value={form.chat_charge_inr}
                onChange={handleChange}
                placeholder="Enter charge in INR"
                style={styles.input}
                min="0"
              />
            </div>
            <div>
              <label style={styles.label}>Chat Charge USD</label>
              <input
                type="number"
                name="chat_charge_usd"
                value={form.chat_charge_usd}
                onChange={handleChange}
                placeholder="Enter charge in USD"
                style={styles.input}
                min="0"
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={styles.label}>System Instruction <span style={{ color: 'red' }}>*</span></label>
            <textarea
              name="system_instruction"
              value={form.system_instruction}
              onChange={handleChange}
              placeholder="Enter system instruction for the AI bot"
              style={{ ...styles.input, minHeight: 140, resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" style={styles.submitBtn}>
              {isEdit ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cardHeader: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb' },
  label: { display: 'block', fontWeight: 500, marginBottom: 5, fontSize: 14, color: '#374151' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }
};

export default MasterAiBotForm;
