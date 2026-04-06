import React, { useState, useEffect, useCallback } from 'react';
import { teamRoleApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { UsersRound, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const TeamRoles = () => {
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Add/Edit Role Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '' });
  const [adminPages, setAdminPages] = useState([]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will also delete associated team members!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await teamRoleApi.delete({ del_id: id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchRoles();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete role', icon: 'error', confirmButtonColor: '#7c3aed' });
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
            <h2 className="cust-title">Team Roles</h2>
            {pagination && <div className="cust-count">{pagination.totalRecords} total</div>}
          </div>
        </div>
        <div className="cust-topbar-right">
          <button onClick={openAddRole} className="cust-btn cust-btn-primary">
            <Plus size={15} /> Add Team Role
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading roles..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr><td colSpan={3} className="cust-no-data">No roles found.</td></tr>
                ) : roles.map((row, i) => (
                  <tr key={row.id}>
                    <td>{(pagination?.start || 0) + i}</td>
                    <td className="cust-name-cell">{row.name}</td>
                    <td>
                      <div className="cust-actions">
                        <button onClick={() => openEditRole(row)} className="cust-action-btn cust-action-edit" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDeleteRole(row.id)} className="cust-action-btn cust-action-delete" title="Delete"><Trash2 size={15} /></button>
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

      {/* Add/Edit Role Modal with Permission Checkboxes */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editRole ? 'Edit Team Role' : 'Add Team Role'}>
        <form onSubmit={handleRoleSubmit}>
          <div className="cust-form-group">
            <label>Role Name *</label>
            <input
              name="name"
              value={roleForm.name}
              onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
              required
              placeholder="Role Name"
            />
          </div>

          {adminPages.length > 0 && (
            <div className="cust-form-group">
              <label>Permissions</label>
              <div className="cust-form-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {adminPages.map((pg, idx) => (
                  <label key={pg.id} className="cust-form-group" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={!!pg.isPermitted}
                      onChange={() => togglePagePermission(idx)}
                      style={{ width: 'auto' }}
                    />
                    {pg.pageName}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">{editRole ? 'Save' : 'Add Team Role'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default TeamRoles;
