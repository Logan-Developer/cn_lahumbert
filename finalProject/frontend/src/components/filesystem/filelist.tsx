import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Row, Table } from 'react-bootstrap';

const FileList: React.FC = (props: any) => {
    const [files, setFiles] = useState<string[]>([]);
    const [subdirectory, setSubdirectory] = useState<string>('/');

    const fetchFiles = async () => {
        try {
            const response = await axios.get('/get-files' + subdirectory, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            const data = response.data;
            setFiles(data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };


    useEffect(() => {
        fetchFiles();
    }, [subdirectory]);

    const handleViewDownloadFile = async (event: React.MouseEvent<HTMLAnchorElement>) => {

        const path = event.currentTarget.id;

        // If the file is a directory, update the subdirectory state
        if (files.find((file) => file.path === path)?.type === 'directory') {
            setSubdirectory(subdirectory + path + '/');
            return;
        }

        try {
            const fileInfo = files.find((file) => file.path === path);

            if (!fileInfo) {
                return;
            }

            const encodedPath = encodeURIComponent(path);
            const response = await axios.get(`/get-file/${encodedPath}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    Range: 'bytes=0-'
                },
                responseType: 'blob'
            });

            const data = response.data;

            props.sendFileToParent(fileInfo.name, fileInfo.type, data);
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };

    const handleGoBack = () => {
        const path = subdirectory.split('/');
        path.pop();
        path.pop();
        setSubdirectory(path.join('/') + '/');
    }

    const handleUpload = () => {
        // Open a dialog to select a file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.name = 'file';
        input.onchange = async (event: any) => {
            // upload file as binary
            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                await axios.post('/upload-file' + subdirectory, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                fetchFiles();
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        };
        input.click();
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter the folder name:');

        if (!folderName) {
            return;
        }

        try {
            await axios.post('/create-folder', {
                folderName: folderName,
                subdirectory: subdirectory
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            fetchFiles();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleRenameFile = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const path = event.currentTarget.id;
        const fileInfo = files.find((file) => file.path === path);

        if (!fileInfo) {
            return;
        }

        const newFileName = prompt('Enter the new file name:', fileInfo.name.split('.')[0]);

        if (!newFileName) {
            return;
        }

        try {
            await axios.post('/rename-file', {
                path: path,
                newFileName: newFileName
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            fetchFiles();
        } catch (error) {
            console.error('Error renaming file:', error);
        }
    };

    const handleDeleteFile = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // display a confirmation dialog
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        const path = event.currentTarget.id;

        try {
            await axios.delete('/delete-file/' + path, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div>
            <Row>
                <Col xs={2}>
                    <Button onClick={() => handleGoBack()}>Go Back</Button>
                </Col>
                <Col xs={6}>
                    <p>Current directory: {subdirectory}</p>
                </Col>
                <Col xs={2}>
                    <Button onClick={() => handleUpload()}>Upload</Button>
                </Col>
                <Col xs={2}>
                    <Button onClick={() => handleCreateFolder()}>Create Folder</Button>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>File Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index}>
                            <td><a id={file.path} onClick={handleViewDownloadFile}>{file.name}</a></td>
                            <td>{file.type}</td>
                            <td>
                                <Button variant="primary" onClick={handleViewDownloadFile} id={file.path}>View/Download</Button>
                                <Button variant="warning" onClick={handleRenameFile} id={file.path}>Rename</Button>
                                <Button variant="danger" onClick={handleDeleteFile} id={file.path}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default FileList;
