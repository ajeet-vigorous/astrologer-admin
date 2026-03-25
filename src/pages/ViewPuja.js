import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pujaApi } from '../api/services';

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

  if (!puja) return <div>Loading...</div>;

  const categoryName = categories.find(c => c.id === puja.category_id)?.name || '--';
  const subCategoryName = subCategories.find(sc => sc.id === puja.sub_category_id)?.name || '--';
  const selectedPackages = packages.filter(p => (puja.package_id || []).includes(p.id));

  const getImgSrc = (img) => {
    if (!img) return '/build/assets/images/default.jpg';
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ margin: 0 }}>View Puja</h2>
          <button onClick={() => navigate('/admin/puja-list')} style={styles.backBtn}>Back</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={styles.grid2}>
            <div><label style={styles.label}>Title</label><div style={styles.value}>{puja.puja_title || '--'}</div></div>
            <div><label style={styles.label}>Subtitle</label><div style={styles.value}>{puja.puja_subtitle || '--'}</div></div>
          </div>
          <div style={{ ...styles.grid2, marginTop: 15 }}>
            <div><label style={styles.label}>Start Date Time</label><div style={styles.value}>{puja.puja_start_datetime ? new Date(puja.puja_start_datetime).toLocaleString() : '--'}</div></div>
            <div><label style={styles.label}>Puja Duration</label><div style={styles.value}>{puja.puja_duration ? puja.puja_duration + ' mins' : '--'}</div></div>
          </div>
          <div style={{ ...styles.grid3, marginTop: 15 }}>
            <div><label style={styles.label}>Category</label><div style={styles.value}>{categoryName}</div></div>
            <div><label style={styles.label}>Subcategory</label><div style={styles.value}>{subCategoryName}</div></div>
            <div><label style={styles.label}>Place</label><div style={styles.value}>{puja.puja_place || '--'}</div></div>
          </div>
          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Packages</label>
            <div style={styles.value}>{selectedPackages.map(p => `${p.title} - ${p.package_price}`).join(', ') || '--'}</div>
          </div>
          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>About Puja</label>
            <div style={{ ...styles.value, whiteSpace: 'pre-wrap' }}>{puja.long_description || '--'}</div>
          </div>

          {puja.puja_benefits && puja.puja_benefits.length > 0 && (
            <div style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 15, marginTop: 15 }}>
              <h3>Puja Benefits</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                {puja.puja_benefits.map((b, idx) => (
                  <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                    <strong>{b.title}</strong>
                    <p style={{ color: '#6b7280', marginTop: 5 }}>{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {puja.puja_images && puja.puja_images.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <label style={styles.label}>Images</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {puja.puja_images.map((img, idx) => (
                  <img key={idx} src={getImgSrc(img)} alt="" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { background: '#6b7280', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' },
  label: { display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#374151' },
  value: { padding: '8px 12px', background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }
};

export default ViewPuja;
