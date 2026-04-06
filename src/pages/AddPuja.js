import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HandHeart, X, Plus, Loader2, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import { pujaApi } from '../api/services';
import '../styles/AstrologerForm.css';

const AddPuja = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        const res = await pujaApi.update(id, payload);
        if (res.data.error) { Swal.fire('Error', JSON.stringify(res.data.error), 'error'); setLoading(false); return; }
        Swal.fire('Success', 'Puja updated successfully!', 'success');
      } else {
        const res = await pujaApi.store(payload);
        if (res.data.error) { Swal.fire('Error', JSON.stringify(res.data.error), 'error'); setLoading(false); return; }
        Swal.fire('Success', 'Puja added successfully!', 'success');
      }
      navigate('/admin/puja-list');
    } catch (err) { console.error(err); Swal.fire('Error', 'Something went wrong', 'error'); }
    setLoading(false);
  };

  const filteredSubCats = subCategories.filter(sc => sc.category_id === parseInt(form.category_id));

  return (
    <div className="af-page">
      <div className="af-header">
        <HandHeart size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit' : 'Add'} Puja</h2>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            {/* Title */}
            <div className="af-field">
              <label className="af-label">Title <span className="af-req">*</span></label>
              <input className="af-input" name="title" value={form.title} onChange={handleChange} required placeholder="Enter title" />
            </div>

            {/* Subtitle */}
            <div className="af-field">
              <label className="af-label">Subtitle</label>
              <input className="af-input" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Enter subtitle" />
            </div>

            {/* Start Date Time */}
            <div className="af-field">
              <label className="af-label">Start Date Time</label>
              <input className="af-input" type="datetime-local" name="puja_start_datetime" value={form.puja_start_datetime} onChange={handleChange} />
            </div>

            {/* Puja Duration */}
            <div className="af-field">
              <label className="af-label">Puja Duration (minutes)</label>
              <input className="af-input" name="puja_duration" value={form.puja_duration} onChange={handleChange} placeholder="120" />
            </div>

            {/* Category */}
            <div className="af-field">
              <label className="af-label">Category <span className="af-req">*</span></label>
              <select className="af-select" name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Place */}
            <div className="af-field">
              <label className="af-label">Place <span className="af-req">*</span></label>
              <input className="af-input" name="place" value={form.place} onChange={handleChange} required placeholder="Enter place" />
            </div>

            {/* Package */}
            <div className="af-field af-full">
              <label className="af-label">Select Package <span className="af-req">*</span></label>
              <select className="af-select" multiple value={form.package_id.map(String)} onChange={handlePackageSelect} required>
                {packages.map(p => <option key={p.id} value={p.id}>{p.title} - {p.package_price}</option>)}
              </select>
            </div>

            {/* Subcategory (conditional) */}
            {filteredSubCats.length > 0 && (
              <div className="af-field af-full">
                <label className="af-label">Subcategory</label>
                <select className="af-select" name="sub_category_id" value={form.sub_category_id} onChange={handleChange}>
                  <option value="">Select Subcategory</option>
                  {filteredSubCats.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
            )}

            {/* About Puja */}
            <div className="af-field af-full">
              <label className="af-label">About Puja</label>
              <textarea className="af-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Enter description" />
            </div>

            {/* Benefits Section */}
            <div className="af-full">
              <div className="af-section-title">
                Puja Benefits
                <button type="button" className="af-slot-add" onClick={addBenefit}><Plus size={13} /> Add Benefit</button>
              </div>
              <div className="af-grid">
                {form.benefit_title.map((_, idx) => (
                  <div key={idx} className="af-field">
                    <div className="ad-review-card">
                      <div className="ad-review-body">
                        <div className="ad-review-top">
                          <span className="ad-review-name">Benefit {idx + 1}</span>
                          <button type="button" className="af-slot-remove" onClick={() => removeBenefit(idx)}>
                            <X size={14} />
                          </button>
                        </div>
                        <input className="af-input" value={form.benefit_title[idx]} onChange={(e) => updateBenefit(idx, 'benefit_title', e.target.value)} placeholder="Enter benefit title" />
                        <textarea className="af-textarea" value={form.benefit_description[idx]} onChange={(e) => updateBenefit(idx, 'benefit_description', e.target.value)} placeholder="Enter benefit description" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="af-field af-full">
              <label className="af-label"><Image size={14} /> Upload Images</label>
              <div className="af-img-upload">
                <input className="af-input" type="file" multiple accept="image/*" onChange={handleImages} />
              </div>
              {imagePreview.length > 0 && (
                <div className="af-grid">
                  {imagePreview.map((img, idx) => (
                    <div key={idx} className="af-field">
                      <div className="ad-review-card">
                        <img className="af-img-preview" src={img} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                        <button type="button" className="af-slot-remove" onClick={() => removeImage(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="af-footer">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/admin/puja-list')}>Cancel</button>
            <button type="submit" className="af-btn-submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              {isEdit ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPuja;
