import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const [appName, setAppName] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);


useEffect(() => {
    const checkAuth = async () => {
      //const user = await API.getUserInfo(); // we have the user info here
      let user = {
        
        role: 'TEACHER',
        id: 'd100003'
        /*
        role: 'STUDENT',
        id: 's200000'
        */
      }
      setLoggedIn(user);
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      //let user = await API.login(credentials);
      let user = {
        role: 'TEACHER',
        id: 'd100003'
        /*
        role: 'STUDENT',
        id: 's200000'
        */
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
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
