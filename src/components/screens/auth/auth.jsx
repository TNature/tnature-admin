import React, { useState } from "react";
import styles from "./auth.module.scss";
import CustomContainer from "@/components/ui/custom_container/custom_container";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Envelope, Lock } from "react-bootstrap-icons";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";
import { supabase } from "@/utils/supabase";

const AuthScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { signIn } = useAuth();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
      // await supabase.auth.signUp(
      //   {
      //     email: formData.email,
      //     password: formData.password,
      //     options: {
      //       data: {
      //         role: "super-admin",
      //       },
      //     },
      //   }
      // )
      toast.success("Welcome back Admin!");
      const redirect = router.query.redirect || "/";
      router.push(redirect);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.AuthScreen}>
      <CustomContainer lg>
        <div className={styles.wrapper} data-aos="fade-up">
          <Row className="g-0 justify-content-center">
            <Col lg={6} className={styles.formCol}>
              <div className={styles.formContent}>
                <div className={styles.formHeader}>
                  <h2>TNature Admin Login</h2>
                  <p>Please enter your credentials to manage the platform.</p>
                </div>

                <Form className={styles.form} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Admin Email Address</Form.Label>
                    <div className={styles.inputGroup}>
                      <Envelope className={styles.inputIcon} />
                      <Form.Control
                        name="email"
                        type="email"
                        placeholder="Enter admin email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <div className={styles.inputGroup}>
                      <Lock className={styles.inputIcon} />
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                  </Form.Group>

                  <Button
                    variant="primary"
                    className={styles.submitBtn}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </CustomContainer>
    </div>
  );
};

export default AuthScreen;
