import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';
import { form16aApi, astrologerApi } from '../api/services';
import '../styles/Customers.css';

const API_HOST = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const fileUrl = (p) => (!p ? '#' : p.startsWith('http') ? p : `${API_HOST}/${p.replace(/^\//, '')}`);

const QUARTERS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];

const Form16A = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [astroSearch, setAstroSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ astrologerId: '', financialYear: '', quarter: QUARTERS[0], file: null, fileName: '' });

  const fetchAstrologers = async (search = '') => {
    try {
      const res = await astrologerApi.getAll({ page: 1, searchString: search || undefined });
      setAstrologers(res.data?.astrologers || []);
    } catch (e) { console.error(e); }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await form16aApi.list({});
      setList(res.data?.recordList || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAstrologers(); fetchList(); }, []);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { Swal.fire({ icon: 'warning', title: 'PDF only', text: 'Please select a PDF file', confirmButtonColor: '#7c3aed' }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, file: reader.result, fileName: f.name }));
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!form.astrologerId || !form.financialYear.trim() || !form.quarter || !form.file) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Select astrologer, financial year, quarter and a PDF.', confirmButtonColor: '#7c3aed' });
      return;
    }
    setUploading(true);
    try {
      await form16aApi.upload({
        astrologerId: form.astrologerId,
        financialYear: form.financialYear.trim(),
        quarter: form.quarter,
        file: form.file,
        fileName: form.fileName,
      });
      Swal.fire({ icon: 'success', title: 'Uploaded', text: 'Form 16A uploaded.', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
      setForm({ astrologerId: '', financialYear: '', quarter: QUARTERS[0], file: null, fileName: '' });
      fetchList();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: e.response?.data?.message || 'Upload failed', confirmButtonColor: '#7c3aed' });
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: 'Delete this Form 16A?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
    if (!r.isConfirmed) return;
    try {
      await form16aApi.delete({ id });
      fetchList();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#7c3aed' }); }
  };

  return (
    <div className="cust-page">
      <div className="cust-header">
        <div className="cust-title"><FileText size={22} /> <h2>Form 16A (TDS Certificate)</h2></div>
      </div>

      {/* Upload card */}
      <div className="cust-card" style={{ padding: 18, marginBottom: 18 }}>
        <h4 style={{ margin: '0 0 4px' }}>Upload Certificate</h4>
        <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '0.85rem' }}>
          Upload the official Form 16A PDF (downloaded from the government TRACES portal) for an astrologer.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Astrologer</label>
            <input placeholder="Search astrologer..." value={astroSearch}
              onChange={e => { setAstroSearch(e.target.value); fetchAstrologers(e.target.value); }}
              style={{ width: '100%', padding: 8, marginBottom: 6, border: '1px solid #e5e7eb', borderRadius: 6 }} />
            <select value={form.astrologerId} onChange={e => setForm({ ...form, astrologerId: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <option value="">Select astrologer</option>
              {astrologers.map(a => <option key={a.id} value={a.id}>{a.name} ({a.contactNo})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Financial Year</label>
            <input placeholder="e.g. 2025-26" value={form.financialYear} onChange={e => setForm({ ...form, financialYear: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quarter</label>
            <select value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>PDF File</label>
            <input type="file" accept="application/pdf" onChange={onFile}
              style={{ width: '100%', padding: 6, border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
            {form.fileName && <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 4 }}>{form.fileName}</div>}
          </div>
        </div>
        <button onClick={handleUpload} disabled={uploading} className="cust-btn cust-btn-primary" style={{ marginTop: 14 }}>
          <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload Form 16A'}
        </button>
      </div>

      {/* List */}
      <div className="cust-card">
        {loading ? <Loader text="Loading..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr><th>#</th><th>Astrologer</th><th>Financial Year</th><th>Quarter</th><th>File</th><th>Uploaded</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={7} className="cust-no-data">No certificates uploaded yet.</td></tr>
                ) : list.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="cust-name-cell">{c.astrologerName}</div>
                      <div className="cust-date-cell">{c.contactNo}</div>
                    </td>
                    <td>{c.financialYear}</td>
                    <td>{c.quarter}</td>
                    <td>
                      <a href={fileUrl(c.filePath)} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={14} /> View
                      </a>
                    </td>
                    <td className="cust-date-cell">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      <button onClick={() => handleDelete(c.id)} className="cust-action-btn" title="Delete" style={{ color: '#dc2626' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form16A;
