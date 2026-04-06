import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { aiAstrologerApi } from '../api/services';
import '../styles/AstrologerForm.css';

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
    <div className="af-page">
      <div className="af-header">
        <Bot size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit' : 'Create'} Master Bot</h2>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            <div className="af-full af-field">
              <label className="af-label">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter bot name"
                className="af-input"
              />
            </div>

            <div className="af-full af-field">
              <label className="af-label">Profile Image</label>
              <div className="af-img-upload">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="af-img-preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="af-input"
                />
              </div>
            </div>

            <div className="af-field">
              <label className="af-label">Chat Charge INR</label>
              <input
                type="number"
                name="chat_charge_inr"
                value={form.chat_charge_inr}
                onChange={handleChange}
                placeholder="Enter charge in INR"
                className="af-input"
                min="0"
              />
            </div>

            <div className="af-field">
              <label className="af-label">Chat Charge USD</label>
              <input
                type="number"
                name="chat_charge_usd"
                value={form.chat_charge_usd}
                onChange={handleChange}
                placeholder="Enter charge in USD"
                className="af-input"
                min="0"
              />
            </div>

            <div className="af-full af-field">
              <label className="af-label">System Instruction <span className="af-req">*</span></label>
              <textarea
                name="system_instruction"
                value={form.system_instruction}
                onChange={handleChange}
                placeholder="Enter system instruction for the AI bot"
                className="af-textarea"
                style={{ minHeight: 140 }}
                required
              />
            </div>
          </div>

          <div className="af-footer">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/admin/master-ai-bot')}>
              Cancel
            </button>
            <button type="submit" className="af-btn-submit">
              {isEdit ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterAiBotForm;
