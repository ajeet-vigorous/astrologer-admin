import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { teamRoleApi } from '../api/services';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [teamRoles, setTeamRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // Add/Edit Member Modal
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', contactNo: '', teamRoleId: '', password: '', profile: null
  });
  const [previewImg, setPreviewImg] = useState(null);

  const fetchMembers = useCallback(async () => {
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
    if (window.confirm('Do you really want to delete this member? This process cannot be undone.')) {
      try {
        await teamRoleApi.deleteMember({ del_id: row.id, userId: row.userId });
        fetchMembers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const memberColumns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Profile', render: (row) => (
        <div style={{ width: 40, height: 40 }}>
          {row.profile ? (
            <img
              src={`${API_BASE}/${row.profile}`}
              alt={row.name}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#999' }}>
              {row.name ? row.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>
      )
    },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Contact No', key: 'contactNo' },
    { header: 'Team Role', render: (row) => row.teamRole || '-' },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openEditMember(row)} style={styles.editBtn}>Edit</button>
          <button onClick={() => handleDelete(row)} style={styles.deleteBtn}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Team List"
        columns={memberColumns}
        data={members}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button onClick={openAddMember} style={styles.addBtn}>+ Add Team List</button>
        }
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMember ? 'Edit Team Member' : 'Add Team Member'}>
        <form onSubmit={handleSubmit}>
          {/* Select Role */}
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Select Role</label>
            <select name="teamRoleId" value={form.teamRoleId} onChange={handleChange} required style={styles.select}>
              <option value="" disabled>--Select Role--</option>
              {teamRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Name" />

          {/* Profile Image */}
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Profile</label>
            {previewImg && (
              <div style={{ marginBottom: 8 }}>
                <img src={previewImg} alt="profile" style={{ width: 150, borderRadius: 4 }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: 13 }} />
          </div>

          <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="example@gmail.com" />
          <FormInput label="Contact No" name="contactNo" value={form.contactNo} onChange={handleChange} required placeholder="Contact No" />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!editMember}
            placeholder={editMember ? 'Enter new password if you want to change old password' : '******'}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={styles.submitBtn}>{editMember ? 'Save' : 'Add Team Member'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  editBtn: { padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  deleteBtn: { padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  submitBtn: { padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  label: { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#555' },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none' }
};

export default TeamMembers;
