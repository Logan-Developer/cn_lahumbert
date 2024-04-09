import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Container, Row, Table } from 'react-bootstrap';

const FileList: React.FC = () => {
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('/get-files', {
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

        fetchFiles();
    }, []);

    return (
        <div>
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
                            <td>{file.name}</td>
                            <td>{file.type}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default FileList;