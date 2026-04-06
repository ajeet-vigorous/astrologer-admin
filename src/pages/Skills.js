import React, { useState, useEffect } from 'react';
import { skillApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await skillApi.getAll({ page });
      setSkills(res.data.skills || []);
      setPagination({
        totalPages: res.data.totalPages, totalRecords: res.data.totalRecords,
        start: res.data.start, end: res.data.end, page: res.data.page
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) { await skillApi.edit({ filed_id: editData.id, name: form.name }); }
      else { await skillApi.add({ name: form.name }); }
      setShowModal(false); setEditData(null); setForm({ name: '' }); fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleEdit = (skill) => { setEditData(skill); setForm({ name: skill.name }); setShowModal(true); };
  const handleStatusToggle = async (id) => { try { await skillApi.status({ status_id: id }); fetchData(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This skill will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try { await skillApi.delete({ del_id: id }); Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false }); fetchData(); }
      catch (e) { Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#7c3aed' }); }
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 15); i++) pages.push(i);
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {pages.map(p => <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>)}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <Wrench size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Skills</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={() => { setEditData(null); setForm({ name: '' }); setShowModal(true); }} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Skill
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading skills..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead><tr><th>#</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {skills.length === 0 ? (
                  <tr><td colSpan={4} className="cust-no-data">No skills found.</td></tr>
                ) : skills.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 1) + i}</td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td>
                      <span onClick={() => handleStatusToggle(row.id)} className={`cust-verify-badge ${row.isActive ? 'verified' : 'unverified'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => handleEdit(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(row.id)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Skill' : 'Add Skill'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Skill Name *</label>
            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editData ? 'Update' : 'Add'} Skill</button>
        </form>
      </Modal>
    </div>
  );
};

export default Skills;
