import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Row, Col, Card } from "react-bootstrap";
import { supabase } from "@/utils/supabase";
import { ReceiptCutoff, BoxSeam, Tags } from "react-bootstrap-icons";

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        orders: ordersRes.count || 0,
        products: productsRes.count || 0,
        categories: categoriesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | TNature Admin</title>
      </Head>
      <div>
        <h4 className="mb-4">Dashboard Overview</h4>
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <Row>
            <Col md={4} className="mb-4">
              <Card className="text-center shadow-sm h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <ReceiptCutoff size={40} className="text-primary mb-3" />
                  <Card.Title>Total Orders</Card.Title>
                  <Card.Text className="fs-2 fw-bold">{stats.orders}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center shadow-sm h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <BoxSeam size={40} className="text-success mb-3" />
                  <Card.Title>Total Products</Card.Title>
                  <Card.Text className="fs-2 fw-bold">{stats.products}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center shadow-sm h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <Tags size={40} className="text-info mb-3" />
                  <Card.Title>Total Categories</Card.Title>
                  <Card.Text className="fs-2 fw-bold">{stats.categories}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default Dashboard;
