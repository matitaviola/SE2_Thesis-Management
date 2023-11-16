import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './LoginComponent';
import { useContext } from 'react';
import { AuthContext } from '../App';

function NavHeader(props) {
  const loggedInUser = useContext(AuthContext);

  return (
  <Navbar bg="primary" variant="dark">
    <Container fluid>
      <Link to='/' className='navbar-brand'>POLITO Thesis</Link>
      <Nav className="me-auto">
      <Nav.Link href="/proposals">Proposals</Nav.Link>
        <Nav.Link href="/applications">Applications</Nav.Link>
        </Nav>
      {loggedInUser ? 
        <LogoutButton logout={props.handleLogout} user={loggedInUser} /> :
        <Link to='/login'className='btn btn-outline-light'>Login</Link>
         }
    </Container>
  </Navbar>
  );
  
}

export default NavHeader;