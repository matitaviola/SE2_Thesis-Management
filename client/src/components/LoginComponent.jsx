import { useState } from 'react';
import {Form, Button, Container, Row, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { Navigate, useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      
      props.login(credentials);
  };

  return (
    <Container>
      <Row className='justify-content-center'>
        <Col md = {6}>
        <Form onSubmit={handleSubmit}>
      <Form.Group controlId='username'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
      </Form.Group>

      <Form.Group controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true} minLength={6}/>
      </Form.Group>

      <Button type="submit" className='login-button' >Login</Button>
  </Form>
        </Col>
      </Row>
    </Container>

  )
};

function LogoutButton(props) {
  const navigate= useNavigate();

  return(
    <Dropdown >
    <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
      Logged in as Mario Rossi
    </Dropdown.Toggle>

    <Dropdown.Menu align="end">

      <Dropdown.Item eventKey="4" onClick={()=>{props.logout(); navigate('/')}}>Log Out</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);
  
}

export { LoginForm, LogoutButton };  