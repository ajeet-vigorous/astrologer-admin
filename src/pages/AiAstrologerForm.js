import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { aiAstrologerApi } from '../api/services';
import '../styles/AstrologerForm.css';

const AiAstrologerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    name: '',
    about: '',
    profile_image: '',
    category: [],
    primary_skill: [],
    all_skills: [],
    chat_charge: '',
    experience: '',
    system_intruction: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isEdit) {
          const res = await aiAstrologerApi.getEdit(id);
          const d = res.data?.data || res.data;
          const item = d?.aiAstrologer || d || {};
          setCategories(d?.categories || res.data?.categories || []);
          setSkills(d?.skills || res.data?.skills || []);
          const catIds = item.astrologerCategoryId ? item.astrologerCategoryId.split(',').map(Number).filter(Boolean) : [];
          const priIds = item.primary_skill ? item.primary_skill.split(',').map(Number).filter(Boolean) : [];
          const allIds = item.all_skills ? item.all_skills.split(',').map(Number).filter(Boolean) : [];
          setForm({
            name: item.name || '',
            about: item.about || '',
            profile_image: '',
            category: catIds,
            primary_skill: priIds,
            all_skills: allIds,
            chat_charge: item.chat_charge || '',
            experience: item.experience || '',
            system_intruction: item.system_intruction || ''
          });
          if (item.image) {
            setImagePreview(item.image.startsWith('http') ? item.image : '/' + item.image);
          }
        } else {
          const res = await aiAstrologerApi.getFormData();
          setCategories(res.data.categories || []);
          setSkills(res.data.skills || []);
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setForm({ ...form, [name]: lettersOnly });
    } else {
      setForm({ ...form, [name]: value });
    }
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

  const handleCheckboxChange = (field, value) => {
    setForm(prev => {
      const current = [...prev[field]];
      const idx = current.indexOf(value);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      return { ...prev, [field]: current };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await aiAstrologerApi.update(id, form);
      } else {
        await aiAstrologerApi.store(form);
      }
      navigate('/admin/ai-astrologer');
    } catch (err) {
      console.error('Error saving AI astrologer:', err);
    }
  };

  return (
    <div className="af-page">
      <div className="af-header">
        <Bot size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit' : 'Create'} AI Counsellor</h2>
      </div>

      <div className="af-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`af-tab ${activeTab === 'personal' ? 'active' : ''}`}
        >
          Personal Detail
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('skill')}
          className={`af-tab ${activeTab === 'skill' ? 'active' : ''}`}
        >
          Skill Detail
        </button>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit}>
          {activeTab === 'personal' && (
            <div className="af-grid">
              <div className="af-full af-field">
                <label className="af-label">Name <span className="af-req">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name (letters only)"
                  className="af-input"
                  required
                />
              </div>

              <div className="af-full af-field">
                <label className="af-label">About</label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleChange}
                  placeholder="Enter about description"
                  className="af-textarea"
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
            </div>
          )}

          {activeTab === 'skill' && (
            <div className="af-grid">
              <div className="af-full af-field">
                <label className="af-label">AI Astrologer Category</label>
                <div className="af-multi-box">
                  {categories.map(cat => (
                    <label key={cat._id || cat.id} className="af-check-label">
                      <input
                        type="checkbox"
                        checked={form.category.includes(cat._id || cat.id)}
                        onChange={() => handleCheckboxChange('category', cat._id || cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                  {categories.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No categories available</span>}
                </div>
              </div>

              <div className="af-full af-field">
                <label className="af-label">Primary Skills</label>
                <div className="af-multi-box">
                  {skills.map(skill => (
                    <label key={skill._id || skill.id} className="af-check-label">
                      <input
                        type="checkbox"
                        checked={form.primary_skill.includes(skill._id || skill.id)}
                        onChange={() => handleCheckboxChange('primary_skill', skill._id || skill.id)}
                      />
                      {skill.name}
                    </label>
                  ))}
                  {skills.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No skills available</span>}
                </div>
              </div>

              <div className="af-full af-field">
                <label className="af-label">All Skills</label>
                <div className="af-multi-box">
                  {skills.map(skill => (
                    <label key={skill._id || skill.id} className="af-check-label">
                      <input
                        type="checkbox"
                        checked={form.all_skills.includes(skill._id || skill.id)}
                        onChange={() => handleCheckboxChange('all_skills', skill._id || skill.id)}
                      />
                      {skill.name}
                    </label>
                  ))}
                  {skills.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No skills available</span>}
                </div>
              </div>

              <div className="af-field">
                <label className="af-label">Chat Charge (&#8377;/message)</label>
                <input
                  type="number"
                  name="chat_charge"
                  value={form.chat_charge}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="af-input"
                  min="0"
                />
              </div>

              <div className="af-field">
                <label className="af-label">Experience In Years</label>
                <input
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="af-input"
                  min="0"
                />
              </div>

              <div className="af-full af-field">
                <label className="af-label">System Instruction (AI Prompt)</label>
                <textarea
                  name="system_intruction"
                  value={form.system_intruction}
                  onChange={handleChange}
                  placeholder="e.g. You are a Tarot Reader. Provide guidance based on tarot card readings..."
                  className="af-textarea"
                  style={{ minHeight: 120 }}
                />
              </div>
            </div>
          )}

          <div className="af-footer">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/admin/ai-astrologer')}>
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

export default AiAstrologerForm;
