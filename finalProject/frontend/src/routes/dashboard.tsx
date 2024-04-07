import { Container, Nav, Navbar } from "react-bootstrap";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#">My App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto"> {/* Right-aligned items */}
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Dashboard;
