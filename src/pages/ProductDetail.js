import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { astroMallApi } from '../api/services';

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

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Product not found</div>;

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return '/' + img;
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Product Details</h2>
        <button onClick={() => navigate('/admin/astromall/products')} style={styles.backBtn}>Back</button>
      </div>

      {/* Product Card */}
      <div style={styles.card}>
        <div style={styles.productRow}>
          {/* Left: Image */}
          <div style={styles.productImageWrap}>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                style={styles.productImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={styles.imagePlaceholder}>No Image</div>
            )}
          </div>
          {/* Right: Info */}
          <div style={styles.productInfo}>
            <h2 style={{ margin: '0 0 10px', fontSize: 24, color: '#1f2937' }}>{product.name}</h2>
            {product.features && (
              <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>{product.features}</p>
            )}
            <div style={styles.priceRow}>
              <span style={styles.currencySymbol}>&#8377;</span>
              <span style={styles.priceText}>{product.amount || '0'}</span>
            </div>
            {product.usd_amount && (
              <div style={{ ...styles.priceRow, marginTop: 4 }}>
                <span style={styles.currencySymbol}>$</span>
                <span style={styles.priceText}>{product.usd_amount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Q&A Section */}
      {questionAnswer.length > 0 && (
        <div style={{ marginTop: 25 }}>
          <h3 style={{ margin: '0 0 15px', fontSize: 18, color: '#1f2937' }}>Questions & Answers</h3>
          {questionAnswer.map((qa, idx) => (
            <div key={qa.id || idx} style={styles.qaCard}>
              <div style={styles.qaQuestion}>
                <strong>Q:</strong> {qa.question}
              </div>
              <div style={styles.qaAnswer}>
                <strong>A:</strong> {qa.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Section */}
      {productReview.length > 0 && (
        <div style={{ marginTop: 25 }}>
          <h3 style={{ margin: '0 0 15px', fontSize: 18, color: '#1f2937' }}>Reviews</h3>
          {productReview.map((review, idx) => {
            const profileImg = review.userProfile || review.profileImage;
            return (
              <div key={review.id || idx} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewUserRow}>
                    {profileImg ? (
                      <img
                        src={profileImg.startsWith('http') ? profileImg : '/' + profileImg}
                        alt=""
                        style={styles.reviewAvatar}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={styles.reviewAvatarPlaceholder}>
                        {(review.userName || review.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 15 }}>{review.userName || review.name || 'User'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(review.created_at || review.createdAt)}</div>
                    </div>
                  </div>
                  <div>{renderStars(review.rating)}</div>
                </div>
                {review.review && (
                  <p style={{ margin: '10px 0 0', color: '#374151', fontSize: 14, lineHeight: 1.6 }}>{review.review}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: '#1f2937' },
  backBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 14 },
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  productRow: { display: 'flex', gap: 25, padding: 20, flexWrap: 'wrap' },
  productImageWrap: { width: 280, height: 280, borderRadius: 10, overflow: 'hidden', background: '#e5e7eb', flexShrink: 0 },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 16 },
  productInfo: { flex: 1, minWidth: 200 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 4 },
  currencySymbol: { fontSize: 20, fontWeight: 700, color: '#7c3aed' },
  priceText: { fontSize: 20, fontWeight: 700, color: '#1f2937' },
  qaCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 },
  qaQuestion: { fontSize: 15, color: '#1f2937', marginBottom: 8, lineHeight: 1.5 },
  qaAnswer: { fontSize: 14, color: '#6b7280', lineHeight: 1.5 },
  reviewCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  reviewUserRow: { display: 'flex', alignItems: 'center', gap: 12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' },
  reviewAvatarPlaceholder: { width: 40, height: 40, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }
};

export default ProductDetail;
