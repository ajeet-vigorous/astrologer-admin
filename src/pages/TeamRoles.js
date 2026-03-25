import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { teamRoleApi } from '../api/services';

const TeamRoles = () => {
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // Add/Edit Role Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '' });
  const [adminPages, setAdminPages] = useState([]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await teamRoleApi.getAll({ page });
      setRoles(res.data.teamRole || []);
      setPagination({
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
        start: res.data.start,
        end: res.data.end,
        page: res.data.page
      });
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, [page]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // Open Add Role - fetch admin pages like Laravel redirectAddTeamRole
  const openAddRole = async () => {
    setEditRole(null);
    setRoleForm({ name: '' });
    try {
      const res = await teamRoleApi.getAddPage();
      const pages = (res.data.pages || []).map(p => ({ ...p, isPermitted: false }));
      setAdminPages(pages);
    } catch (err) {
      console.error(err);
      setAdminPages([]);
    }
    setShowRoleModal(true);
  };

  // Open Edit Role - fetch admin pages with isPermitted like Laravel redirectEditTeamRole
  const openEditRole = async (role) => {
    setEditRole(role);
    setRoleForm({ name: role.name });
    try {
      const res = await teamRoleApi.getEditPage(role.id);
      setAdminPages(res.data.pages || []);
    } catch (err) {
      console.error(err);
      setAdminPages([]);
    }
    setShowRoleModal(true);
  };

  // Toggle page permission checkbox
  const togglePagePermission = (pageIndex) => {
    const updated = [...adminPages];
    updated[pageIndex] = { ...updated[pageIndex], isPermitted: !updated[pageIndex].isPermitted };
    setAdminPages(updated);
  };

  // Submit role (add/edit) - sends page array in Laravel format
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pageData = adminPages.map(p => ({
        page: {
          id: p.id,
          ...(p.isPermitted ? { value: 'on' } : {})
        }
      }));

      if (editRole) {
        const res = await teamRoleApi.edit({ id: editRole.id, name: roleForm.name, page: pageData });
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      } else {
        const res = await teamRoleApi.add({ name: roleForm.name, page: pageData });
        if (res.data.error) { alert(JSON.stringify(res.data.error)); return; }
      }
      setShowRoleModal(false);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure? This will also delete associated team members.')) {
      try {
        await teamRoleApi.delete({ del_id: id });
        fetchRoles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const roleColumns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    { header: 'Name', key: 'name' },
    {
      header: 'Actions', render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openEditRole(row)} style={styles.editBtn}>Edit</button>
          <button onClick={() => handleDeleteRole(row.id)} style={styles.deleteBtn}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Team Roles"
        columns={roleColumns}
        data={roles}
        pagination={pagination}
        onPageChange={setPage}
        headerActions={
          <button onClick={openAddRole} style={styles.addBtn}>+ Add Team Role</button>
        }
      />

      {/* Add/Edit Role Modal with Permission Checkboxes */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editRole ? 'Edit Team Role' : 'Add Team Role'}>
        <form onSubmit={handleRoleSubmit}>
          <FormInput
            label="Name"
            name="name"
            value={roleForm.name}
            onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
            required
            placeholder="Role Name"
          />

          {adminPages.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {adminPages.map((pg, idx) => (
                  <label key={pg.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '4px 0' }}>
                    <input
                      type="checkbox"
                      checked={!!pg.isPermitted}
                      onChange={() => togglePagePermission(idx)}
                    />
                    {pg.pageName}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={styles.submitBtn}>{editRole ? 'Save' : 'Add Team Role'}</button>
            <button type="button" onClick={() => setShowRoleModal(false)} style={styles.cancelBtn}>Cancel</button>
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
  cancelBtn: { padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
};

export default TeamRoles;
