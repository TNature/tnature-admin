import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Table, Spinner, Badge, Form, Row, Col, Button, Modal } from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const CustomersAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch customers");
      }
      const data = await response.json();
      
      // Sort customers by created_at descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setCustomers(sortedData);
    } catch (error) {
      toast.error("Error fetching customers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCustomers = () => {
    if (!searchTerm) return customers;
    return customers.filter((c) => {
      const searchLower = searchTerm.toLowerCase();
      const emailMatch = c.email?.toLowerCase().includes(searchLower);
      const nameMatch = (c.user_metadata?.full_name || c.address_name || "").toLowerCase().includes(searchLower);
      const phoneMatch = (c.phone_number || "").toLowerCase().includes(searchLower);
      return emailMatch || nameMatch || phoneMatch;
    });
  };

  const displayCustomers = getFilteredCustomers();

  const handleOpenModal = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <Head>
        <title>Manage Customers | TNature Admin</title>
      </Head>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Customers</h4>
      </div>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Last Sign In</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCustomers.map((customer) => (
                <tr key={customer.id} className="align-middle">
                  <td>{customer.user_metadata?.full_name || customer.address_name || "-"}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone_number || "-"}</td>
                  <td>
                    {customer.user_metadata?.role === "super-admin" ? (
                      <Badge bg="danger">Admin</Badge>
                    ) : (
                      <Badge bg="secondary">Customer</Badge>
                    )}
                  </td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    {customer.last_sign_in_at
                      ? new Date(customer.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => handleOpenModal(customer)}>
                      <Eye className="me-1" /> Addresses
                    </Button>
                  </td>
                </tr>
              ))}
              {displayCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Addresses for {selectedCustomer?.user_metadata?.full_name || selectedCustomer?.address_name || selectedCustomer?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer?.addresses && selectedCustomer.addresses.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {selectedCustomer.addresses.map(addr => (
                <div key={addr.id} className="p-3 border rounded shadow-sm bg-light">
                  <h6 className="fw-bold mb-1">{addr.full_name}</h6>
                  <p className="mb-2 text-muted small"><i className="bi bi-telephone-fill"></i> {addr.phone_number}</p>
                  <p className="mb-0">
                    {addr.address_line},<br/>
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center my-4">No addresses found for this customer.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CustomersAdmin;
