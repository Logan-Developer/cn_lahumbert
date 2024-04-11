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

  const sendFileToParent = (name: string, type: string, data: any) => {
    switch (type) {
      case 'image':
        setFileUrl(URL.createObjectURL(data));
        break;
      case 'pdf':
        setFileUrl(URL.createObjectURL(data));
        break;
      case 'video':
        setFileUrl(URL.createObjectURL(data));
        break;
      case 'audio':
        setFileUrl(URL.createObjectURL(data));
        break;
      default:
        const a = document.createElement('a');
        a.href = URL.createObjectURL(data);
        a.download = name;
        a.click();
        break;
    }
    setFileName(name);
    setFileType(type);
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
        <Modal.Body className="text-center">
          {fileType === 'image' && <img src={fileUrl} alt={fileName} width={400} height={400} />}
          {fileType === 'pdf' && <embed src={fileUrl} width="100%" height="500px" />}
          {fileType === 'video' && <video id="video" width="400" height="400" controls autoPlay src={fileUrl} />}
          {fileType === 'audio' && <audio id="audio" controls autoPlay src={fileUrl} />}
        </Modal.Body>
        <Modal.Footer>
          <a href={fileUrl} download={fileName} className="btn btn-primary">Download</a>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Dashboard;
