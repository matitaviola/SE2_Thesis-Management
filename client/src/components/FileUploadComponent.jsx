// FileUploadComponent.jsx
import React, { useState } from 'react';
import API from '../API';
import { Button } from 'react-bootstrap';


export function FileUploadComponent(){
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    await API.uploadResumee(file);
  };
  
  return (
    <div>
      <Button  onClick={()=>setFile(null)}>Clear</Button>
      <Form.Control type="file" size="lg" onChange={handleFileChange}/>
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

