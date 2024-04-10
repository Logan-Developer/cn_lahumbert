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

    const handleClickFile = async (event: React.MouseEvent<HTMLAnchorElement>) => {

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
                    Range: 'bytes=0-',
                    Accept: 'video/webp;charset=UTF-8'
                },
                responseType: fileInfo.type === 'video' ? 'blob' : undefined
            });

            const data = response.data;

            props.sendFileToParent(fileInfo.name, fileInfo.type, fileInfo.name.split('.').pop(), data);
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

    return (
        <div>
            <Row>
                <Col xs={2}>
                    <Button onClick={() => handleGoBack()}>Go Back</Button>
                </Col>
                <Col xs={6}>
                    <p>Current directory: {subdirectory}</p>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>File Type</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index}>
                            <td><a id={file.path} onClick={handleClickFile}>{file.name}</a></td>
                            <td>{file.type}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default FileList;