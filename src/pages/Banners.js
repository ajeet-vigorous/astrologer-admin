import React, { useState, useEffect } from 'react';
import { bannerApi } from '../api/services';
import Loader from '../components/Loader';
import { ImageIcon, Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import getImgSrc from '../utils/getImageUrl';
import '../styles/Customers.css';

const Banners = () => {
  const [data, setData] = useState([]);
  const [bannerTypes, setBannerTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);

  const emptyForm = { fromDate: '', toDate: '', bannerTypeId: '', bannerImage: '' };
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ filed_id: '', ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await bannerApi.getAll({ page });
      const d = res.data || {};
      setData(d.banners || []);
      setBannerTypes(d.bannerType || []);
      setTotalPages(d.totalPages || 1);
      setTotalRecords(d.totalRecords || 0);
      setStart(d.start || 0);
      setEnd(d.end || 0);
    } catch (err) { console.error(err); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleImageChange = (e, isEdit) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) setEditForm(f => ({ ...f, bannerImage: reader.result }));
        else setForm(f => ({ ...f, bannerImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await bannerApi.add(form);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowAddModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (editForm.bannerImage && !editForm.bannerImage.startsWith('data:')) {
        delete payload.bannerImage;
      }
      const res = await bannerApi.edit(payload);
      if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      setShowEditModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatusToggle = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Change status of this banner?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Change',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await bannerApi.status({ status_id: item.id });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const openEdit = (row) => {
    setEditForm({
      filed_id: row.id,
      fromDate: row.fromDate ? row.fromDate.split('T')[0] : '',
      toDate: row.toDate ? row.toDate.split('T')[0] : '',
      bannerTypeId: row.bannerTypeId || '',
      bannerImage: row.bannerImage || ''
    });
    setShowEditModal(true);
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This banner will be deleted!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7c3aed', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, Delete' });
    if (result.isConfirmed) {
      try { await bannerApi.delete({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const formatDate = (d) => {
    if (!d) return '--';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {totalRecords === 0 ? 0 : start} to {end} of {totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {startPage > 1 && (
            <>
              <button onClick={() => setPage(1)} className={`cust-page-btn ${page === 1 ? 'active' : ''}`}>1</button>
              {startPage > 2 && <span className="cust-page-dots">...</span>}
            </>
          )}
          {pages.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="cust-page-dots">...</span>}
              <button onClick={() => setPage(totalPages)} className={`cust-page-btn ${page === totalPages ? 'active' : ''}`}>{totalPages}</button>
            </>
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  const renderForm = (f, setF, onSubmit, btnText, isEdit) => (
    <form onSubmit={onSubmit}>
      <div className="cust-form-group">
        <label>Banner Type <span style={{ color: 'red' }}>*</span></label>
        <select value={f.bannerTypeId} onChange={e => setF({ ...f, bannerTypeId: e.target.value })} required>
          <option value="">Select Banner Type</option>
          {bannerTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
        </select>
      </div>
      <div className="cust-form-row">
        <div className="cust-form-group">
          <label>From Date <span style={{ color: 'red' }}>*</span></label>
          <input type="date" value={f.fromDate} onChange={e => setF({ ...f, fromDate: e.target.value })} required />
        </div>
        <div className="cust-form-group">
          <label>To Date <span style={{ color: 'red' }}>*</span></label>
          <input type="date" value={f.toDate} onChange={e => setF({ ...f, toDate: e.target.value })} required />
        </div>
      </div>
      <div className="cust-form-group">
        <label>Banner Image <span style={{ color: 'red' }}>*</span></label>
        {isEdit && f.bannerImage && !f.bannerImage.startsWith('data:') && (
          <img src={getImgSrc(f.bannerImage)} alt="" className="cust-img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {f.bannerImage && f.bannerImage.startsWith('data:') && (
          <img src={f.bannerImage} alt="" className="cust-img-preview" />
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, isEdit)} />
      </div>
      <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{btnText}</button>
    </form>
  );

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <ImageIcon size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Banners</h2>
            <div className="cust-count">{totalRecords} total</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Banner
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? (
          <Loader text="Loading banners..." />
        ) : data.length === 0 ? (
          <div className="cust-no-data">No Data Available</div>
        ) : (
          <div className="mall-card-grid">
            {data.map(item => {
              const isActive = item.isActive === 1 || item.isActive === true;
              return (
                <div key={item.id} className="video-card">
                  <div className="video-card-thumb" onClick={() => setViewerImg(getImgSrc(item.bannerImage))}>
                    {item.bannerImage ? (
                      <img
                        src={getImgSrc(item.bannerImage)}
                        alt={item.bannerType || 'Banner'}
                        onError={(e) => { e.target.src = '/build/assets/images/person.png'; }}
                      />
                    ) : (
                      <div className="cust-no-data">No Image</div>
                    )}
                  </div>
                  <div className="video-card-body">
                    <div className="video-card-title">{item.bannerType || 'Banner'}</div>
                    <div className="video-card-type">
                      {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                    </div>
                  </div>
                  <div className="video-card-footer">
                    <button onClick={() => openEdit(item)} className="cust-action-btn cust-action-edit" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="cust-action-btn cust-action-delete" title="Delete">
                      <Trash2 size={15} />
                    </button>
                    <div className="cust-toggle-wrap">
                      <div className={`cust-toggle ${isActive ? 'on' : ''}`} onClick={() => handleStatusToggle(item)}>
                        <div className="cust-toggle-knob" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="cust-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Add Banner</h3>
              <button onClick={() => setShowAddModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(form, setForm, handleAdd, 'Add Banner', false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {showEditModal && (
        <div className="cust-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>Edit Banner</h3>
              <button onClick={() => setShowEditModal(false)} className="cust-modal-close"><X size={20} /></button>
            </div>
            <div className="cust-modal-body">
              {renderForm(editForm, setEditForm, handleEdit, 'Save', true)}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewerImg && (
        <div className="cust-overlay" onClick={() => setViewerImg(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button onClick={() => setViewerImg(null)} className="cust-modal-close" style={{ position: 'absolute', top: -15, right: -15, background: '#fff', borderRadius: '50%', width: 32, height: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <X size={16} />
            </button>
            <img src={viewerImg} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
