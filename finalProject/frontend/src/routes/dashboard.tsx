import { Container, Modal, Nav, Navbar } from "react-bootstrap";
import FileList from "../components/filesystem/filelist";
import { useState } from "react";

const Dashboard = () => {
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>(''); // ['image', 'pdf'
  const [fileUrl, setFileUrl] = useState<string>('');

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
  };

  const sendFileToParent = (data: any) => {
    switch (data.type) {
      case 'image':
        setFileUrl(`data:image/png;base64,${data.data}`);
      break;
      case 'pdf':
        setFileUrl(`data:application/pdf;base64,${data.data}`);
      break;
    }
    setFileName(data.name);
    setFileType(data.type);
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

      <Modal show={!!fileUrl} onHide={() => setFileUrl('')}>
        <Modal.Header closeButton>
          <Modal.Title>File Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fileType === 'image' && <img src={fileUrl} alt={fileName} />}
          {fileType === 'pdf' && <embed src={fileUrl} width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <a href={fileUrl} download>{fileName}</a>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Dashboard;
