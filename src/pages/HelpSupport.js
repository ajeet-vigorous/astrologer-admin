import React, { useState, useEffect } from 'react';
import { helpSupportApi } from '../api/services';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { CircleHelp, Pencil, Trash2, Plus, Eye, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Customers.css';

const HelpSupport = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category');
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await helpSupportApi.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    setLoading(false);
  };

  const fetchSubCategories = async (catId) => {
    try {
      const res = await helpSupportApi.getSubCategories(catId);
      setSubCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
    }
  };

  const fetchSubSubCategories = async (subId) => {
    try {
      const res = await helpSupportApi.getSubSubCategories(subId);
      setSubSubCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching sub-sub-categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory.id);
      setSelectedSubCategory(null);
      setSubSubCategories([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
      fetchSubSubCategories(selectedSubCategory.id);
    }
  }, [selectedSubCategory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Category CRUD
  const openAddCategory = () => {
    setModalType('category');
    setEditData(null);
    setForm({ name: '', title: '', description: '' });
    setShowModal(true);
  };

  const openEditCategory = (row) => {
    setModalType('category');
    setEditData(row);
    setForm({ name: row.name || '', title: row.title || '', description: row.description || '' });
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This category will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await helpSupportApi.delete({ id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        fetchCategories();
        if (selectedCategory && selectedCategory.id === id) {
          setSelectedCategory(null);
          setSubCategories([]);
          setSelectedSubCategory(null);
          setSubSubCategories([]);
        }
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete category', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  // Sub Category CRUD
  const openAddSubCategory = () => {
    setModalType('sub');
    setEditData(null);
    setForm({ name: '', title: '', description: '' });
    setShowModal(true);
  };

  const openEditSubCategory = (row) => {
    setModalType('sub');
    setEditData(row);
    setForm({ name: row.name || '', title: row.title || '', description: row.description || '' });
    setShowModal(true);
  };

  const handleDeleteSubCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This sub-category will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await helpSupportApi.deleteSubCategory({ id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        if (selectedCategory) fetchSubCategories(selectedCategory.id);
        if (selectedSubCategory && selectedSubCategory.id === id) {
          setSelectedSubCategory(null);
          setSubSubCategories([]);
        }
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete sub-category', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  // Sub-Sub Category CRUD
  const openAddSubSubCategory = () => {
    setModalType('subsub');
    setEditData(null);
    setForm({ name: '', title: '', description: '' });
    setShowModal(true);
  };

  const openEditSubSubCategory = (row) => {
    setModalType('subsub');
    setEditData(row);
    setForm({ name: row.name || '', title: row.title || '', description: row.description || '' });
    setShowModal(true);
  };

  const handleDeleteSubSubCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This item will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await helpSupportApi.deleteSubSubCategory({ id });
        Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
        if (selectedSubCategory) fetchSubSubCategories(selectedSubCategory.id);
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete item', icon: 'error', confirmButtonColor: '#7c3aed' });
      }
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'category') {
        if (editData) {
          await helpSupportApi.edit({ ...form, id: editData.id });
        } else {
          await helpSupportApi.add(form);
        }
        fetchCategories();
      } else if (modalType === 'sub') {
        if (editData) {
          await helpSupportApi.editSubCategory({ ...form, id: editData.id });
        } else {
          await helpSupportApi.addSubCategory({ ...form, helpSupportId: selectedCategory.id });
        }
        fetchSubCategories(selectedCategory.id);
      } else if (modalType === 'subsub') {
        if (editData) {
          await helpSupportApi.editSubSubCategory({ ...form, id: editData.id });
        } else {
          await helpSupportApi.addSubSubCategory({ ...form, helpSupportSubId: selectedSubCategory.id });
        }
        fetchSubSubCategories(selectedSubCategory.id);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const getModalTitle = () => {
    const action = editData ? 'Edit' : 'Add';
    if (modalType === 'category') return `${action} Category`;
    if (modalType === 'sub') return `${action} Sub-Category`;
    return `${action} Sub-Sub-Category`;
  };

  const getPageTitle = () => {
    if (selectedSubCategory) return `Items in "${selectedSubCategory.name}"`;
    if (selectedCategory) return `Sub-Categories of "${selectedCategory.name}"`;
    return 'Help & Support';
  };

  const getCount = () => {
    if (selectedSubCategory) return subSubCategories.length;
    if (selectedCategory) return subCategories.length;
    return categories.length;
  };

  const getCurrentData = () => {
    if (selectedSubCategory) return subSubCategories;
    if (selectedCategory) return subCategories;
    return categories;
  };

  const handleBack = () => {
    if (selectedSubCategory) {
      setSelectedSubCategory(null);
      setSubSubCategories([]);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setSubCategories([]);
      setSelectedSubCategory(null);
      setSubSubCategories([]);
    }
  };

  const handleAddClick = () => {
    if (selectedSubCategory) openAddSubSubCategory();
    else if (selectedCategory) openAddSubCategory();
    else openAddCategory();
  };

  const getAddLabel = () => {
    if (selectedSubCategory) return 'Add Item';
    if (selectedCategory) return 'Add Sub-Category';
    return 'Add Category';
  };

  const data = getCurrentData();

  return (
    <div>
      <div className="cust-topbar">
        <div className="cust-topbar-left">
          <CircleHelp size={25} color="#7c3aed" />
          <div>
            <h2 className="cust-title">{getPageTitle()}</h2>
            <div className="cust-count">{getCount()} total</div>
          </div>
        </div>
        <div className="cust-topbar-right">
          {(selectedCategory || selectedSubCategory) && (
            <button onClick={handleBack} className="cust-btn cust-btn-ghost">
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button onClick={handleAddClick} className="cust-btn cust-btn-primary">
            <Plus size={15} /> {getAddLabel()}
          </button>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Title</th>
                  {selectedSubCategory && <th>Description</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={selectedSubCategory ? 5 : 4} className="cust-no-data">No data found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td className="cust-name-cell">{row.name || '---'}</td>
                    <td>{row.title || '---'}</td>
                    {selectedSubCategory && (
                      <td>{row.description ? (row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description) : '---'}</td>
                    )}
                    <td>
                      <div className="cust-actions">
                        {!selectedSubCategory && (
                          <button
                            onClick={() => {
                              if (selectedCategory) {
                                setSelectedSubCategory(row);
                              } else {
                                setSelectedCategory(row);
                                setSelectedSubCategory(null);
                                setSubSubCategories([]);
                              }
                            }}
                            className="cust-action-btn cust-action-view"
                            title="View Sub"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (selectedSubCategory) openEditSubSubCategory(row);
                            else if (selectedCategory) openEditSubCategory(row);
                            else openEditCategory(row);
                          }}
                          className="cust-action-btn cust-action-edit"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (selectedSubCategory) handleDeleteSubSubCategory(row.id);
                            else if (selectedCategory) handleDeleteSubCategory(row.id);
                            else handleDeleteCategory(row.id);
                          }}
                          className="cust-action-btn cust-action-delete"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={getModalTitle()}>
        <form onSubmit={handleSubmit}>
          <div className="cust-form-group">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter name" />
          </div>
          <div className="cust-form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
          </div>
          <div className="cust-form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter description" />
          </div>
          <button type="submit" className="cust-btn cust-btn-primary cust-btn-full">
            {editData ? 'Update' : 'Add'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HelpSupport;
