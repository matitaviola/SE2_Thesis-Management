import { useContext, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

function LoginForm() {
  const loggedInUser = useContext(AuthContext);
  useEffect(() => {
    if (!loggedInUser) {
      window.location.href = 'http://localhost:3001/login';
    }
  }, [loggedInUser]);
}

function LogoutButton(props) {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await props.logout();
    navigate('/login');
  };

  return (
    <Button variant="light" onClick={handleLogoutClick} className='enbiggen-logout-button text-center'>
      Logout
    </Button>
  );
}

export { LoginForm, LogoutButton };  