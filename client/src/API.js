const SERVER_URL = 'http://localhost:3001';

//#region Login
const login = async (credentials) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'LOGIN'
  };
  const response = await fetch(SERVER_URL + `/api/login`, {
    method: 'POST',
    headers: reqheader,
    body: JSON.stringify({
      'credentials': credentials
    }),
  });
  if (!response.ok) {
    throw new Error(`Login error! status: ${response.status}`);
  }
  const userData = await response.json();
  return userData;
}
const getUserInfo = async () => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'SESSION'
  };
  const response = await fetch(SERVER_URL + `/api/login`, {
    headers: reqheader,
  });
  if (!response.ok) {
    throw new Error(`Login error! status: ${response.status}`);
  }
  const userData = await response.json();
  return userData.id? userData : false;
}
const logout = async () => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'LOGOUT'
  };
  const response = await fetch(SERVER_URL + `/api/login`, {
    method: 'DELETE',
    headers: reqheader,
  });
  if (!response.ok) {
    throw new Error(`Logout error! status: ${response.status}`);
  }
  return {success:true};
}
//#endregion

//#region Student
const getStudentData = async (proposalId, studentId) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, {
    headers: reqheader
  });
  const studentDataJson = await response.json();
  if(response.ok) {
    return studentDataJson;
  }
  else{
    throw new Error("Error on getting the studentsData: "+studentDataJson);
  }
}
//#endregion

//#region Proposal
const getProposals = async (user) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  let response, proposalsJson;
  if(user.role == 'TEACHER'){
    response = await fetch(SERVER_URL + `/api/proposals/teacher/${user.id}`, {headers:reqheader});
    proposalsJson = await response.json();
  } else{
    throw new Error("Error on getting the proposals: Invalid role");
  }
  if(response.ok) {
    console.log(proposalsJson);
    return(proposalsJson);
  }
  else{
    throw new Error("Error on getting the proposals: "+proposalsJson);
  }
}

const getStudentProposals = async (studentId, filter) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };

  let path = '?';
  Object.keys(filter).filter(k => filter[k]).forEach(k =>{
    path = path.concat(`${k}=${filter[k]}&`);
  })
  path = path.slice(0, -1);
  console.log(path);

  let response = await fetch(SERVER_URL + `/api/proposals/students/${studentId}${path}`, {headers:reqheader});
  let responseJson = await response.json();


  if(response.ok) {
    console.log(responseJson);
    return responseJson;
  }
  else{
    throw new Error("Error on getting the proposals: "+responseJson);
  }
}

const createProposal = async (proposal, user) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE':user.role
  };
  const response = await fetch(`${SERVER_URL}/api/proposals`, {
    method: 'POST',
    headers: reqheader,
    body: JSON.stringify(proposal)
  });
  if(!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const deleteProposal = async (proposal) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  const response = await fetch(SERVER_URL + `/api/proposals/${proposal}`, {
      method: 'DELETE',
      headers: reqheader
  });

  if (!response.ok) {
      const errorJson = await response.json();
      throw new Error("Error on deleting the proposal: " + errorJson);
  }
}

//#endregion

//#region Application
const getApplications = async (user) =>{
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE':user.role
  };
  let apiURL = SERVER_URL +"/api/applications/";

  if(user.role == 'TEACHER'){
    apiURL += `teacher/${user.id}`;
  }else if(user.role == 'STUDENT'){
    apiURL += `student/${user.id}`;
  }else{
    throw new Error("Error on getting the applications: Invalid role");
  }
  const response = await fetch(apiURL, {
    headers: reqheader
  });
  const applicationsJson = await response.json();

  if(response.ok) {
    return applicationsJson.map(app => {
      return {"studentId": app.studentId, "proposal": app.proposal, "status":app.status
      //we'll need to add here the other fields of the application, when we'll know them
      };
    });
  }
  else{
    throw new Error("Error on getting the applications: "+applicationsJson);
  }
}

const updateApplicationStatus = async (proposalId, studentId, statusSet) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  //Choose if accept or reject based on the status passed
  const status = statusSet? "Accepted" : "Rejected";
  console.log(status);
  const response = await fetch(SERVER_URL + `/api/application/${proposalId}/${studentId}`, {
      method: 'PATCH',
      headers: reqheader,
      body: JSON.stringify({
        'status': status
      }),
  });

  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  return {ok:true};
};

const addApplication = async (proposalId, studentId) => {
  const reqheader = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };
  const response = await fetch(SERVER_URL + `/api/proposals/${proposalId}/${studentId}`, {
    method: 'POST',
    headers: reqheader,
    body: JSON.stringify({ proposalId, studentId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
    
  return {ok:true};
  
} 


//#endregion

const API = {login, getUserInfo, logout, getProposals, createProposal, deleteProposal, getApplications, getStudentData, updateApplicationStatus, getStudentProposals, addApplication};
export default API;

