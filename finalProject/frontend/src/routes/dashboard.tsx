import { Container, Modal, Nav, Navbar } from "react-bootstrap";
import FileList from "../components/filesystem/filelist";
import { useState } from "react";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
  };

  const sendFileToParent = (data: any) => {
    if (data.type === 'image') {
      setImageUrl(`data:image/png;base64,${data.data}`);
    }
    setFileName(data.name);
  }

  return (
    <Container fluid="true">
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

      <h1>Dashboard</h1>

      <FileList sendFileToParent={sendFileToParent} />

      <Modal show={!!imageUrl} onHide={() => setImageUrl('')}>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={imageUrl} alt={fileName} style={{ width: '100%' }} />
        </Modal.Body>
        <Modal.Footer>
          <a href={imageUrl} download>{fileName}</a>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Dashboard;
