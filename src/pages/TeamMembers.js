import React, { useState, useEffect, useCallback } from 'react';
import { teamRoleApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { UsersRound, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [teamRoles, setTeamRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Add/Edit Member Modal
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', contactNo: '', teamRoleId: '', password: '', profile: null
  });
  const [previewImg, setPreviewImg] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teamRoleApi.getMembers({ page });
      setMembers(res.data.teamMembers || []);
      setTeamRoles(res.data.teamMem || []);
      setPagination({
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
        start: res.data.start,
        end: res.data.end,
        page: res.data.page
      });
    } catch (err) {
      console.error('Error fetching members:', err);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openAddMember = () => {
    setEditMember(null);
    setForm({ name: '', email: '', contactNo: '', teamRoleId: '', password: '', profile: null });
    setPreviewImg(null);
    setShowModal(true);
  };

  const openEditMember = (row) => {
    setEditMember(row);
    setForm({
      name: row.name || '',
      email: row.email || '',
      contactNo: row.contactNo || '',
      teamRoleId: row.teamRoleId || '',
      password: '',
      profile: null
    });
    setPreviewImg(row.profile ? `${API_BASE}/${row.profile}` : null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, profile: reader.result });
      setPreviewImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        contactNo: form.contactNo,
        teamRoleId: form.teamRoleId,
        password: form.password || undefined,
        profile: form.profile || undefined
      };

      let res;
      if (editMember) {
        res = await teamRoleApi.editMember({ ...payload, filed_id: editMember.id });
      } else {
        res = await teamRoleApi.addMember(payload);
      }

      if (res.data.error) {
        const errMsg = Object.values(res.data.error).flat().join('\n');
        alert(errMsg);
        return;
      }

      setShowModal(false);
      fetchMembers();
    } catch (err) {
      console.error('Error saving member:', err);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this member? This process cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await teamRoleApi.deleteMember({ del_id: row.id, userId: row.userId });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchMembers();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete member', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  const getSmartPages = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = page;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set([1, total]);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('dots-' + i);
      }
      result.push(sorted[i]);
    }
    return result;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const smartPages = getSmartPages();
    return (
      <div className="cust-pagination">
        <span className="cust-page-info">Showing {pagination.start} to {pagination.end} of {pagination.totalRecords}</span>
        <div className="cust-page-btns">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="cust-page-btn"><ChevronLeft size={14} /></button>
          {smartPages.map(p =>
            typeof p === 'string' ? (
              <span key={p} className="cust-page-dots">...</span>
            ) : (
              <button key={p} onClick={() => setPage(p)} className={`cust-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
            )
          )}
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="cust-page-btn"><ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <UsersRound size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">Team List</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={openAddMember} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Team Member
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading members..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Team Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={7} className="cust-no-data">No team members found.</td></tr>
                ) : members.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td>
                      {row.profile ? (
                        <img
                          src={`${API_BASE}/${row.profile}`}
                          alt={row.name}
                          className="cust-avatar"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="cust-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb', fontSize: 14, color: '#999' }}>
                          {row.name ? row.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.contactNo}</td>
                    <td>
                      {row.teamRole ? (
                        <span className="cust-verify-badge verified">{row.teamRole}</span>
                      ) : (
                        <span className="cust-verify-badge unverified">-</span>
                      )}
                    </td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEditMember(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(row)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMember ? 'Edit Team Member' : 'Add Team Member'}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Select Role *</label>
            <select name="teamRoleId" value={form.teamRoleId} onChange={handleChange} required>
              <option value="" disabled>--Select Role--</option>
              {teamRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="cust-form-group">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" />
          </div>

          <div className="cust-form-group">
            <label>Profile</label>
            {previewImg && (
              <div style={{ marginBottom: 8 }}>
                <img src={previewImg} alt="profile" className="cust-img-preview" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="cust-form-row">
            <div className="cust-form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="example@gmail.com" />
            </div>
            <div className="cust-form-group">
              <label>Contact No *</label>
              <input name="contactNo" value={form.contactNo} onChange={handleChange} required placeholder="Contact No" />
            </div>
          </div>

          <div className="cust-form-group">
            <label>{editMember ? 'Password' : 'Password *'}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!editMember}
              placeholder={editMember ? 'Enter new password if you want to change old password' : '******'}
            />
          </div>

          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editMember ? 'Save' : 'Add Team Member'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default TeamMembers;
