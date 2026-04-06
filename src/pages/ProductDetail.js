import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astroMallApi } from '../api/services';
import Loader from '../components/Loader';
import '../styles/CustomerDetail.css';

import getImgSrc from '../utils/getImageUrl';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await astroMallApi.getCategoryById(id);
        const detail = res.data.astroMallDetail;
        if (detail && detail.length > 0) {
          setProduct(detail[0]);
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) return <Loader text="Loading..." />;
  if (!product) return <div className="cd-empty">Product not found</div>;

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('public/')) return '/' + img; return '/public/' + img;
  };

  const imgSrc = getImageSrc(product.productImage || product.image);
  const questionAnswer = product.questionAnswer || [];
  const productReview = product.productReview || [];

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= numRating ? '#f59e0b' : '#d1d5db', fontSize: 18 }}>
          &#9733;
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${mon}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  };

  return (
    <div className="cd-page">
      {/* Product Hero Card */}
      <div className="cd-hero" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 200, height: 200, borderRadius: 12, overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>No Image</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="cd-hero-name" style={{ fontSize: 22, marginBottom: 8 }}>{product.name}</h2>
          {product.features && (
            <p style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>{product.features}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa' }}>&#8377;</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{product.amount || '0'}</span>
          </div>
          {product.usd_amount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa' }}>$</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{product.usd_amount}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/admin/astromall/products')}
            className="ad-edit-btn"
            style={{ marginTop: 16 }}
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Product Info Card */}
      <div className="cd-info-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '0 18px' }}>
        <div className="cd-irow">
          <span className="cd-irow-label">Name</span>
          <span className="cd-irow-value">{product.name}</span>
        </div>
        <div className="cd-irow">
          <span className="cd-irow-label">Category</span>
          <span className="cd-irow-value">{product.productCategory?.name || product.categoryName || '-'}</span>
        </div>
        <div className="cd-irow">
          <span className="cd-irow-label">Amount (INR)</span>
          <span className="cd-irow-value">&#8377; {product.amount || '0'}</span>
        </div>
        {product.usd_amount && (
          <div className="cd-irow">
            <span className="cd-irow-label">Amount (USD)</span>
            <span className="cd-irow-value">$ {product.usd_amount}</span>
          </div>
        )}
        {product.features && (
          <div className="cd-irow">
            <span className="cd-irow-label">Features</span>
            <span className="cd-irow-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{product.features}</span>
          </div>
        )}
      </div>

      {/* Q&A Section */}
      {questionAnswer.length > 0 && (
        <div className="cd-content">
          <div className="ad-section-title">Questions & Answers</div>
          {questionAnswer.map((qa, idx) => (
            <div key={qa.id || idx} className="cd-item-card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6, lineHeight: 1.5 }}>
                <strong>Q:</strong> {qa.question}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                <strong>A:</strong> {qa.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Section */}
      {productReview.length > 0 && (
        <div className="cd-content">
          <div className="ad-section-title">Reviews</div>
          <div className="ad-review-list">
            {productReview.map((review, idx) => {
              const profileImg = review.userProfile || review.profileImage;
              return (
                <div key={review.id || idx} className="ad-review-card">
                  {profileImg ? (
                    <img
                      src={profileImg.startsWith('http') ? profileImg : '/' + profileImg}
                      alt=""
                      className="ad-review-avatar"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="ad-review-avatar">
                      {(review.userName || review.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="ad-review-body">
                    <div className="ad-review-top">
                      <span className="ad-review-name">{review.userName || review.name || 'User'}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(review.created_at || review.createdAt)}</span>
                    </div>
                    <div className="ad-review-stars">
                      {renderStars(review.rating)}
                      <span className="ad-review-rating">{review.rating}/5</span>
                    </div>
                    {review.review && (
                      <p className="ad-review-text">{review.review}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
