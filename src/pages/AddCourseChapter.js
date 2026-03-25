import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../api/services';

const AddCourseChapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course_id: '', chapter_name: '', chapter_description: '', youtube_link: '', chapter_images: [], existing_images: [] });
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    if (isEdit) {
      courseApi.editChapter(id).then(res => {
        const ch = res.data.chapter;
        setCourses(res.data.courses || []);
        const existingImgs = Array.isArray(ch.chapter_images) ? ch.chapter_images : [];
        setForm({
          course_id: ch.course_id || '',
          chapter_name: ch.chapter_name || '',
          chapter_description: ch.chapter_description || '',
          youtube_link: ch.youtube_link || '',
          chapter_images: [],
          existing_images: existingImgs
        });
        setImagePreview(existingImgs.map(img => img.startsWith('http') ? img : '/' + img));
      }).catch(console.error);
    } else {
      courseApi.getChapterAddData().then(res => setCourses(res.data.courses || [])).catch(console.error);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const res = await courseApi.updateChapter(id, form);
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      } else {
        const res = await courseApi.addChapter(form);
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      }
      navigate('/admin/course-chapters');
    } catch (err) { console.error(err); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(f => ({ ...f, chapter_images: [...f.chapter_images, reader.result] }));
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
      setForm(f => ({ ...f, chapter_images: f.chapter_images.filter((_, i) => i !== (idx - existingCount)) }));
    }
    setImagePreview(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{isEdit ? 'Edit' : 'Add'} Course Chapter</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Course <span style={{ color: 'red' }}>*</span></label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} required style={styles.input}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Chapter Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" value={form.chapter_name} onChange={e => setForm({ ...form, chapter_name: e.target.value })} required style={styles.input} placeholder="Enter chapter name" />
            </div>
          </div>

          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Description</label>
            <textarea value={form.chapter_description} onChange={e => setForm({ ...form, chapter_description: e.target.value })}
              style={{ ...styles.input, minHeight: 100 }} placeholder="Enter chapter description" />
          </div>

          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>YouTube Link</label>
            <input type="text" value={form.youtube_link} onChange={e => setForm({ ...form, youtube_link: e.target.value })}
              style={styles.input} placeholder="https://youtube.com/..." />
          </div>

          <div style={{ marginTop: 15 }}>
            <label style={styles.label}>Upload Images</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            {imagePreview.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {imagePreview.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" style={styles.submitBtn}>{isEdit ? 'Update Chapter' : 'Add Chapter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHeader: { padding: '18px 24px', borderBottom: '1px solid #e5e7eb' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  label: { display: 'block', fontWeight: 500, marginBottom: 5, fontSize: 14, color: '#374151' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  submitBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15 }
};

export default AddCourseChapter;
