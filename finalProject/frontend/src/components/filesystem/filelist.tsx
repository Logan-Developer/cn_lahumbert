import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
            <h2>File List</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;