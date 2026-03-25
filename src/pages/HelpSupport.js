import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { helpSupportApi } from '../api/services';

const HelpSupport = () => {
  // Main categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Sub categories
  const [subCategories, setSubCategories] = useState([]);
  // Sub-sub categories
  const [subSubCategories, setSubSubCategories] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' | 'sub' | 'subsub'
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
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await helpSupportApi.delete({ id });
        fetchCategories();
        if (selectedCategory && selectedCategory.id === id) {
          setSelectedCategory(null);
          setSubCategories([]);
          setSelectedSubCategory(null);
          setSubSubCategories([]);
        }
      } catch (err) {
        console.error('Error deleting category:', err);
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
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        await helpSupportApi.deleteSubCategory({ id });
        if (selectedCategory) fetchSubCategories(selectedCategory.id);
        if (selectedSubCategory && selectedSubCategory.id === id) {
          setSelectedSubCategory(null);
          setSubSubCategories([]);
        }
      } catch (err) {
        console.error('Error deleting sub-category:', err);
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
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await helpSupportApi.deleteSubSubCategory({ id });
        if (selectedSubCategory) fetchSubSubCategories(selectedSubCategory.id);
      } catch (err) {
        console.error('Error deleting sub-sub-category:', err);
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

  const btnStyle = { padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };

  const categoryColumns = [
    { header: '#', render: (row, i) => i + 1 },
    { header: 'Name', key: 'name' },
    { header: 'Title', key: 'title' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setSelectedCategory(row); setSelectedSubCategory(null); setSubSubCategories([]); }} style={{ ...btnStyle, background: '#10b981', color: '#fff' }}>View Sub</button>
          <button onClick={() => openEditCategory(row)} style={{ ...btnStyle, background: '#3b82f6', color: '#fff' }}>Edit</button>
          <button onClick={() => handleDeleteCategory(row.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}>Delete</button>
        </div>
      )
    }
  ];

  const subCategoryColumns = [
    { header: '#', render: (row, i) => i + 1 },
    { header: 'Name', key: 'name' },
    { header: 'Title', key: 'title' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setSelectedSubCategory(row)} style={{ ...btnStyle, background: '#10b981', color: '#fff' }}>View Sub</button>
          <button onClick={() => openEditSubCategory(row)} style={{ ...btnStyle, background: '#3b82f6', color: '#fff' }}>Edit</button>
          <button onClick={() => handleDeleteSubCategory(row.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}>Delete</button>
        </div>
      )
    }
  ];

  const subSubCategoryColumns = [
    { header: '#', render: (row, i) => i + 1 },
    { header: 'Name', key: 'name' },
    { header: 'Title', key: 'title' },
    { header: 'Description', render: (row) => row.description ? (row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description) : '-' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openEditSubSubCategory(row)} style={{ ...btnStyle, background: '#3b82f6', color: '#fff' }}>Edit</button>
          <button onClick={() => handleDeleteSubSubCategory(row.id)} style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
        <span onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setSubCategories([]); setSubSubCategories([]); }} style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: selectedCategory ? 400 : 600 }}>Categories</span>
        {selectedCategory && (
          <>
            <span style={{ color: '#999' }}>/</span>
            <span onClick={() => { setSelectedSubCategory(null); setSubSubCategories([]); }} style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: selectedSubCategory ? 400 : 600 }}>{selectedCategory.name}</span>
          </>
        )}
        {selectedSubCategory && (
          <>
            <span style={{ color: '#999' }}>/</span>
            <span style={{ fontWeight: 600, color: '#333' }}>{selectedSubCategory.name}</span>
          </>
        )}
      </div>

      {/* Level 1: Main Categories */}
      {!selectedCategory && (
        <DataTable
          title="Help & Support - Categories"
          columns={categoryColumns}
          data={categories}
          headerActions={
            <button onClick={openAddCategory} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Category</button>
          }
        />
      )}

      {/* Level 2: Sub Categories */}
      {selectedCategory && !selectedSubCategory && (
        <DataTable
          title={`Sub-Categories of "${selectedCategory.name}"`}
          columns={subCategoryColumns}
          data={subCategories}
          headerActions={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setSelectedCategory(null); setSubCategories([]); }} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
              <button onClick={openAddSubCategory} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Sub-Category</button>
            </div>
          }
        />
      )}

      {/* Level 3: Sub-Sub Categories */}
      {selectedSubCategory && (
        <DataTable
          title={`Items in "${selectedSubCategory.name}"`}
          columns={subSubCategoryColumns}
          data={subSubCategories}
          headerActions={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setSelectedSubCategory(null); setSubSubCategories([]); }} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
              <button onClick={openAddSubSubCategory} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Item</button>
            </div>
          }
        />
      )}

      {/* Shared Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={getModalTitle()}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Enter name" />
          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
          <FormInput label="Description" type="textarea" name="description" value={form.description} onChange={handleChange} placeholder="Enter description" />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{editData ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HelpSupport;
