// FileUploadComponent.jsx
import React, { useState } from 'react';
import API from '../API';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';


export function FileUploadComponent(props){

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    props.setFile(selectedFile);
  };
  

  return (
    <Container>
      <Row>
      <Col><Form.Control type="file" onChange={handleFileChange} accept=".pdf" /></Col>
      </Row>
    </Container>
  );
};

