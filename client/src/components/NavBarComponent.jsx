import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LogoutButton } from './LoginComponent';
import { useContext, useState } from 'react';
import { AuthContext } from '../App';

function NavHeader(props) {
  const loggedInUser = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  return (
    <Navbar style={{ backgroundColor: loggedInUser && loggedInUser.role === 'TEACHER' ? 'green' : '#fc7a08' }} variant="dark" className='navbar' expand="lg">
      <Container fluid>
        <Link to='/' className='navbar-brand'>POLITO Thesis</Link>
        <Navbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)} />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end"
          style={{
            backgroundColor: loggedInUser && loggedInUser.role === 'TEACHER' ? 'green' : '#fc7a08',
            padding: '10px',
            borderRadius: '10px',
            zIndex: "2"
          }}
        >
          <Nav className="me-auto">
            <Nav.Link href="/proposals" className={location.pathname === '/proposals' ? 'active' : ''}>Proposals</Nav.Link>
            <Nav.Link href="/applications" className={location.pathname === '/applications' ? 'active' : ''}>Applications</Nav.Link>
          </Nav>
          {loggedInUser ?
            <div>
            <Navbar.Text className="view-text">
              {loggedInUser.role === 'TEACHER' ? 'Professor view' : 'Student view'}
            </Navbar.Text>
            <LogoutButton logout={props.handleLogout} user={loggedInUser} />
          </div>
            :
            <></>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
/*return (
  <Navbar bg="primary" variant="dark" className='navbar' expand="lg">
    <Container fluid>
      <Link to='/' className='navbar-brand'>POLITO Thesis</Link>
      <Navbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)} />
      <Navbar.Collapse id="navbar-nav" className="justify-content-end" style={{ backgroundColor: '#fc7a08', padding:'10px', borderRadius:'10px', zIndex:"2"}}>
        <Nav className="me-auto">
          <Nav.Link href="/proposals" className={location.pathname === '/proposals' ? 'active' : ''}>Proposals</Nav.Link>
          <Nav.Link href="/applications" className={location.pathname === '/applications' ? 'active' : ''}>Applications</Nav.Link>
        </Nav>
        {loggedInUser ?
          <LogoutButton logout={props.handleLogout} user={loggedInUser} />
          :
          <></>
        }
      </Navbar.Collapse>
    </Container>
  </Navbar>
);
}*/

export default NavHeader;
