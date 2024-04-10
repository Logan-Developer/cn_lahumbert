import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';

const FileList: React.FC = (props: any) => {
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

    const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {

        const path = event.currentTarget.id;

        try {
            const response = await axios.get(`/get-file/${path}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            const data = response.data;
            props.sendFileToParent(data);
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };

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
                            <td><a id={file.path} onClick={handleClick}>{file.name}</a></td>
                            <td>{file.type}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default FileList;