import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiAstrologerApi } from '../api/services';

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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{isEdit ? 'Edit' : 'Create'} AI Counsellor</h2>
        </div>

        <div style={styles.tabBar}>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            style={{ ...styles.tab, ...(activeTab === 'personal' ? styles.activeTab : {}) }}
          >
            Personal Detail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skill')}
            style={{ ...styles.tab, ...(activeTab === 'skill' ? styles.activeTab : {}) }}
          >
            Skill Detail
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {activeTab === 'personal' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name (letters only)"
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>About</label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleChange}
                  placeholder="Enter about description"
                  style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
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
            </div>
          )}

          {activeTab === 'skill' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>AI Astrologer Category</label>
                <div style={styles.checkboxGrid}>
                  {categories.map(cat => (
                    <label key={cat._id || cat.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.category.includes(cat._id || cat.id)}
                        onChange={() => handleCheckboxChange('category', cat._id || cat.id)}
                        style={{ marginRight: 6 }}
                      />
                      {cat.name}
                    </label>
                  ))}
                  {categories.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No categories available</span>}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Primary Skills</label>
                <div style={styles.checkboxGrid}>
                  {skills.map(skill => (
                    <label key={skill._id || skill.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.primary_skill.includes(skill._id || skill.id)}
                        onChange={() => handleCheckboxChange('primary_skill', skill._id || skill.id)}
                        style={{ marginRight: 6 }}
                      />
                      {skill.name}
                    </label>
                  ))}
                  {skills.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No skills available</span>}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>All Skills</label>
                <div style={styles.checkboxGrid}>
                  {skills.map(skill => (
                    <label key={skill._id || skill.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.all_skills.includes(skill._id || skill.id)}
                        onChange={() => handleCheckboxChange('all_skills', skill._id || skill.id)}
                        style={{ marginRight: 6 }}
                      />
                      {skill.name}
                    </label>
                  ))}
                  {skills.length === 0 && <span style={{ color: '#9ca3af', fontSize: 13 }}>No skills available</span>}
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Chat Charge (&#8377;/message)</label>
                  <input
                    type="number"
                    name="chat_charge"
                    value={form.chat_charge}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    style={styles.input}
                    min="0"
                  />
                </div>
                <div>
                  <label style={styles.label}>Experience In Years</label>
                  <input
                    type="number"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    style={styles.input}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={styles.label}>System Instruction (AI Prompt)</label>
                <textarea
                  name="system_intruction"
                  value={form.system_intruction}
                  onChange={handleChange}
                  placeholder="e.g. You are a Tarot Reader. Provide guidance based on tarot card readings..."
                  style={{ ...styles.input, minHeight: 120, resize: 'vertical' }}
                />
              </div>
            </div>
          )}

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
  tabBar: { display: 'flex', borderBottom: '1px solid #e5e7eb' },
  tab: { padding: '12px 24px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#6b7280', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  activeTab: { color: '#7c3aed', borderBottom: '2px solid #7c3aed', fontWeight: 600 },
  label: { display: 'block', fontWeight: 500, marginBottom: 5, fontSize: 14, color: '#374151' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, padding: 12, border: '1px solid #e5e7eb', borderRadius: 6, maxHeight: 200, overflowY: 'auto' },
  checkboxLabel: { display: 'flex', alignItems: 'center', fontSize: 13, color: '#374151', cursor: 'pointer' },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }
};

export default AiAstrologerForm;
