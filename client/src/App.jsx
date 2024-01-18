import './custom.scss';
import { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import NavHeader from './components/NavBarComponent.jsx';
import { Container } from 'react-bootstrap';
import './App.css'
import NotFound from './components/NotFoundComponent';
import {ProposalComponent, StudentProposalComponent} from './components/ProposalComponent.jsx';
import ProposalsFormComponent from './components/ProposalsFormComponent.jsx';
import ProposalsTableComponent from './components/ProposalsTableComponent.jsx';
import ApplicationsTable from './components/ApplicationsTableComponent.jsx';
import { LoginForm } from './components/LoginComponent.jsx';
import ErrorToast from './components/ErrorToastComponent.jsx';
import ApplicationDetailComponent from './components/ApplicationDetailComponent.jsx';
import API from './API.js';
import HomeComponent from './components/HomeComponent.jsx';
import CancelledProposalMessage from './components/CancelledProposalComponent.jsx';
import RequestsComponent from './components/RequestsComponent.jsx';
import RequestInfo from './components/RequestInfoComponent.jsx';

export const AuthContext = createContext(null);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState(false);


useEffect(() => {
  const checkAuth = async () => {
    const user = await API.getUserInfo(); // we have the user info here
    setLoggedIn(user);
  };
  checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await API.logout();
      setLoggedIn(false);
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
            {loggedIn? <NavHeader handleLogout={handleLogout}/> : <></>}
            <Container fluid className="mt-3">

              <Outlet />
            </Container>
          </>} >
          <Route index
            element={loggedIn? <HomeComponent/> : <LoginForm/>} />

          { loggedIn && loggedIn.role == 'STUDENT' &&
           <><Route path='proposals'
              element={<ProposalsTableComponent setErrorMessage={setErrorMessage}/>} />
              <Route path='proposals/:proposalsId'
              element={<StudentProposalComponent  setErrorMessage={setErrorMessage}/>} />
              <Route path='applications'
              element={<ApplicationsTable  setErrorMessage={setErrorMessage}/>} />
              <Route path='applications/:proposalId'
              element={<ApplicationDetailComponent  setErrorMessage={setErrorMessage}/>} />
              <Route path='applications/null'
              element={<CancelledProposalMessage  setErrorMessage={setErrorMessage}/>} />
              <Route path='requests'
              element={<RequestsComponent setErrorMessage={setErrorMessage}/>} />
            </>
          }
          { loggedIn && loggedIn.role == 'TEACHER' &&
           <><Route path='proposals'
              element={<ProposalsTableComponent  setErrorMessage={setErrorMessage}/>} />
          <Route path='proposals/:proposalsId'
              element={<ProposalComponent  setErrorMessage={setErrorMessage}/>} />
          <Route path='proposals/new'
              element={<ProposalsFormComponent setErrorMessage={setErrorMessage}/>} />
              <Route path='proposals/update'
              element={<ProposalsFormComponent setErrorMessage={setErrorMessage}/>} />
          <Route path='applications'
              element={<ApplicationsTable  setErrorMessage={setErrorMessage}/>}/>
          <Route path='application/:proposalId/:studentId'
              element={<ApplicationDetailComponent  setErrorMessage={setErrorMessage}/>} />
            <Route path='requests'
              element={<RequestsComponent setErrorMessage={setErrorMessage}/>} />
              <Route path='requests/:requestId'
            element={<RequestInfo setErrorMessage={setErrorMessage}/>} />
            </>
          }
          { loggedIn && loggedIn.role == 'CLERK' &&
           <>
            <Route path='requests'
              element={<RequestsComponent setErrorMessage={setErrorMessage}/>} />
            <Route path='requests/:requestId'
            element={<RequestInfo setErrorMessage={setErrorMessage}/>} />
          </>
          }
          <Route path='/login' element={
            loggedIn ? <Navigate replace to={(loggedIn.role == 'CLERK')? '/requests':'/proposals'} /> : <LoginForm />
          }/>
          <Route path='*' element={<NotFound />} />

        </Route>
      </Routes>
    </BrowserRouter>
    </AuthContext.Provider>
    <ErrorToast errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
    </>
  );

}

export default App