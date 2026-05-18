import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Table, Button, Modal, Form, Spinner, Row, Col, Badge } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import { supabase } from "@/utils/supabase";
import { toast } from "react-toastify";

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");


  const [formData, setFormData] = useState({
    id: null,
    name: "",
    image: "",
    price: "",
    rating: "0",
    unit: "",
    category_id: "",
    is_best_seller: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products with category names
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select(`
          *,
          categories:category_id(name)
        `)
        .order("name", { ascending: true });

      if (prodError) throw prodError;
      setProducts(prodData);

      // Fetch Categories for dropdown
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (catError) throw catError;
      setCategories(catData);

    } catch (error) {
      toast.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        rating: product.rating.toString(),
      });
    } else {
      setFormData({
        id: null,
        name: "",
        image: "",
        price: "",
        rating: "0",
        unit: "",
        category_id: "",
        is_best_seller: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

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

    const payload = {
      name: formData.name,
      image: formData.image,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      unit: formData.unit,
      category_id: formData.category_id || null,
      is_best_seller: formData.is_best_seller,
      updated_at: new Date()
    };

    try {
      if (formData.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert([payload]);
        if (error) throw error;
        toast.success("Product created successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error("Error saving product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        toast.success("Product deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error("Error deleting product: " + error.message);
      }
    }
  };

  const getFilteredAndSortedProducts = () => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterCategory) {
      result = result.filter(p => p.category_id === filterCategory);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'price_asc': return parseFloat(a.price) - parseFloat(b.price);
        case 'price_desc': return parseFloat(b.price) - parseFloat(a.price);
        case 'newest': return new Date(b.created_at) - new Date(a.created_at);
        default: return 0;
      }
    });

    return result;
  };

  const displayProducts = getFilteredAndSortedProducts();

  return (
    <>
      <Head>
        <title>Manage Products | TNature Admin</title>
      </Head>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Products</h4>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add Product
        </Button>
      </div>

      <Row className="mb-3 g-2">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="newest">Recently Added</option>
          </Form.Select>
        </Col>
      </Row>

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
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((prod) => (
                <tr key={prod.id} className="align-middle">
                  <td>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: 50, height: 50, backgroundColor: '#e9ecef', borderRadius: '4px' }} />
                    )}
                  </td>
                  <td>
                    {prod.name}
                    {prod.is_best_seller && <Badge bg="warning" text="dark" className="ms-2">Best Seller</Badge>}
                  </td>
                  <td>{prod.categories?.name || "-"}</td>
                  <td>₹{prod.price}</td>
                  <td>{prod.unit}</td>
                  <td>{new Date(prod.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(prod)}>
                      <PencilSquare />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(prod.id)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
              {displayProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Raw Forest Honey"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    name="unit"
                    value={formData.unit || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 500g, 1kg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
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
                      // type="url" 
                      name="image"
                      value={formData.image || ""}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL (https://example.com/image.jpg)"
                    />
                    {uploadingImage && <small className="text-primary"><Spinner size="sm" animation="border" className="me-1" /> Uploading...</small>}
                    {formData.image && (
                      <div className="mt-2">
                        <img src={formData.image} alt="Preview" width="80" style={{ borderRadius: '4px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="is-best-seller"
                label="Mark as Best Seller"
                name="is_best_seller"
                checked={formData.is_best_seller}
                onChange={handleInputChange}
              />
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

export default ProductsAdmin;
