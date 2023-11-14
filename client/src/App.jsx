import './custom.scss';
import { useCallback, useContext, useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import NavHeader from './components/NavBarComponent.jsx';
import { Container, Row, Alert } from 'react-bootstrap';
import './App.css'
import NotFound from './components/NotFoundComponent';
import ProposalComponent from './components/ProposalComponent.jsx';
import ProposalsTableComponent from './components/ProposalsTableComponent.jsx';
import ApplicationsTable from './components/ApplicationsTableComponent.jsx';
import { LoginForm } from './components/LoginComponent.jsx';
import ErrorToast from './components/ErrorToastComponent.jsx';
import ApplicationDetailComponent from './components/ApplicationDetailComponent.jsx';

export const AuthContext = createContext(null);

function App() {

  const [appName, setAppName] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);


useEffect(() => {
    const checkAuth = async () => {
      //const user = await API.getUserInfo(); // we have the user info here
      let user = {
        /*
        role: 'TEACHER',
        id: 'd100003'
        */
        role: 'STUDENT',
        id: 's200000'
        
      }
      setLoggedIn(user);

    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      //let user = await API.login(credentials);
      let user = {
        /*
        role: 'TEACHER',
        id: 'd100003'
        */
        role: 'STUDENT',
        id: 's200000'
      }
      setLoggedIn(user)
    } catch (err) {
      setErrorMessage(`Error during log in : ${err}`);
    }

  };

  const handleLogout = async () => {
    try {
      //await API.logout();
      setLoggedIn(false)
    } catch (err) {
      setErrorMessage(`Error during log out : ${err}`);
    }

  };

  return (
    <>
    <AuthContext.Provider value={loggedIn}>
    <BrowserRouter>
      <Routes>
        <Route element={
          <>
            <NavHeader handleLogout={handleLogout}/>
            <Container fluid className="mt-3">

              <Outlet />
            </Container>
          </>} >
          <Route index
            element={<Navigate replace to='/login' />} />

          { loggedIn && loggedIn.role == 'STUDENT' &&
           <><Route path='proposals'
              element={<ProposalsTableComponent/>} />
              <Route path='applications'
              element={<ApplicationsTable/>} />
              </>
              }
          { loggedIn && loggedIn.role == 'TEACHER' &&
           <><Route path='proposals'
              element={<ProposalsTableComponent/>} />
          <Route path='proposals/:proposalsId'
              element={<ProposalComponent/>} />
          <Route path='proposals/new'
              element={<ProposalComponent />} />
          <Route path='applications'
              element={<ApplicationsTable/>}/>
          <Route path='application/:proposalId/:studentId'
              element={<ApplicationDetailComponent/>} />
              </>
              }
          <Route path='*' element={<NotFound />} />
          <Route path='/login' element={
            loggedIn ? <Navigate replace to='/proposals' /> : <LoginForm login={handleLogin} />
          } />

        </Route>
      </Routes>
    </BrowserRouter>
    </AuthContext.Provider>
    <ErrorToast errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
    </>


  );


}

export default App