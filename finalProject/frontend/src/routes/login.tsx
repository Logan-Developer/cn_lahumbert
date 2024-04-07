import React, { useState } from 'react';
import axios from 'axios'; // Or your preferred HTTP client
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

axios.defaults.baseURL = 'http://localhost:3000';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/login', { username, password }, {
        headers: { 'Content-Type': 'application/json' }

      });

      // Successful login
      const token = response.data.token;
      localStorage.setItem('jwtToken', token);

      // Redirect the user to the protected area (e.g., dashboard)
      window.location.href = '/';

    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Login failed');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card style={{ width: '30rem' }}>
            <Card.Header className="text-center">
              <h2>Login</h2>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <br />
                <Form.Group className="mb-3 d-flex justify-content-between">
                <a href="/register">Register</a>
                <Button type="submit" className="me-2">Login</Button>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
