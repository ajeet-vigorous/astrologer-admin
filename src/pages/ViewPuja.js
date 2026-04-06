import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HandHeart, Loader2, ArrowLeft } from 'lucide-react';
import { pujaApi } from '../api/services';
import '../styles/CustomerDetail.css';

import getImgSrc from '../utils/getImageUrl';

const ViewPuja = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [puja, setPuja] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await pujaApi.view(id);
        setPuja(res.data.puja);
        setCategories(res.data.pujaCategory || []);
        setSubCategories(res.data.pujaSubCategory || []);
        setPackages(res.data.packages || []);
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [id]);

  if (!puja) return (
    <div className="cd-page">
      <div className="cd-empty">
        <Loader2 size={28} className="spin" color="#7c3aed" />
        <p>Loading...</p>
      </div>
    </div>
  );

  const categoryName = categories.find(c => c.id === puja.category_id)?.name || '--';
  const subCategoryName = subCategories.find(sc => sc.id === puja.sub_category_id)?.name || '--';
  const selectedPackages = packages.filter(p => (puja.package_id || []).includes(p.id));


  return (
    <div className="cd-page">
      {/* Hero Section */}
      <div className="cd-hero-wrap">
        <div className="cd-hero">
          <div className="cd-hero-left">
            {puja.puja_images && puja.puja_images.length > 0 ? (
              <div className="cd-hero-avatar-wrap">
                <img className="cd-hero-avatar" src={getImgSrc(puja.puja_images[0])} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            ) : (
              <div className="cd-hero-avatar-wrap">
                <div className="cd-hero-avatar cd-hero-initial">
                  <HandHeart size={32} />
                </div>
              </div>
            )}
            <div className="cd-hero-info">
              <h2 className="cd-hero-name">{puja.puja_title || '--'}</h2>
              <p className="cd-hero-phone">{puja.puja_subtitle || ''}</p>
              <p className="cd-hero-email">{puja.puja_place || ''}</p>
            </div>
          </div>
        </div>
        <div className="cd-hero-stats">
          <div className="cd-stat-chip" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <span className="cd-stat-val">{puja.puja_duration || '--'}</span>
            <span className="cd-stat-lbl">Duration (mins)</span>
          </div>
          <div className="cd-stat-chip" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <span className="cd-stat-val">{selectedPackages.length}</span>
            <span className="cd-stat-lbl">Packages</span>
          </div>
          <div className="cd-stat-chip" style={{ background: '#fffbeb', color: '#b45309' }}>
            <span className="cd-stat-val">{puja.puja_benefits?.length || 0}</span>
            <span className="cd-stat-lbl">Benefits</span>
          </div>
        </div>
      </div>

      {/* Detail Info */}
      <div className="cd-content">
        <div className="ad-section">
          <h3 className="ad-section-title"><HandHeart size={14} /> Puja Details</h3>
          <div className="cd-irow">
            <span className="cd-irow-label">Title</span>
            <span className="cd-irow-value">{puja.puja_title || '--'}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Subtitle</span>
            <span className="cd-irow-value">{puja.puja_subtitle || '--'}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Start Date Time</span>
            <span className="cd-irow-value">{puja.puja_start_datetime ? new Date(puja.puja_start_datetime).toLocaleString() : '--'}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Duration</span>
            <span className="cd-irow-value">{puja.puja_duration ? puja.puja_duration + ' mins' : '--'}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Category</span>
            <span className="cd-irow-value">{categoryName}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Subcategory</span>
            <span className="cd-irow-value">{subCategoryName}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Place</span>
            <span className="cd-irow-value">{puja.puja_place || '--'}</span>
          </div>
          <div className="cd-irow">
            <span className="cd-irow-label">Packages</span>
            <span className="cd-irow-value">{selectedPackages.map(p => `${p.title} - ${p.package_price}`).join(', ') || '--'}</span>
          </div>
        </div>

        {/* About Puja */}
        <div className="ad-section">
          <h3 className="ad-section-title">About Puja</h3>
          <p className="ad-bio">{puja.long_description || '--'}</p>
        </div>

        {/* Benefits */}
        {puja.puja_benefits && puja.puja_benefits.length > 0 && (
          <div className="ad-section">
            <h3 className="ad-section-title">Puja Benefits</h3>
            <div className="ad-review-list">
              {puja.puja_benefits.map((b, idx) => (
                <div key={idx} className="ad-review-card">
                  <div className="ad-review-avatar">{idx + 1}</div>
                  <div className="ad-review-body">
                    <div className="ad-review-top">
                      <span className="ad-review-name">{b.title}</span>
                    </div>
                    <p className="ad-review-text">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {puja.puja_images && puja.puja_images.length > 0 && (
          <div className="ad-section">
            <h3 className="ad-section-title">Images</h3>
            <div className="cd-grid">
              {puja.puja_images.map((img, idx) => (
                <img key={idx} className="cd-item-img" src={getImgSrc(img)} alt=""
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="af-footer">
          <button className="af-btn-cancel" onClick={() => navigate('/admin/puja-list')}>
            <ArrowLeft size={14} /> Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPuja;
