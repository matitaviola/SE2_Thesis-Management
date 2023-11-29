import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LogoutButton } from './LoginComponent';
import { useContext } from 'react';
import { AuthContext } from '../App';

function NavHeader(props) {
  const loggedInUser = useContext(AuthContext);
  const location = useLocation();

  return (
    <Navbar bg="primary" variant="dark" className='navbar'>
      <Container fluid>
        <Link to='/' className='navbar-brand'>POLITO Thesis</Link>
        <Nav className="me-auto">
          <Nav.Link href="/proposals" className={location.pathname === '/proposals' ? 'active' : ''}>Proposals</Nav.Link>
          <Nav.Link href="/applications" className={location.pathname === '/applications' ? 'active' : ''}>Applications</Nav.Link>
        </Nav>
        {loggedInUser ? 
          <LogoutButton logout={props.handleLogout} user={loggedInUser} />
          :
          <Link to='/login' className='btn btn-outline-light'>Login</Link>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;