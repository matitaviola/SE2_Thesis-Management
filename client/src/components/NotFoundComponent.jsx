import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_orange.png';

export default function NotFound() {
    return (
      <Container>
      <Row className="justify-content-center mt-4">
        <Col>
          <h1 className="text-center">Thesis Management - Team 6</h1>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col>
          <h2 className="lead text-center">404 - Route not found</h2>
        </Col>
      </Row>
      <Row>
        <Link to={`/`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop:'1rem',textDecoration: 'none' }}>
          <Button className="enbiggen-logout-button-student"style={{color:'white'}}>GO HOME</Button>
        </Link></Row>
      <Row className="justify-content-center mt-4">
        <Col>
          <Image src={logo} alt="Logo" fluid />
        </Col>
      </Row>
    </Container>
    );
  }