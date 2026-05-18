import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import { supabase } from "@/utils/supabase";
import { toast } from "react-toastify";

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, name: "", image: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setCategories(data);
    } catch (error) {
      toast.error("Error fetching categories: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ id: null, name: "", image: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({ name: formData.name, image: formData.image, updated_at: new Date() })
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Category updated successfully!");
      } else {
        // Insert
        const { error } = await supabase
          .from("categories")
          .insert([{ name: formData.name, image: formData.image }]);
        if (error) throw error;
        toast.success("Category created successfully!");
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error("Error saving category: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        toast.error("Error deleting category: " + error.message);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Manage Categories | TNature Admin</title>
      </Head>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Categories</h4>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm p-3">
          <Table hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="align-middle">
                  <td>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: 50, height: 50, backgroundColor: '#e9ecef', borderRadius: '4px' }} />
                    )}
                  </td>
                  <td>{cat.name}</td>
                  <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(cat)}>
                      <PencilSquare />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat.id)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g., Honey"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <div className="d-flex flex-column gap-2">
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                />
                <Form.Control 
                  type="url" 
                  name="image" 
                  value={formData.image || ""} 
                  onChange={handleInputChange} 
                  placeholder="Or enter image URL (https://example.com/image.jpg)"
                />
                {uploadingImage && <small className="text-primary"><Spinner size="sm" animation="border" className="me-1"/> Uploading...</small>}
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" width="80" style={{ borderRadius: '4px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" animation="border" /> : "Save"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CategoriesAdmin;
