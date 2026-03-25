import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pujaApi } from '../api/services';

const AddPuja = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', subtitle: '', category_id: '', sub_category_id: '', place: '',
    description: '', package_id: [], puja_start_datetime: '', puja_duration: '',
    benefit_title: [], benefit_description: [], puja_images: [], existing_images: []
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isEdit) {
          const res = await pujaApi.edit(id);
          const { puja, pujaCategory, pujaSubCategory, packages: pkgs } = res.data;
          setCategories(pujaCategory || []);
          setSubCategories(pujaSubCategory || []);
          setPackages(pkgs || []);

          const benefits = puja.puja_benefits || [];
          const existingImgs = puja.puja_images || [];
          setForm({
            title: puja.puja_title || '', subtitle: puja.puja_subtitle || '',
            category_id: puja.category_id || '', sub_category_id: puja.sub_category_id || '',
            place: puja.puja_place || '', description: puja.long_description || '',
            package_id: puja.package_id || [],
            puja_start_datetime: puja.puja_start_datetime ? puja.puja_start_datetime.slice(0, 16) : '',
            puja_duration: puja.puja_duration || '',
            benefit_title: benefits.map(b => b.title),
            benefit_description: benefits.map(b => b.description),
            puja_images: [], existing_images: existingImgs
          });
          setImagePreview(existingImgs.map(img => img.startsWith('http') ? img : '/' + img));
        } else {
          const res = await pujaApi.getAddData();
          setCategories(res.data.pujaCategory || []);
          setSubCategories(res.data.pujaSubCategory || []);
          setPackages(res.data.packages || []);
        }
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePackageSelect = (e) => {
    const opts = Array.from(e.target.selectedOptions, o => parseInt(o.value));
    setForm({ ...form, package_id: opts });
  };

  const addBenefit = () => {
    setForm({ ...form, benefit_title: [...form.benefit_title, ''], benefit_description: [...form.benefit_description, ''] });
  };

  const removeBenefit = (idx) => {
    setForm({
      ...form,
      benefit_title: form.benefit_title.filter((_, i) => i !== idx),
      benefit_description: form.benefit_description.filter((_, i) => i !== idx)
    });
  };

  const updateBenefit = (idx, field, val) => {
    const arr = [...form[field]];
    arr[idx] = val;
    setForm({ ...form, [field]: arr });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(f => ({ ...f, puja_images: [...f.puja_images, reader.result] }));
        setImagePreview(p => [...p, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    const existingCount = form.existing_images.length;
    if (idx < existingCount) {
      setForm(f => ({ ...f, existing_images: f.existing_images.filter((_, i) => i !== idx) }));
    } else {
      setForm(f => ({ ...f, puja_images: f.puja_images.filter((_, i) => i !== (idx - existingCount)) }));
    }
    setImagePreview(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (isEdit) {
        const res = await pujaApi.update(id, payload);
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      } else {
        const res = await pujaApi.store(payload);
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      }
      navigate('/admin/puja-list');
    } catch (err) { console.error(err); }
  };

  const filteredSubCats = subCategories.filter(sc => sc.category_id === parseInt(form.category_id));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}><h2 style={{ margin: 0 }}>{isEdit ? 'Edit' : 'Add'} Puja</h2></div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Title <span style={{ color: 'red' }}>*</span></label>
              <input name="title" value={form.title} onChange={handleChange} style={styles.input} required placeholder="Enter title" />
            </div>
            <div>
              <label style={styles.label}>Subtitle</label>
              <input name="subtitle" value={form.subtitle} onChange={handleChange} style={styles.input} placeholder="Enter subtitle" />
            </div>
          </div>

          <div style={{ ...styles.grid2, marginTop: 15 }}>
            <div>
              <label style={styles.label}>Start Date Time</label>
              <input type="datetime-local" name="puja_start_datetime" value={form.puja_start_datetime} onChange={handleChange} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Puja Duration (minutes)</label>
              <input name="puja_duration" value={form.puja_duration} onChange={handleChange} style={styles.input} placeholder="120" />
            </div>
          </div>

          <div style={{ ...styles.grid3, marginTop: 15 }}>
            <div>
              <label style={styles.label}>Category <span style={{ color: 'red' }}>*</span></label>
              <select name="category_id" value={form.category_id} onChange={handleChange} style={styles.input} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Place <span style={{ color: 'red' }}>*</span></label>
              <input name="place" value={form.place} onChange={handleChange} style={styles.input} required placeholder="Enter place" />
            </div>
            <div>
              <label style={styles.label}>Select Package <span style={{ color: 'red' }}>*</span></label>
              <select multiple value={form.package_id.map(String)} onChange={handlePackageSelect} style={{ ...styles.input, height: 80 }} required>
                {packages.map(p => <option key={p.id} value={p.id}>{p.title} - {p.package_price}</option>)}
              </select>
            </div>
          </div>

          {filteredSubCats.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <label style={styles.label}>Subcategory</label>
              <select name="sub_category_id" value={form.sub_category_id} onChange={handleChange} style={styles.input}>
                <option value="">Select Subcategory</option>
                {filteredSubCats.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>About Puja</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={{ ...styles.input, minHeight: 100 }} placeholder="Enter description" />
          </div>

          <div style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 15, marginTop: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Puja Benefits</h3>
              <button type="button" onClick={addBenefit} style={{ ...styles.addBtn, padding: '5px 15px', fontSize: 13 }}>+ Add Benefit</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 10 }}>
              {form.benefit_title.map((_, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, position: 'relative' }}>
                  <h4 style={{ margin: '0 0 8px' }}>Benefit</h4>
                  <input value={form.benefit_title[idx]} onChange={(e) => updateBenefit(idx, 'benefit_title', e.target.value)}
                    style={{ ...styles.input, marginBottom: 8 }} placeholder="Enter benefit title" />
                  <textarea value={form.benefit_description[idx]} onChange={(e) => updateBenefit(idx, 'benefit_description', e.target.value)}
                    style={styles.input} placeholder="Enter benefit description" />
                  <button type="button" onClick={() => removeBenefit(idx)}
                    style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14 }}>x</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Upload Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImages} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
              {imagePreview.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: 120, height: 120 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <button type="button" onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: -5, right: -5, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}>x</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" style={styles.addBtn}>{isEdit ? 'Update' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cardHeader: { padding: '15px 20px', borderBottom: '1px solid #e5e7eb' },
  label: { display: 'block', fontWeight: 500, marginBottom: 5, fontSize: 14 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default AddPuja;
