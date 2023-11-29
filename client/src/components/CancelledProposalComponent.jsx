import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CancelledProposalMessage = () => {
  return (
    <Container>
    <Row className="justify-content-center mt-4">
      <Col>
        <h1 className="text-center">This Proposal has been deleted by its supervisor.</h1>
      </Col>
    </Row>
    <Row className="justify-content-center mt-4">
      <Col>
        <h2 className="lead text-center"> Sorry for the inconvenience</h2>
      </Col>
    </Row>
    <Row className="justify-content-center mt-4">
      <Col className="text-center">
        <Button variant="primary">
          <Link to="/proposals" style={{ textDecoration: 'none', color: 'inherit' }}>
            PROPOSALS
          </Link>
        </Button>
      </Col>
    </Row>
  </Container>
  );
};

export default CancelledProposalMessage;