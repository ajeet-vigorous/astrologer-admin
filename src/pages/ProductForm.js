import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { astroMallApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/AstrologerForm.css';

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

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="af-page">
      <div className="af-header">
        <ShoppingBag size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      </div>

      <div className="af-card" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            {/* Name */}
            <div className="af-field">
              <label className="af-label">Name <span className="af-req">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="af-input"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category */}
            <div className="af-field">
              <label className="af-label">Product Category <span className="af-req">*</span></label>
              <select
                name="productCategoryId"
                value={form.productCategoryId}
                onChange={handleChange}
                className="af-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Amount INR */}
            <div className="af-field">
              <label className="af-label">Amount (INR) <span className="af-req">*</span></label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="af-input"
                placeholder="Enter INR amount"
                required
              />
            </div>

            {/* Amount USD */}
            <div className="af-field">
              <label className="af-label">Amount (USD)</label>
              <input
                type="number"
                name="usd_amount"
                value={form.usd_amount}
                onChange={handleChange}
                className="af-input"
                placeholder="Enter USD amount"
              />
            </div>

            {/* Features */}
            <div className="af-field af-full">
              <label className="af-label">Features</label>
              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                className="af-textarea"
                placeholder="Enter features"
              />
            </div>

            {/* Product Image */}
            <div className="af-field af-full">
              <label className="af-label">Product Image</label>
              <div className="af-img-upload">
                {(imagePreview || existingImage) && (
                  <img
                    src={imagePreview || existingImage}
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

          {/* FAQs section (only for edit) */}
          {isEdit && faqs.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="af-section-title">FAQs</div>
              <div className="af-grid" style={{ marginTop: 12 }}>
                {faqs.map((faq, idx) => (
                  <div key={faq.id || idx} className="af-field" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <label className="af-label" style={{ margin: 0 }}>Question</label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="af-slot-remove"
                        style={{ marginTop: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question || ''}
                      readOnly
                      className="af-input"
                      style={{ background: '#fff', marginBottom: 10 }}
                    />
                    <label className="af-label">Answer</label>
                    <input
                      type="text"
                      value={faq.answer || ''}
                      readOnly
                      className="af-input"
                      style={{ background: '#fff' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="af-footer">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/admin/astromall/products')}>
              Cancel
            </button>
            <button type="submit" className="af-btn-submit">
              {isEdit ? 'Save' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
