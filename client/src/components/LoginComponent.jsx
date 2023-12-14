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
  const loggedInUser = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await props.logout();
    navigate('/login');
  };

  const buttonClassName = loggedInUser.role === 'TEACHER' ? 'enbiggen-logout-button-teacher' : 'enbiggen-logout-button-student'; 

  return (
      <Button variant="light" onClick={handleLogoutClick} className={`text-center ${buttonClassName}`}>
        Logout
      </Button>
  );
}

export { LoginForm, LogoutButton };  