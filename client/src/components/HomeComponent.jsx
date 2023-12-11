import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import logo from '../assets/logo_orange.png';

export default function HomeComponent() {
  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col>
          <h1 className="text-center">Thesis Management - Team 6</h1>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col>
          <p className="lead text-center">Welcome to the Thesis Management System</p>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col>
          <Image src={logo} alt="Logo" fluid />
        </Col>
      </Row>
    </Container>
  );
}
