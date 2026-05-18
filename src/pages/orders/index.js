import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Table, Button, Modal, Form, Spinner, Badge, Card, Row, Col } from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import { supabase } from "@/utils/supabase";
import { toast } from "react-toastify";

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          addresses:address_id(full_name, phone_number, address_line, city, state, pincode),
          order_items:order_items(
            id, quantity, price,
            products:product_id(name, image)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      toast.error("Error fetching orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setSavingStatus(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Update blocked by database policies (RLS). You may need admin privileges.");
      }

      toast.success("Order status updated!");
      fetchOrders();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || "Error updating status");
    } finally {
      setSavingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'shipped': return <Badge bg="info">Shipped</Badge>;
      case 'delivered': return <Badge bg="success">Delivered</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    return status === 'paid' ? <Badge bg="success">Paid</Badge> : <Badge bg="warning" text="dark">Pending</Badge>;
  };

  return (
    <>
      <Head>
        <title>Manage Orders | TNature Admin</title>
      </Head>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Orders</h4>
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
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="align-middle">
                  <td><small className="text-muted">{order.id.split('-')[0]}...</small></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.addresses?.full_name || "Unknown"}</td>
                  <td>₹{order.total_amount}</td>
                  <td>{getPaymentBadge(order.payment_status)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(order)}>
                      <Eye /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <Modal show={showModal} onHide={handleCloseModal} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-4">
              <Col md={6}>
                <h6 className="text-muted mb-2">Customer & Address</h6>
                {selectedOrder.addresses ? (
                  <Card className="p-3 bg-light border-0">
                    <strong>{selectedOrder.addresses.full_name}</strong>
                    <p className="mb-1">{selectedOrder.addresses.phone_number}</p>
                    <p className="mb-0 text-muted small">
                      {selectedOrder.addresses.address_line},<br />
                      {selectedOrder.addresses.city}, {selectedOrder.addresses.state} - {selectedOrder.addresses.pincode}
                    </p>
                  </Card>
                ) : (
                  <p>No address found.</p>
                )}
              </Col>
              <Col md={6}>
                <h6 className="text-muted mb-2">Order Info</h6>
                <Card className="p-3 bg-light border-0">
                  <p className="mb-1"><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p className="mb-1"><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p className="mb-1"><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                  <p className="mb-1"><strong>Payment Status:</strong> {getPaymentBadge(selectedOrder.payment_status)}</p>
                  {selectedOrder.razorpay_payment_id && (
                    <p className="mb-0"><strong>Transaction ID:</strong> <small>{selectedOrder.razorpay_payment_id}</small></p>
                  )}
                </Card>
              </Col>
            </Row>

            <h6 className="text-muted mb-3">Order Items</h6>
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {item.products?.image && (
                          <img src={item.products.image} alt={item.products.name} width="30" height="30" style={{ objectFit: 'cover' }} />
                        )}
                        <span>{item.products?.name}</span>
                      </div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">₹{item.price}</td>
                    <td className="text-end fw-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total Amount:</td>
                  <td className="text-end fw-bold fs-5 text-primary">₹{selectedOrder.total_amount}</td>
                </tr>
              </tfoot>
            </Table>

            <hr />
            <Row className="align-items-center mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Update Order Status</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                    <Button
                      variant="primary"
                      onClick={handleUpdateStatus}
                      disabled={savingStatus || newStatus === selectedOrder.status}
                    >
                      {savingStatus ? <Spinner size="sm" animation="border" /> : "Update"}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default OrdersAdmin;
