import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { astroMallApi } from '../api/services';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    productCategoryId: '',
    amount: '',
    usd_amount: '',
    features: '',
    productImage: null
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [removedFaqIds, setRemovedFaqIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isEdit) {
          const res = await astroMallApi.getProductById(id);
          const { product, result } = res.data;
          setCategories(result || []);
          if (product) {
            setForm({
              name: product.name || '',
              productCategoryId: product.productCategoryId || product.productCategory?.id || '',
              amount: product.amount || '',
              usd_amount: product.usd_amount || '',
              features: product.features || '',
              productImage: null
            });
            const img = product.productImage || product.image;
            if (img) {
              setExistingImage(img.startsWith('http') ? img : '/' + img);
            }
            setFaqs(product.questionAnswer || product.faqs || []);
          }
        } else {
          const res = await astroMallApi.getCategoriesDropdown();
          setCategories(res.data.result || res.data.data || []);
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, productImage: file });
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFaq = (index) => {
    const faq = faqs[index];
    if (faq && faq.id) {
      setRemovedFaqIds([...removedFaqIds, faq.id]);
    }
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('productCategoryId', form.productCategoryId);
      formData.append('amount', form.amount);
      formData.append('usd_amount', form.usd_amount);
      formData.append('features', form.features);
      if (form.productImage) {
        formData.append('productImage', form.productImage);
      }

      if (isEdit) {
        formData.append('filed_id', id);
        // Append remaining FAQ ids and removed FAQ ids
        const remainingFaqs = faqs.filter(f => f.id && !removedFaqIds.includes(f.id));
        formData.append('faqs', JSON.stringify(remainingFaqs.map(f => f.id)));
        formData.append('removedFaqs', JSON.stringify(removedFaqIds));
        await astroMallApi.editProduct(formData);
      } else {
        await astroMallApi.addProduct(formData);
      }
      navigate('/admin/astromall/products');
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#1f2937' }}>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {/* Row 1: Name + Category */}
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Product Category <span style={{ color: 'red' }}>*</span></label>
              <select
                name="productCategoryId"
                value={form.productCategoryId}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Amount INR + Amount USD */}
          <div style={{ ...styles.grid2, marginTop: 15 }}>
            <div>
              <label style={styles.label}>Amount (INR) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter INR amount"
                required
              />
            </div>
            <div>
              <label style={styles.label}>Amount (USD)</label>
              <input
                type="number"
                name="usd_amount"
                value={form.usd_amount}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter USD amount"
              />
            </div>
          </div>

          {/* Row 3: Features */}
          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Features</label>
            <textarea
              name="features"
              value={form.features}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
              placeholder="Enter features"
            />
          </div>

          {/* Row 4: Product Image */}
          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.input}
            />
            {(imagePreview || existingImage) && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={imagePreview || existingImage}
                  alt="Preview"
                  style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* FAQs section (only for edit) */}
          {isEdit && faqs.length > 0 && (
            <div style={{ marginTop: 20, border: '1px solid #d1d5db', borderRadius: 8, padding: 15 }}>
              <h3 style={{ margin: '0 0 15px', fontSize: 16, color: '#374151' }}>FAQs</h3>
              {faqs.map((faq, idx) => (
                <div key={faq.id || idx} style={styles.faqCard}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.formGroup}>
                      <label style={styles.faqLabel}>Question</label>
                      <input
                        type="text"
                        value={faq.question || ''}
                        readOnly
                        style={{ ...styles.input, background: '#f9fafb' }}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.faqLabel}>Answer</label>
                      <input
                        type="text"
                        value={faq.answer || ''}
                        readOnly
                        style={{ ...styles.input, background: '#f9fafb' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: 20 }}>
            <button type="submit" style={styles.submitBtn}>
              {isEdit ? 'Save' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cardHeader: { padding: '15px 20px', borderBottom: '1px solid #e5e7eb', background: '#f8f9fa' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  label: { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  formGroup: { marginBottom: 10 },
  faqCard: { display: 'flex', gap: 15, alignItems: 'flex-start', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 10 },
  faqLabel: { display: 'block', fontWeight: 500, marginBottom: 4, fontSize: 13, color: '#6b7280' },
  removeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', marginTop: 20 },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15 }
};

export default ProductForm;
