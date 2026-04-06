import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../api/services';
import { GraduationCap } from 'lucide-react';
import Loader from '../components/Loader';
import '../styles/AstrologerForm.css';

const AddCourseChapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course_id: '', chapter_name: '', chapter_description: '', youtube_link: '', chapter_images: [], existing_images: [] });
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      courseApi.getChapterAddData().then(res => setCourses(res.data.courses || [])).catch(console.error).finally(() => setLoading(false));
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

  if (loading) return <Loader />;

  return (
    <div className="af-page">
      <div className="af-header">
        <GraduationCap size={22} color="#7c3aed" />
        <h2 className="af-title">{isEdit ? 'Edit' : 'Add'} Course Chapter</h2>
      </div>
      <div className="af-card">
        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            <div className="af-field">
              <label className="af-label">Course <span className="af-req">*</span></label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} required className="af-select">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="af-field">
              <label className="af-label">Chapter Name <span className="af-req">*</span></label>
              <input type="text" value={form.chapter_name} onChange={e => setForm({ ...form, chapter_name: e.target.value })} required className="af-input" placeholder="Enter chapter name" />
            </div>
          </div>

          <div className="af-grid" style={{ marginTop: 16 }}>
            <div className="af-field af-full">
              <label className="af-label">Description</label>
              <textarea value={form.chapter_description} onChange={e => setForm({ ...form, chapter_description: e.target.value })}
                className="af-textarea" placeholder="Enter chapter description" />
            </div>
          </div>

          <div className="af-grid" style={{ marginTop: 16 }}>
            <div className="af-field af-full">
              <label className="af-label">YouTube Link</label>
              <input type="text" value={form.youtube_link} onChange={e => setForm({ ...form, youtube_link: e.target.value })}
                className="af-input" placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div className="af-grid" style={{ marginTop: 16 }}>
            <div className="af-field af-full">
              <label className="af-label">Upload Images</label>
              <div className="af-img-upload">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="af-input" />
              </div>
              {imagePreview.length > 0 && (
                <div className="af-img-upload" style={{ flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                  {imagePreview.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={img} alt="" className="af-img-preview"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                      <button type="button" onClick={() => removeImage(idx)} className="af-slot-remove"
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', marginTop: 0 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="af-footer">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/admin/course-chapters')}>Cancel</button>
            <button type="submit" className="af-btn-submit">{isEdit ? 'Update Chapter' : 'Add Chapter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseChapter;
