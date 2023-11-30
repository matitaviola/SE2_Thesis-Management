import { useState, useContext, useEffect } from 'react';
import {Form, Button, Container, Row, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

function LoginForm(props) {
  const loggedInUser = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if props.user exists, and if not, redirect to Auth0 login
    if (!loggedInUser) {
      window.location.href = 'http://localhost:3001/login'; // Replace with your external login page URL
    }
  }, [props.user, navigate]);
}

function LogoutButton(props) {
  const navigate = useNavigate();
  const loggedInUser = useContext(AuthContext);

  return (
   <Button onClick={() => { props.logout(); navigate('/') }} className='enbiggen-logout-button'>Log out, {loggedInUser.id}</Button>
  );
}

export { LoginForm, LogoutButton };  